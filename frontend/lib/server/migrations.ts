/**
 * Versioned migration + seed runner (used by scripts/db/*.ts and the integration tests).
 *
 * - Migrations: backend/postgres/migrations/NNNN_*.sql, applied in filename order, each in its
 *   own transaction, recorded in schema_migrations with a SHA-256 checksum. An applied file
 *   whose contents changed is a hard error (write a new migration instead).
 * - Seeds: the original demo seed files in backend/postgres/seeds/*_seed_*.sql (source of truth
 *   for the demo catalog, including project_components). They are standard SQL and are applied
 *   unmodified, once each, recorded in seed_history. Re-running is a no-op, which matters
 *   because banners/promo_cards/deals/project_components have no natural unique key and would
 *   otherwise duplicate.
 * - A transaction-scoped advisory lock prevents two deploys from migrating concurrently.
 */
import { createHash } from 'crypto';
import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import type { ClientBase } from 'pg';

const LOCK_KEY = 4_281_507_331; // arbitrary constant for pg_advisory_xact_lock

export interface RepoPaths {
  migrationsDir: string;
  seedsDir: string;
}

export function repoPaths(repoRoot: string): RepoPaths {
  return {
    migrationsDir: path.join(repoRoot, 'backend', 'postgres', 'migrations'),
    seedsDir: path.join(repoRoot, 'backend', 'postgres', 'seeds'),
  };
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function listMigrationFiles(dir: string): string[] {
  return readdirSync(dir).filter((f) => /^\d{4}_[\w-]+\.sql$/.test(f)).sort();
}

export function listSeedFiles(dir: string): string[] {
  // Only the INSERT-only demo seed files.
  return readdirSync(dir).filter((f) => /^\d{14}_seed_[\w-]+\.sql$/.test(f)).sort();
}

async function ensureBookkeeping(client: ClientBase) {
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`);
  await client.query(`CREATE TABLE IF NOT EXISTS seed_history (
    filename text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`);
}

type Applied = Map<string, string>;

async function applyFiles(
  client: ClientBase,
  dir: string,
  files: string[],
  table: 'schema_migrations' | 'seed_history',
  keyCol: 'version' | 'filename',
  log: (msg: string) => void,
): Promise<string[]> {
  const applied: string[] = [];
  for (const file of files) {
    const sql = readFileSync(path.join(dir, file), 'utf8');
    const checksum = sha256(sql);
    await client.query('BEGIN');
    try {
      await client.query('SELECT pg_advisory_xact_lock($1)', [LOCK_KEY]);
      const existing = await client.query(`SELECT checksum FROM ${table} WHERE ${keyCol} = $1`, [file]);
      if (existing.rowCount) {
        await client.query('ROLLBACK');
        if (existing.rows[0].checksum !== checksum) {
          throw new Error(`${file} was already applied but its contents changed. Add a new file instead of editing it.`);
        }
        continue;
      }
      await client.query(sql);
      await client.query(`INSERT INTO ${table} (${keyCol}, checksum) VALUES ($1, $2)`, [file, checksum]);
      await client.query('COMMIT');
      applied.push(file);
      log(`applied ${file}`);
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    }
  }
  return applied;
}

export async function runMigrations(client: ClientBase, dir: string, log: (m: string) => void = () => {}) {
  await ensureBookkeeping(client);
  return applyFiles(client, dir, listMigrationFiles(dir), 'schema_migrations', 'version', log);
}

export async function runSeeds(client: ClientBase, dir: string, log: (m: string) => void = () => {}) {
  await ensureBookkeeping(client);
  const migrated = await client.query(`SELECT 1 FROM schema_migrations LIMIT 1`);
  if (!migrated.rowCount) throw new Error('Run migrations before seeding.');
  return applyFiles(client, dir, listSeedFiles(dir), 'seed_history', 'filename', log);
}

export async function migrationStatus(client: ClientBase, paths: RepoPaths) {
  await ensureBookkeeping(client);
  const m: Applied = new Map((await client.query('SELECT version, checksum FROM schema_migrations')).rows.map((r) => [r.version, r.checksum]));
  const s: Applied = new Map((await client.query('SELECT filename, checksum FROM seed_history')).rows.map((r) => [r.filename, r.checksum]));
  return {
    migrations: listMigrationFiles(paths.migrationsDir).map((f) => ({ file: f, applied: m.has(f) })),
    seeds: listSeedFiles(paths.seedsDir).map((f) => ({ file: f, applied: s.has(f) })),
  };
}

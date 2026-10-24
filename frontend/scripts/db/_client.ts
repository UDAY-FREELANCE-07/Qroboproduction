/**
 * Shared connection helper for the db:* CLI scripts.
 * Uses MIGRATION_DATABASE_URL (elevated migration role) when set, otherwise DATABASE_URL.
 * TLS rules are identical to the app (lib/server/config.ts). Secrets are read from the
 * environment only, e.g. `npx tsx --env-file=.env.migrate scripts/db/migrate.ts`.
 */
import path from 'path';
import { Client } from 'pg';
import { loadDbConfig } from '../../lib/server/config';
import { repoPaths } from '../../lib/server/migrations';

export const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
export const PATHS = repoPaths(REPO_ROOT);

export async function connect(): Promise<Client> {
  const env = { ...process.env, DATABASE_URL: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL };
  const cfg = loadDbConfig(env);
  const client = new Client({
    connectionString: cfg.connectionString,
    ssl: cfg.ssl,
    connectionTimeoutMillis: cfg.connectionTimeoutMillis,
    application_name: 'qrobo-migrate',
  });
  await client.connect();
  return client;
}

export async function main(fn: (client: Client) => Promise<void>) {
  let client: Client | undefined;
  try {
    client = await connect();
    await fn(client);
  } catch (err) {
    // Print the message only; never the connection string.
    console.error(`ERROR: ${(err as Error).message}`);
    process.exitCode = 1;
  } finally {
    await client?.end().catch(() => undefined);
  }
}

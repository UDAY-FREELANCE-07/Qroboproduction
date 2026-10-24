import path from 'path';
import { randomBytes } from 'crypto';
import { Client, Pool } from 'pg';
import { inject } from 'vitest';
import { runMigrations, runSeeds, repoPaths } from '@/lib/server/migrations';
import { setPoolForTesting } from '@/lib/server/db';

export const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
export const PATHS = repoPaths(REPO_ROOT);
export const ORIGIN = 'http://localhost:3000';

export const dbAvailable = () => Boolean(inject('pgAdminUrl'));

export interface TestDb {
  pool: Pool;
  url: string;
  drop: () => Promise<void>;
}

/** Creates an isolated database, applies migrations (+ seeds by default) and wires the app pool to it. */
export async function createTestDb({ seed = true }: { seed?: boolean } = {}): Promise<TestDb> {
  const adminUrl = inject('pgAdminUrl');
  if (!adminUrl) throw new Error('No test PostgreSQL server');
  const name = `qrobo_test_${randomBytes(4).toString('hex')}`;
  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();
  await admin.query(`CREATE DATABASE ${name}`);
  await admin.end();

  const url = adminUrl.replace(/\/postgres$/, `/${name}`);
  const client = new Client({ connectionString: url });
  await client.connect();
  await runMigrations(client, PATHS.migrationsDir);
  if (seed) await runSeeds(client, PATHS.seedsDir);
  await client.end();

  const pool = new Pool({ connectionString: url, max: 5 });
  process.env.DATA_SOURCE = 'postgres';
  setPoolForTesting(pool);

  return {
    pool,
    url,
    drop: async () => {
      setPoolForTesting(undefined);
      await pool.end();
      const a = new Client({ connectionString: adminUrl });
      await a.connect();
      await a.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
      await a.end();
    },
  };
}

type Handler = (req: Request) => Promise<Response>;

export interface CallOptions {
  method?: string;
  body?: unknown;
  cookie?: string;
  origin?: string | null;
  ip?: string;
  contentType?: string;
  headers?: Record<string, string>;
}

export async function call(handler: Handler, urlPath: string, opts: CallOptions = {}) {
  const headers: Record<string, string> = { host: 'localhost:3000', 'x-real-ip': opts.ip ?? '10.0.0.1', ...(opts.headers ?? {}) };
  if (opts.origin !== null) headers.origin = opts.origin ?? ORIGIN;
  if (opts.cookie) headers.cookie = opts.cookie;
  const method = opts.method ?? (opts.body !== undefined ? 'POST' : 'GET');
  if (method !== 'GET') headers['content-type'] = opts.contentType ?? 'application/json';
  const req = new Request(`${ORIGIN}${urlPath}`, {
    method,
    headers,
    body: method === 'GET' ? undefined : typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body ?? {}),
  });
  const res = await handler(req);
  const json = await res.json().catch(() => null);
  const setCookie = res.headers.get('set-cookie');
  const cookie = setCookie ? setCookie.split(';')[0] : undefined;
  return { status: res.status, json, cookie, headers: res.headers };
}

let counter = 0;
export const uniqueEmail = (prefix = 'user') => `${prefix}.${Date.now()}.${++counter}@test.qrobo.local`;
export const uniqueIp = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${++counter % 250}`;

import 'server-only';
import { Pool, types, type PoolClient, type QueryResultRow } from 'pg';
import { ConfigError, loadDbConfig, resolveDataSource, type DbConfig } from './config';

// NUMERIC (monetary columns) -> number, matching the shapes the UI already uses
// (e.g. `product.price.toFixed(0)`). Money arithmetic on the server is done in integer paise.
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)) as unknown as number);
// INT8 (COUNT(*) results) -> number. Counts in this app stay far below 2^53.
types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10)) as unknown as number);

export class DataSourceDisabledError extends Error {
  constructor() {
    super('PostgreSQL data source is not enabled (DATA_SOURCE=mock).');
    this.name = 'DataSourceDisabledError';
  }
}

export function createPool(config: DbConfig): Pool {
  const pool = new Pool({
    connectionString: config.connectionString,
    ssl: config.ssl,
    max: config.poolMax,
    connectionTimeoutMillis: config.connectionTimeoutMillis,
    idleTimeoutMillis: config.idleTimeoutMillis,
    statement_timeout: config.statementTimeoutMillis,
    application_name: 'qrobo-web',
  });
  // An idle client erroring (e.g. RDS failover) must not crash the process.
  pool.on('error', (err) => {
    console.error('[db] idle client error:', err.message);
  });
  return pool;
}

// Survive Next.js dev hot reloads without leaking pools.
const globalForDb = globalThis as unknown as { __qroboPool?: Pool };

/** Returns the shared pool. Throws DataSourceDisabledError in mock mode, ConfigError if misconfigured. */
export function getPool(): Pool {
  if (resolveDataSource() !== 'postgres') throw new DataSourceDisabledError();
  if (!globalForDb.__qroboPool) {
    globalForDb.__qroboPool = createPool(loadDbConfig());
  }
  return globalForDb.__qroboPool;
}

/** Test hook: inject or reset the pool. */
export function setPoolForTesting(pool: Pool | undefined) {
  globalForDb.__qroboPool = pool;
}

export async function query<T extends QueryResultRow = any>(text: string, params: unknown[] = []) {
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* connection may already be broken */
    }
    throw err;
  } finally {
    client.release();
  }
}

export type DbStatus = 'ok' | 'disabled' | 'not_configured' | 'unavailable';

/** Minimal health probe; never returns configuration details. */
export async function getDbStatus(): Promise<DbStatus> {
  let pool: Pool;
  try {
    pool = getPool();
  } catch (err) {
    if (err instanceof DataSourceDisabledError) return 'disabled';
    if (err instanceof ConfigError) {
      console.error('[db] configuration error:', err.message);
      return 'not_configured';
    }
    throw err;
  }
  try {
    await pool.query('SELECT 1');
    return 'ok';
  } catch (err) {
    console.error('[db] health check failed:', (err as Error).message);
    return 'unavailable';
  }
}

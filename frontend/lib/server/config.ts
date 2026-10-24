/**
 * Server-side configuration validation for the PostgreSQL data source.
 *
 * This module is intentionally free of `server-only` / Next.js imports so it can be
 * unit-tested and reused by the migration scripts. It must never be imported by
 * client components (it reads DATABASE_URL); the runtime database module
 * (`lib/server/db.ts`) is guarded with `server-only`.
 */
import { readFileSync } from 'fs';

export type DataSource = 'mock' | 'postgres';

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

type Env = Record<string, string | undefined>;

/** Resolve DATA_SOURCE. Defaults to `mock`; any other unknown value is a hard error. */
export function resolveDataSource(env: Env = process.env): DataSource {
  const raw = (env.DATA_SOURCE ?? '').trim().toLowerCase();
  if (raw === '' || raw === 'mock') return 'mock';
  if (raw === 'postgres') return 'postgres';
  throw new ConfigError(`DATA_SOURCE must be "mock" or "postgres" (got "${raw}").`);
}

export interface DbConfig {
  connectionString: string;
  ssl: false | { rejectUnauthorized: true; ca?: string };
  sslMode: 'verify-full' | 'disable';
  poolMax: number;
  connectionTimeoutMillis: number;
  idleTimeoutMillis: number;
  statementTimeoutMillis: number;
}

// Values copied from .env.example templates or obviously unfilled placeholders.
const PLACEHOLDER_PATTERNS = [/placeholder/i, /your[-_]/i, /change[-_]?me/i, /[<>]/, /example\.(com|org)/i];
const PLACEHOLDER_HOSTS = new Set(['host', 'hostname', 'db-host', 'rds-endpoint']);
// URL.hostname keeps the brackets for IPv6 literals.
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function looksLikePlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((re) => re.test(value));
}

function intFromEnv(env: Env, key: string, fallback: number, min: number, max: number): number {
  const raw = env[key];
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new ConfigError(`${key} must be an integer between ${min} and ${max}.`);
  }
  return n;
}

/**
 * Validate and build the pg Pool configuration. Throws ConfigError with a message that
 * never contains the connection string or password.
 */
export function loadDbConfig(
  env: Env = process.env,
  readFile: (path: string) => string = (p) => readFileSync(p, 'utf8'),
): DbConfig {
  const isProduction = env.NODE_ENV === 'production';
  const url = env.DATABASE_URL?.trim();
  if (!url) {
    throw new ConfigError('DATA_SOURCE=postgres but DATABASE_URL is not set.');
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ConfigError('DATABASE_URL is not a valid URL.');
  }
  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new ConfigError('DATABASE_URL must use the postgres:// or postgresql:// scheme.');
  }
  const host = parsed.hostname;
  const user = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);
  const database = parsed.pathname.replace(/^\//, '');
  if (!host || PLACEHOLDER_HOSTS.has(host.toLowerCase()) || looksLikePlaceholder(host)) {
    throw new ConfigError('DATABASE_URL host looks like a placeholder. Set the real database endpoint.');
  }
  if (!user || !database || looksLikePlaceholder(user) || looksLikePlaceholder(database)) {
    throw new ConfigError('DATABASE_URL user/database look missing or like placeholders.');
  }
  if (looksLikePlaceholder(password) || (isProduction && (password === '' || password === 'password'))) {
    throw new ConfigError('DATABASE_URL password is missing or looks like a placeholder.');
  }
  // TLS is controlled only by DATABASE_SSL so that a stray ?sslmode=... cannot weaken it.
  for (const key of ['sslmode', 'ssl', 'sslrootcert', 'sslcert', 'sslkey', 'uselibpqcompat']) {
    if (parsed.searchParams.has(key)) {
      throw new ConfigError(`Remove "${key}" from DATABASE_URL; configure TLS with DATABASE_SSL instead.`);
    }
  }

  const sslRaw = (env.DATABASE_SSL ?? '').trim().toLowerCase();
  if (sslRaw !== 'verify-full' && sslRaw !== 'disable') {
    throw new ConfigError('DATABASE_SSL must be set explicitly to "verify-full" or "disable".');
  }
  // In production, plain-text connections are only allowed to a database on the same machine
  // (self-hosted PostgreSQL on the EC2 instance): that traffic never leaves the loopback interface.
  if (sslRaw === 'disable' && isProduction && !LOOPBACK_HOSTS.has(host.toLowerCase())) {
    throw new ConfigError(
      'DATABASE_SSL=disable is not allowed when NODE_ENV=production unless the database host is localhost/127.0.0.1/::1.',
    );
  }

  let ssl: DbConfig['ssl'] = false;
  if (sslRaw === 'verify-full') {
    // Certificate chain AND hostname are verified (Node's default checkServerIdentity).
    ssl = { rejectUnauthorized: true };
    const caFile = env.DATABASE_SSL_CA_FILE?.trim();
    if (caFile) {
      let ca: string;
      try {
        ca = readFile(caFile);
      } catch {
        throw new ConfigError('DATABASE_SSL_CA_FILE could not be read.');
      }
      if (!ca.includes('BEGIN CERTIFICATE')) {
        throw new ConfigError('DATABASE_SSL_CA_FILE does not contain a PEM certificate bundle.');
      }
      ssl = { rejectUnauthorized: true, ca };
    }
  }

  return {
    connectionString: url,
    ssl,
    sslMode: sslRaw,
    poolMax: intFromEnv(env, 'DATABASE_POOL_MAX', 10, 1, 100),
    connectionTimeoutMillis: intFromEnv(env, 'DATABASE_CONNECT_TIMEOUT_MS', 5000, 500, 60000),
    idleTimeoutMillis: intFromEnv(env, 'DATABASE_IDLE_TIMEOUT_MS', 30000, 1000, 600000),
    statementTimeoutMillis: intFromEnv(env, 'DATABASE_STATEMENT_TIMEOUT_MS', 15000, 100, 300000),
  };
}

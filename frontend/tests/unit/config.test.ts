import { describe, expect, it } from 'vitest';
import { ConfigError, loadDbConfig, resolveDataSource } from '@/lib/server/config';

const SECRET = 'S3cr3t-Value-123';
const good = { DATABASE_URL: `postgres://qrobo_app:${SECRET}@qrobo-db.abc123.ap-south-1.rds.amazonaws.com:5432/qrobo`, DATABASE_SSL: 'verify-full' };

function expectConfigError(env: Record<string, string | undefined>, re: RegExp, readFile?: (p: string) => string) {
  try {
    loadDbConfig(env, readFile);
  } catch (err) {
    expect(err).toBeInstanceOf(ConfigError);
    expect((err as Error).message).toMatch(re);
    expect((err as Error).message).not.toContain(SECRET);
    return;
  }
  throw new Error('expected ConfigError');
}

describe('resolveDataSource', () => {
  it('defaults to mock', () => {
    expect(resolveDataSource({})).toBe('mock');
    expect(resolveDataSource({ DATA_SOURCE: ' Mock ' })).toBe('mock');
  });
  it('accepts postgres', () => expect(resolveDataSource({ DATA_SOURCE: 'postgres' })).toBe('postgres'));
  it('rejects unknown values instead of silently falling back', () => {
    expect(() => resolveDataSource({ DATA_SOURCE: 'firebase' })).toThrow(ConfigError);
  });
});

describe('loadDbConfig', () => {
  it('requires DATABASE_URL', () => expectConfigError({ DATABASE_SSL: 'verify-full' }, /DATABASE_URL is not set/));

  it('rejects the .env.example placeholder', () =>
    expectConfigError({ DATABASE_URL: 'postgresql://qrobo_app:CHANGE_ME@your-rds-endpoint.ap-south-1.rds.amazonaws.com:5432/qrobo', DATABASE_SSL: 'verify-full' }, /placeholder/));

  it('rejects placeholder hosts like "host"', () =>
    expectConfigError({ DATABASE_URL: `postgresql://user:${SECRET}@host:5432/dbname`, DATABASE_SSL: 'verify-full' }, /placeholder/));

  it('rejects non-postgres schemes', () => expectConfigError({ ...good, DATABASE_URL: 'mysql://a:b@db.internal/x' }, /scheme/));

  it('requires DATABASE_SSL to be explicit', () => expectConfigError({ DATABASE_URL: good.DATABASE_URL }, /DATABASE_SSL must be set/));

  it('refuses sslmode in the URL (cannot downgrade TLS)', () =>
    expectConfigError({ ...good, DATABASE_URL: `${good.DATABASE_URL}?sslmode=no-verify` }, /sslmode/));

  it('refuses DATABASE_SSL=disable in production', () =>
    expectConfigError({ ...good, DATABASE_SSL: 'disable', NODE_ENV: 'production' }, /not allowed/));

  it('verify-full always verifies the certificate', () => {
    const cfg = loadDbConfig(good);
    expect(cfg.ssl).toEqual({ rejectUnauthorized: true });
    expect(cfg.poolMax).toBe(10);
  });

  it('loads a CA bundle when configured', () => {
    const pem = '-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----\n';
    const cfg = loadDbConfig({ ...good, DATABASE_SSL_CA_FILE: '/etc/ssl/rds/global-bundle.pem' }, () => pem);
    expect(cfg.ssl).toEqual({ rejectUnauthorized: true, ca: pem });
  });

  it('rejects a CA file that is not PEM', () =>
    expectConfigError({ ...good, DATABASE_SSL_CA_FILE: '/tmp/x' }, /PEM/, () => 'not a certificate'));

  it('reports an unreadable CA file without leaking secrets', () =>
    expectConfigError({ ...good, DATABASE_SSL_CA_FILE: '/missing.pem' }, /could not be read/, () => {
      throw new Error('ENOENT');
    }));

  it('allows disable for local development only', () => {
    const cfg = loadDbConfig({ ...good, DATABASE_URL: 'postgres://dev:devpass@localhost:5432/qrobo_dev', DATABASE_SSL: 'disable', NODE_ENV: 'development' });
    expect(cfg.ssl).toBe(false);
  });

  it('validates pool limits', () => expectConfigError({ ...good, DATABASE_POOL_MAX: '500' }, /DATABASE_POOL_MAX/));
});

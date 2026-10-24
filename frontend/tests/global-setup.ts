/**
 * Starts ONE disposable local PostgreSQL server (embedded-postgres binaries, no Docker, no AWS)
 * for the integration tests. Each test file creates its own database on it.
 * Data lives in the OS temp directory and is deleted on teardown.
 *
 * Set QROBO_SKIP_DB_TESTS=1 to skip (integration tests then report as skipped, not passed).
 */
import { mkdtempSync, rmSync } from 'fs';
import os from 'os';
import path from 'path';
import { randomBytes } from 'crypto';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    pgAdminUrl: string | null;
  }
}

export default async function setup(project: TestProject) {
  if (process.env.QROBO_SKIP_DB_TESTS) {
    project.provide('pgAdminUrl', null);
    return;
  }
  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const dir = mkdtempSync(path.join(os.tmpdir(), 'qrobo-test-pg-'));
  const port = 56000 + Math.floor(Math.random() * 2000);
  const password = randomBytes(12).toString('hex');
  const pg = new EmbeddedPostgres({ databaseDir: dir, user: 'postgres', password, port, persistent: false, onLog: () => {}, onError: () => {} });
  await pg.initialise();
  await pg.start();
  project.provide('pgAdminUrl', `postgres://postgres:${password}@127.0.0.1:${port}/postgres`);

  return async () => {
    try {
      await pg.stop();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };
}

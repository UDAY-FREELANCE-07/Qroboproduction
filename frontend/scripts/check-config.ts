/**
 * Preflight configuration check (no database connection, prints no secrets).
 * Used as systemd ExecStartPre so a misconfigured server never starts:
 *   npx tsx scripts/check-config.ts --expect postgres
 * `--expect` must equal the DATA_SOURCE the bundle was built with.
 */
import { runStartupChecks } from '../lib/server/startup-check';

const idx = process.argv.indexOf('--expect');
const expected = idx > -1 ? process.argv[idx + 1] : process.env.DATA_SOURCE || 'mock';
const problems = runStartupChecks({ ...process.env, NODE_ENV: 'development' }, () => undefined, expected);
process.exitCode = problems.length ? 1 : 0;

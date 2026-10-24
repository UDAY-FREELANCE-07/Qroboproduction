import { loadDbConfig, resolveDataSource } from './config';
import { loadEmailConfig } from './email/config';

/**
 * Startup checks (run once per server process from instrumentation.ts).
 *  - The runtime DATA_SOURCE must equal the value the bundle was built with; otherwise the
 *    browser would keep using mock data while the server is in PostgreSQL mode (or vice versa).
 *  - In PostgreSQL mode the database configuration must be valid (no placeholders, TLS set).
 * In production a failed check exits the process so the misconfiguration is visible
 * (systemd shows the failure; health checks never pass). Nothing silently falls back to mock data.
 */
export function runStartupChecks(
  env: Record<string, string | undefined> = process.env,
  exit: (code: number) => void = process.exit,
  // Must be the literal `process.env.NEXT_PUBLIC_...` expression so Next.js inlines the BUILD-TIME
  // value; reading it through `env` would only see the runtime environment.
  builtDataSource: string = process.env.NEXT_PUBLIC_QROBO_DATA_SOURCE || 'mock',
) {
  const problems: string[] = [];
  let runtime: string;
  try {
    runtime = resolveDataSource(env);
  } catch (err) {
    runtime = 'invalid';
    problems.push((err as Error).message);
  }
  const built = builtDataSource;
  if (runtime !== 'invalid' && runtime !== built) {
    problems.push(`This build uses DATA_SOURCE=${built} but the server was started with DATA_SOURCE=${runtime}. Rebuild with the same value.`);
  }
  if (runtime === 'postgres') {
    try {
      loadDbConfig(env);
    } catch (err) {
      problems.push((err as Error).message);
    }
    try {
      const email = loadEmailConfig(env);
      if (env.NODE_ENV === 'production' && email.provider === 'log') {
        console.warn('[qrobo] EMAIL_PROVIDER=log: emails are only written to the server log, nothing is delivered.');
      }
    } catch (err) {
      problems.push((err as Error).message);
    }
  }

  if (!problems.length) {
    console.log(`[qrobo] data source: ${built}`);
    return problems;
  }
  for (const p of problems) console.error(`[qrobo] configuration error: ${p}`);
  if (env.NODE_ENV === 'production') exit(1);
  return problems;
}

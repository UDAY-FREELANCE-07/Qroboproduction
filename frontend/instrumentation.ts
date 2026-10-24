/**
 * Next.js instrumentation hook. The Node-only startup checks live in
 * lib/server/startup-check.ts; the NEXT_RUNTIME guard lets webpack drop them from the
 * Edge bundle (they use `fs`).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runStartupChecks } = await import('./lib/server/startup-check');
    runStartupChecks();
  }
}

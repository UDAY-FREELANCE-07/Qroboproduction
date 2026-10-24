/**
 * Deliver queued emails (retries included). Run from cron / a systemd timer every minute in production:
 *   npx tsx scripts/email/flush.ts
 * Uses the app's DATABASE_URL / DATABASE_SSL and EMAIL_* settings.
 */
import { Pool } from 'pg';
import { loadDbConfig } from '../../lib/server/config';
import { loadEmailConfig } from '../../lib/server/email/config';
import { deliverPending } from '../../lib/server/email/outbox';
import { createTransport } from '../../lib/server/email/transport';

(async () => {
  const db = loadDbConfig();
  const pool = new Pool({ connectionString: db.connectionString, ssl: db.ssl, max: 2, application_name: 'qrobo-email' });
  try {
    const send = createTransport(loadEmailConfig());
    let total = { sent: 0, failed: 0 };
    for (;;) {
      const r = await deliverPending(pool, send, 50);
      total = { sent: total.sent + r.sent, failed: total.failed + r.failed };
      if (r.sent + r.failed < 50) break;
    }
    console.log(`email flush: sent ${total.sent}, failed ${total.failed}`);
  } catch (err) {
    console.error(`ERROR: ${(err as Error).message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

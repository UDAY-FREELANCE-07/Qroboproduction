/**
 * Transactional email outbox.
 *  - enqueueEmail(): call INSIDE the business transaction; the email exists only if the event commits.
 *  - deliverPending(): sends due messages (FOR UPDATE SKIP LOCKED, safe to run concurrently),
 *    retries with backoff, gives up after MAX_ATTEMPTS.
 *  - kickOutbox(): fire-and-forget delivery after a request commits. Failures stay queued and are
 *    retried by the next kick or by `npm run email:flush` (cron/systemd timer in production).
 */
import type { Pool } from 'pg';
import type { RenderedEmail } from './templates';
import type { SendFn } from './transport';

export interface Queryable {
  query: (text: string, params?: unknown[]) => Promise<{ rows: any[]; rowCount: number | null }>;
}

export const MAX_ATTEMPTS = 5;

export async function enqueueEmail(db: Queryable, to: string, email: RenderedEmail): Promise<void> {
  await db.query(
    `INSERT INTO email_outbox (to_email, template, subject, html, text_body) VALUES ($1, $2, $3, $4, $5)`,
    [to.toLowerCase(), email.template, email.subject, email.html, email.text],
  );
}

export async function deliverPending(pool: Pool, send: SendFn, limit = 20): Promise<{ sent: number; failed: number }> {
  // Messages stuck in "sending" (process crashed mid-send) become due again after 10 minutes.
  await pool.query(`UPDATE email_outbox SET status = 'pending' WHERE status = 'sending' AND next_attempt_at < now() - interval '10 minutes'`);

  const claimed = await pool.query(
    `UPDATE email_outbox SET status = 'sending', attempts = attempts + 1, next_attempt_at = now()
      WHERE id IN (
        SELECT id FROM email_outbox WHERE status = 'pending' AND next_attempt_at <= now()
         ORDER BY created_at LIMIT $1 FOR UPDATE SKIP LOCKED)
      RETURNING id, to_email, subject, html, text_body, attempts`,
    [limit],
  );

  let sent = 0;
  let failed = 0;
  for (const m of claimed.rows) {
    try {
      await send({ to: m.to_email, subject: m.subject, html: m.html, text: m.text_body });
      await pool.query(`UPDATE email_outbox SET status = 'sent', sent_at = now(), last_error = NULL WHERE id = $1`, [m.id]);
      sent++;
    } catch (err) {
      failed++;
      const final = m.attempts >= MAX_ATTEMPTS;
      // Exponential backoff: 1, 2, 4, 8 minutes.
      await pool.query(
        `UPDATE email_outbox SET status = $2, last_error = $3, next_attempt_at = now() + make_interval(mins => $4) WHERE id = $1`,
        [m.id, final ? 'failed' : 'pending', String((err as Error)?.message ?? err).slice(0, 500), 2 ** (m.attempts - 1)],
      );
    }
  }
  return { sent, failed };
}

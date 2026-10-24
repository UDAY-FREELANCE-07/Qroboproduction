import 'server-only';
import { randomBytes } from 'crypto';
import type { PoolClient } from 'pg';
import { hashToken } from './auth/token-hash';
import { enqueueEmail, templates } from './email';

/**
 * Double opt-in newsletter list.
 *  subscribe(): (re)issues a 48-hour confirmation link. Already-confirmed addresses get nothing,
 *               and the caller always answers the same way (no address enumeration).
 *  confirm():   activates the subscription and sends a welcome email with an unsubscribe link.
 *  unsubscribe(): one-click opt-out using the per-address unsubscribe token.
 * A matching account's `notify_marketing` setting is kept in sync on confirm/unsubscribe.
 */
const CONFIRM_TTL_HOURS = 48;
const newToken = () => randomBytes(32).toString('base64url');

export async function subscribe(db: PoolClient, email: string, baseUrl: string): Promise<'sent' | 'already'> {
  const existing = await db.query<{ status: string }>(`SELECT status FROM newsletter_subscribers WHERE email = $1 FOR UPDATE`, [email]);
  if (existing.rows[0]?.status === 'subscribed') return 'already';
  const token = newToken();
  await db.query(
    `INSERT INTO newsletter_subscribers (email, status, confirm_token_hash, confirm_expires_at, unsubscribe_token)
     VALUES ($1, 'pending', $2, now() + make_interval(hours => $3), $4)
     ON CONFLICT (email) DO UPDATE
       SET status = 'pending', confirm_token_hash = EXCLUDED.confirm_token_hash, confirm_expires_at = EXCLUDED.confirm_expires_at`,
    [email, hashToken(token), CONFIRM_TTL_HOURS, newToken()],
  );
  await enqueueEmail(db, email, templates.newsletterConfirm(`${baseUrl}/newsletter/confirm?token=${encodeURIComponent(token)}`, baseUrl));
  return 'sent';
}

export async function confirm(db: PoolClient, token: string, baseUrl: string): Promise<boolean> {
  if (typeof token !== 'string' || token.length < 20 || token.length > 200) return false;
  const r = await db.query<{ email: string; unsubscribe_token: string }>(
    `UPDATE newsletter_subscribers
        SET status = 'subscribed', confirmed_at = now(), unsubscribed_at = NULL, confirm_token_hash = NULL, confirm_expires_at = NULL
      WHERE confirm_token_hash = $1 AND confirm_expires_at > now()
      RETURNING email, unsubscribe_token`,
    [hashToken(token)],
  );
  const row = r.rows[0];
  if (!row) return false;
  await db.query(`UPDATE profiles SET notify_marketing = true WHERE id = (SELECT id FROM users WHERE email = $1)`, [row.email]);
  await enqueueEmail(db, row.email, templates.newsletterWelcome(baseUrl, `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(row.unsubscribe_token)}`));
  return true;
}

export async function unsubscribe(db: PoolClient, token: string): Promise<boolean> {
  if (typeof token !== 'string' || token.length < 20 || token.length > 200) return false;
  const r = await db.query<{ email: string }>(
    `UPDATE newsletter_subscribers
        SET status = 'unsubscribed', unsubscribed_at = COALESCE(unsubscribed_at, now()), confirm_token_hash = NULL, confirm_expires_at = NULL
      WHERE unsubscribe_token = $1
      RETURNING email`,
    [token],
  );
  if (!r.rowCount) return false;
  await db.query(`UPDATE profiles SET notify_marketing = false WHERE id = (SELECT id FROM users WHERE email = $1)`, [r.rows[0].email]);
  return true;
}

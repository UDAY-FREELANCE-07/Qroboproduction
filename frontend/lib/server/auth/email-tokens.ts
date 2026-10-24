import { randomBytes } from 'crypto';
import { hashToken } from './token-hash';

export type TokenPurpose = 'verify_email' | 'reset_password';

export const TOKEN_TTL_SECONDS: Record<TokenPurpose, number> = {
  verify_email: 24 * 60 * 60,
  reset_password: 60 * 60,
};

interface Queryable {
  query: (text: string, params?: unknown[]) => Promise<{ rows: any[]; rowCount: number | null }>;
}

/** Issues a single-use token. Older unused tokens for the same purpose are invalidated. */
export async function createEmailToken(db: Queryable, userId: string, purpose: TokenPurpose): Promise<string> {
  await db.query(`UPDATE email_tokens SET used_at = now() WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL`, [userId, purpose]);
  const token = randomBytes(32).toString('base64url');
  await db.query(
    `INSERT INTO email_tokens (user_id, purpose, token_hash, expires_at) VALUES ($1, $2, $3, now() + make_interval(secs => $4))`,
    [userId, purpose, hashToken(token), TOKEN_TTL_SECONDS[purpose]],
  );
  return token;
}

/** Atomically marks a valid token as used and returns its user id, or null if invalid/expired/used. */
export async function consumeEmailToken(db: Queryable, token: string, purpose: TokenPurpose): Promise<string | null> {
  if (typeof token !== 'string' || token.length < 20 || token.length > 200) return null;
  const res = await db.query(
    `UPDATE email_tokens SET used_at = now()
      WHERE token_hash = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > now()
      RETURNING user_id`,
    [hashToken(token), purpose],
  );
  return res.rows[0]?.user_id ?? null;
}

import { z } from 'zod';
import { withTransaction } from '@/lib/server/db';
import { ApiError, assertSameOriginJson, clientIp, fail, handler, ok, readJson } from '@/lib/server/http';
import { consumeEmailToken } from '@/lib/server/auth/email-tokens';
import { limits } from '@/lib/server/auth/rate-limit';
import { adminEmails } from '@/lib/server/email/config';
import { appUrl, enqueueEmail, kickOutbox, templates } from '@/lib/server/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ token: z.string().min(20).max(200) });

/**
 * POST /api/auth/verify-email — consumes a verification link token.
 * If the verified address is listed in ADMIN_EMAILS, the account is promoted to admin here:
 * owning the inbox is the proof, so nobody can claim an admin address by registering it first.
 */
export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const retry = limits.emailTokenPerIp.hit(clientIp(req));
  if (retry) return fail(429, 'rate_limited', 'Too many attempts. Please try again later.', { retryAfter: retry });
  const { token } = Body.parse(await readJson(req));
  const baseUrl = appUrl();

  const result = await withTransaction(async (db) => {
    const userId = await consumeEmailToken(db, token, 'verify_email');
    if (!userId) return null;
    const u = await db.query<{ email: string; full_name: string | null; role: string }>(
      `UPDATE users SET email_verified_at = COALESCE(email_verified_at, now()) WHERE id = $1
       RETURNING email, (SELECT full_name FROM profiles WHERE id = $1) AS full_name, (SELECT role FROM profiles WHERE id = $1) AS role`,
      [userId],
    );
    let { role } = u.rows[0];
    if (role !== 'admin' && adminEmails().includes(u.rows[0].email)) {
      await db.query(`UPDATE profiles SET role = 'admin' WHERE id = $1`, [userId]);
      await enqueueEmail(db, u.rows[0].email, templates.adminAccess(u.rows[0].full_name, baseUrl));
      role = 'admin';
    }
    return { role };
  });

  if (!result) throw new ApiError(400, 'invalid_token', 'This verification link is invalid or has expired. Request a new one from your account settings.');
  kickOutbox();
  return ok({ verified: true, role: result.role });
});

import { z } from 'zod';
import { withTransaction } from '@/lib/server/db';
import { ApiError, assertSameOriginJson, clientIp, fail, handler, ok, readJson } from '@/lib/server/http';
import { hashPassword, passwordProblem } from '@/lib/server/auth/password';
import { consumeEmailToken } from '@/lib/server/auth/email-tokens';
import { limits } from '@/lib/server/auth/rate-limit';
import { appUrl, enqueueEmail, kickOutbox, templates } from '@/lib/server/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ token: z.string().min(20).max(200), password: z.string().max(1024) });

/**
 * POST /api/auth/reset-password — sets a new password from an emailed link. All existing sessions
 * are revoked; the user signs in again with the new password. Completing a reset also proves inbox
 * ownership, so the email is marked verified.
 */
export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const retry = limits.emailTokenPerIp.hit(clientIp(req));
  if (retry) return fail(429, 'rate_limited', 'Too many attempts. Please try again later.', { retryAfter: retry });
  const { token, password } = Body.parse(await readJson(req));
  const problem = passwordProblem(password);
  if (problem) throw new ApiError(400, 'weak_password', problem);
  const hash = await hashPassword(password);
  const baseUrl = appUrl();

  const done = await withTransaction(async (db) => {
    const userId = await consumeEmailToken(db, token, 'reset_password');
    if (!userId) return false;
    const u = await db.query<{ email: string; full_name: string | null }>(
      `UPDATE users SET password_hash = $2, email_verified_at = COALESCE(email_verified_at, now()) WHERE id = $1
       RETURNING email, (SELECT full_name FROM profiles WHERE id = $1) AS full_name`,
      [userId, hash],
    );
    await db.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
    await enqueueEmail(db, u.rows[0].email, templates.passwordChanged(u.rows[0].full_name, baseUrl));
    return true;
  });
  if (!done) throw new ApiError(400, 'invalid_token', 'This reset link is invalid or has expired. Please request a new one.');
  kickOutbox();
  return ok({ reset: true });
});

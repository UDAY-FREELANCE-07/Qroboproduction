import { z } from 'zod';
import { query, withTransaction } from '@/lib/server/db';
import { ApiError, assertSameOriginJson, fail, handler, ok, readJson } from '@/lib/server/http';
import { hashPassword, passwordProblem, verifyPassword } from '@/lib/server/auth/password';
import { limits } from '@/lib/server/auth/rate-limit';
import { createSession, requireUser, setSessionCookie } from '@/lib/server/auth/session';
import { appUrl, enqueueEmail, kickOutbox, templates } from '@/lib/server/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ current_password: z.string().max(1024), password: z.string().max(1024) });

/**
 * Change password for the signed-in user. Requires the current password, so a stolen or
 * left-open session cannot lock the owner out. All sessions are revoked and a fresh one is
 * issued for this browser; a "password changed" email is sent.
 */
export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const user = await requireUser(req);
  const retry = limits.passwordChangePerUser.hit(user.id);
  if (retry) return fail(429, 'rate_limited', 'Too many attempts. Please try again later.', { retryAfter: retry });

  const { current_password, password } = Body.parse(await readJson(req));
  const current = await query<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = $1', [user.id]);
  if (!current.rowCount || !(await verifyPassword(current_password, current.rows[0].password_hash))) {
    throw new ApiError(400, 'wrong_password', 'Your current password is incorrect.');
  }
  const problem = passwordProblem(password);
  if (problem) throw new ApiError(400, 'weak_password', problem);
  const hash = await hashPassword(password);
  const baseUrl = appUrl();

  const token = await withTransaction(async (db) => {
    await db.query('UPDATE users SET password_hash = $2 WHERE id = $1', [user.id, hash]);
    await db.query('DELETE FROM sessions WHERE user_id = $1', [user.id]);
    await enqueueEmail(db, user.email, templates.passwordChanged(user.full_name, baseUrl));
    return createSession(db, user.id);
  });
  kickOutbox();
  const res = ok({ updated: true });
  setSessionCookie(res, token);
  return res;
});

import { z } from 'zod';
import { withTransaction } from '@/lib/server/db';
import { assertSameOriginJson, clientIp, fail, handler, ok, readJson } from '@/lib/server/http';
import { createEmailToken } from '@/lib/server/auth/email-tokens';
import { limits } from '@/lib/server/auth/rate-limit';
import { appUrl, enqueueEmail, kickOutbox, templates } from '@/lib/server/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ email: z.string().trim().toLowerCase().max(254) });

const GENERIC = { message: 'If an account exists for that email, a reset link is on its way.' };

/**
 * POST /api/auth/forgot-password — always returns the same response, whether or not the account
 * exists (no account enumeration). The reset link is single-use and expires after 1 hour.
 */
export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const { email } = Body.parse(await readJson(req));
  const retry = limits.forgotPerIp.hit(clientIp(req));
  if (retry) return fail(429, 'rate_limited', 'Too many requests. Please try again later.', { retryAfter: retry });
  // Per-address cap: silently stop sending, but answer identically.
  if (limits.forgotPerEmail.hit(email)) return ok(GENERIC);

  const baseUrl = appUrl();
  const queued = await withTransaction(async (db) => {
    const u = await db.query<{ id: string; full_name: string | null }>(
      `SELECT u.id, p.full_name FROM users u JOIN profiles p ON p.id = u.id WHERE u.email = $1`,
      [email],
    );
    if (!u.rowCount) return false;
    const token = await createEmailToken(db, u.rows[0].id, 'reset_password');
    await enqueueEmail(db, email, templates.resetPassword(u.rows[0].full_name, `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`));
    return true;
  });
  if (queued) kickOutbox();
  return ok(GENERIC);
});

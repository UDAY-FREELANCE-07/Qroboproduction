import { withTransaction } from '@/lib/server/db';
import { assertSameOriginJson, fail, handler, ok } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth/session';
import { createEmailToken } from '@/lib/server/auth/email-tokens';
import { limits } from '@/lib/server/auth/rate-limit';
import { appUrl, enqueueEmail, kickOutbox, templates } from '@/lib/server/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST /api/auth/resend-verification — signed-in user asks for a new verification link. */
export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const user = await requireUser(req);
  if (user.email_verified) return ok({ sent: false, alreadyVerified: true });
  const retry = limits.resendVerifyPerUser.hit(user.id);
  if (retry) return fail(429, 'rate_limited', 'Too many emails requested. Please try again later.', { retryAfter: retry });

  const baseUrl = appUrl();
  await withTransaction(async (db) => {
    const token = await createEmailToken(db, user.id, 'verify_email');
    await enqueueEmail(db, user.email, templates.verifyEmail(user.full_name, `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`));
  });
  kickOutbox();
  return ok({ sent: true });
});

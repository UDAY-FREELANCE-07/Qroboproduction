import { z } from 'zod';
import { withTransaction } from '@/lib/server/db';
import { ApiError, assertSameOriginJson, clientIp, fail, handler, ok, readJson } from '@/lib/server/http';
import { limits } from '@/lib/server/auth/rate-limit';
import { unsubscribe } from '@/lib/server/newsletter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ token: z.string().min(20).max(200) });

/** POST /api/newsletter/unsubscribe — one-click opt-out from the link in every newsletter email. */
export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const retry = limits.emailTokenPerIp.hit(clientIp(req));
  if (retry) return fail(429, 'rate_limited', 'Too many attempts. Please try again later.', { retryAfter: retry });
  const { token } = Body.parse(await readJson(req));
  const done = await withTransaction((db) => unsubscribe(db, token));
  if (!done) throw new ApiError(400, 'invalid_token', 'This unsubscribe link is invalid.');
  return ok({ unsubscribed: true });
});

import { z } from 'zod';
import { withTransaction } from '@/lib/server/db';
import { ApiError, assertSameOriginJson, clientIp, fail, handler, ok, readJson } from '@/lib/server/http';
import { limits } from '@/lib/server/auth/rate-limit';
import { appUrl, kickOutbox } from '@/lib/server/email';
import { confirm } from '@/lib/server/newsletter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ token: z.string().min(20).max(200) });

/** POST /api/newsletter/confirm — second step of double opt-in. */
export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const retry = limits.emailTokenPerIp.hit(clientIp(req));
  if (retry) return fail(429, 'rate_limited', 'Too many attempts. Please try again later.', { retryAfter: retry });
  const { token } = Body.parse(await readJson(req));
  const baseUrl = appUrl();
  const done = await withTransaction((db) => confirm(db, token, baseUrl));
  if (!done) throw new ApiError(400, 'invalid_token', 'This confirmation link is invalid or has expired. Please subscribe again.');
  kickOutbox();
  return ok({ subscribed: true });
});

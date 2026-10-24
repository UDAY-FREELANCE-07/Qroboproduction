import { z } from 'zod';
import { withTransaction } from '@/lib/server/db';
import { assertSameOriginJson, clientIp, fail, handler, ok, readJson } from '@/lib/server/http';
import { limits } from '@/lib/server/auth/rate-limit';
import { appUrl, kickOutbox } from '@/lib/server/email';
import { subscribe } from '@/lib/server/newsletter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ email: z.string().trim().toLowerCase().email('Please enter a valid email address.').max(254) });
const GENERIC = { message: 'Almost done! Check your inbox and click the link to confirm your subscription.' };

/** POST /api/newsletter/subscribe — starts double opt-in. Same answer for every address. */
export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const retry = limits.newsletterPerIp.hit(clientIp(req));
  if (retry) return fail(429, 'rate_limited', 'Too many requests. Please try again later.', { retryAfter: retry });
  const { email } = Body.parse(await readJson(req));
  // Per-address cap so the form cannot be used to flood someone's inbox.
  if (limits.newsletterPerEmail.hit(email)) return ok(GENERIC);
  const baseUrl = appUrl();
  const result = await withTransaction((db) => subscribe(db, email, baseUrl));
  if (result === 'sent') kickOutbox();
  return ok(GENERIC);
});

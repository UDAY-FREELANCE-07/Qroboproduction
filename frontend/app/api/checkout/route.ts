import { withTransaction } from '@/lib/server/db';
import { assertSameOriginJson, fail, handler, ok, readJson } from '@/lib/server/http';
import { requireUser } from '@/lib/server/auth/session';
import { limits } from '@/lib/server/auth/rate-limit';
import { CheckoutInput, createOrder } from '@/lib/server/checkout';
import { kickOutbox } from '@/lib/server/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/checkout — create a Cash-on-Delivery order from the signed-in user's server cart.
 * Status: order 'confirmed', payment 'pending' (COD is collected on delivery; nothing is marked
 * paid here). Idempotent per (user, idempotency_key).
 */
export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const user = await requireUser(req);
  const retry = limits.checkoutPerUser.hit(user.id);
  if (retry) return fail(429, 'rate_limited', 'Too many checkout attempts. Please wait a moment.', { retryAfter: retry });
  const input = CheckoutInput.parse(await readJson(req));
  const result = await withTransaction((db) => createOrder(db, user.id, input));
  if (!result.replayed) kickOutbox(); // confirmation + admin alert were queued in the order transaction
  return ok(result, { status: result.replayed ? 200 : 201 });
});

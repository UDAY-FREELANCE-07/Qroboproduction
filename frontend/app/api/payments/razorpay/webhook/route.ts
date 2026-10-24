import { NextResponse } from 'next/server';
import { withTransaction } from '@/lib/server/db';
import { fail, handler } from '@/lib/server/http';
import { verifyWebhookSignature } from '@/lib/server/payments/razorpay';
import { applyRazorpayEvent } from '@/lib/server/payments/webhook';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Razorpay webhook receiver. Server-to-server: authenticated by HMAC signature, not cookies,
 * so the same-origin check does not apply. Inert until Razorpay order creation is implemented
 * (no order has a razorpay_order_id yet).
 */
export const POST = handler(async (req: Request) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? '';
  if (!secret) return fail(503, 'payment_unavailable', 'Payment webhooks are not configured.');

  const raw = await req.text();
  if (raw.length > 512 * 1024) return fail(413, 'payload_too_large', 'Payload too large.');
  if (!verifyWebhookSignature(raw, req.headers.get('x-razorpay-signature'), secret)) {
    return fail(401, 'invalid_signature', 'Invalid signature.');
  }
  const eventId = req.headers.get('x-razorpay-event-id');
  if (!eventId || eventId.length > 200) return fail(400, 'missing_event_id', 'Missing event id.');

  let event: unknown;
  try {
    event = JSON.parse(raw);
  } catch {
    return fail(400, 'invalid_json', 'Invalid JSON.');
  }
  const outcome = await withTransaction((db) => applyRazorpayEvent(db, eventId, event));
  if (outcome === 'amount_mismatch' || outcome === 'unknown_order') console.warn(`[payments] razorpay event ${eventId}: ${outcome}`);
  // 2xx for every verified event so the provider stops retrying; outcome is logged server-side.
  return NextResponse.json({ received: true }, { status: 200 });
});

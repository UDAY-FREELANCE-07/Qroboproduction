/**
 * Razorpay signature verification (HMAC-SHA256, constant-time comparison).
 * Never log secrets or signatures. No card data ever reaches this server.
 */
import { createHmac, timingSafeEqual } from 'crypto';

function safeEqualHex(expectedHex: string, receivedHex: string): boolean {
  if (!/^[0-9a-f]+$/i.test(receivedHex) || receivedHex.length !== expectedHex.length) return false;
  return timingSafeEqual(Buffer.from(expectedHex, 'hex'), Buffer.from(receivedHex.toLowerCase(), 'hex'));
}

/** Checkout callback: signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyPaymentSignature(
  p: { razorpayOrderId: string; razorpayPaymentId: string; signature: string },
  keySecret: string,
): boolean {
  if (!keySecret) return false;
  const expected = createHmac('sha256', keySecret).update(`${p.razorpayOrderId}|${p.razorpayPaymentId}`).digest('hex');
  return safeEqualHex(expected, p.signature);
}

/** Webhook: X-Razorpay-Signature = HMAC_SHA256(raw request body, webhook_secret). */
export function verifyWebhookSignature(rawBody: string, signature: string | null, webhookSecret: string): boolean {
  if (!webhookSecret || !signature) return false;
  const expected = createHmac('sha256', webhookSecret).update(rawBody, 'utf8').digest('hex');
  return safeEqualHex(expected, signature);
}

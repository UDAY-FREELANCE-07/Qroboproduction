/**
 * Payment-provider adapter boundary.
 *
 * Current state: only Cash on Delivery is supported. Online payment (Razorpay) is NOT
 * implemented: there is no server-side order creation with the provider, so no order can be
 * marked paid by the browser. Signature/webhook verification is implemented in razorpay.ts
 * so that, once order creation is added, only provider-verified events can mark orders paid.
 */
export interface OnlinePaymentStatus {
  provider: 'razorpay';
  available: false;
  reason: 'not_configured' | 'not_implemented';
}

export function getOnlinePaymentStatus(env: Record<string, string | undefined> = process.env): OnlinePaymentStatus {
  const configured = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_WEBHOOK_SECRET);
  return { provider: 'razorpay', available: false, reason: configured ? 'not_implemented' : 'not_configured' };
}

import type { PoolClient } from 'pg';

/**
 * Applies a signature-verified Razorpay webhook event idempotently.
 * Only `payment.captured` for a known razorpay_order_id with an EXACTLY matching amount
 * (in paise) moves an order from payment_status 'pending' to 'paid'.
 * Must be called inside a transaction.
 */
export async function applyRazorpayEvent(
  db: PoolClient,
  eventId: string,
  event: any,
): Promise<'duplicate' | 'paid' | 'ignored' | 'unknown_order' | 'amount_mismatch'> {
  const type = typeof event?.event === 'string' ? event.event : 'unknown';
  const recorded = await db.query(
    `INSERT INTO payment_events (provider, event_id, event_type) VALUES ('razorpay', $1, $2) ON CONFLICT (provider, event_id) DO NOTHING RETURNING id`,
    [eventId, type],
  );
  if (!recorded.rowCount) return 'duplicate';
  if (type !== 'payment.captured') return 'ignored';

  const payment = event?.payload?.payment?.entity;
  const rzpOrderId = typeof payment?.order_id === 'string' ? payment.order_id : null;
  const rzpPaymentId = typeof payment?.id === 'string' ? payment.id : null;
  const amount = Number.isInteger(payment?.amount) ? payment.amount : null;
  if (!rzpOrderId || !rzpPaymentId || amount === null) return 'ignored';

  const order = await db.query<{ id: string; total: number; payment_status: string }>(
    `SELECT id, total, payment_status FROM orders WHERE razorpay_order_id = $1 FOR UPDATE`,
    [rzpOrderId],
  );
  if (!order.rowCount) return 'unknown_order';
  const o = order.rows[0];
  await db.query(`UPDATE payment_events SET order_id = $2 WHERE id = $1`, [recorded.rows[0].id, o.id]);
  if (Math.round(o.total * 100) !== amount) return 'amount_mismatch';
  if (o.payment_status !== 'pending') return 'ignored';
  await db.query(
    `UPDATE orders SET payment_status = 'paid', razorpay_payment_id = $2, payment_id = $2 WHERE id = $1`,
    [o.id, rzpPaymentId],
  );
  return 'paid';
}

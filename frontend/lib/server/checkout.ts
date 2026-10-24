import 'server-only';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import type { PoolClient } from 'pg';
import { ApiError } from './http';
import { computeTotals, CouponError, type CouponRow } from './pricing';
import { getOnlinePaymentStatus } from './payments/provider';
import { appUrl, enqueueEmail, templates } from './email';
import type { OrderSummary } from './email/templates';

const Text = (max: number) => z.string().trim().min(1).max(max);

export const CheckoutInput = z.object({
  idempotency_key: z.string().uuid(),
  delivery_method: z.enum(['standard', 'express']),
  payment_method: z.enum(['cod', 'razorpay']).default('cod'),
  coupon_code: z.string().trim().max(40).optional().nullable(),
  shipping_address: z.object({
    fullName: Text(120),
    phone: z.string().trim().regex(/^[+0-9 ()-]{6,20}$/, 'Invalid phone number'),
    addressLine1: Text(200),
    addressLine2: z.string().trim().max(200).optional().default(''),
    city: Text(100),
    state: Text(100),
    postalCode: z.string().trim().regex(/^[A-Za-z0-9 -]{3,12}$/, 'Invalid postal code'),
    country: Text(60),
  }),
});
export type CheckoutInput = z.infer<typeof CheckoutInput>;

export interface CheckoutResult {
  orderId: string;
  orderNumber: string;
  total: number;
  replayed: boolean;
}

export function newOrderNumber(now = new Date()): string {
  const d = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `QR-${d}-${randomBytes(4).toString('hex').toUpperCase()}`;
}

/**
 * Creates an order from the user's SERVER-SIDE cart inside one transaction.
 * Prices, stock, coupon and totals come from the database; nothing monetary is taken from the
 * browser. Retries with the same idempotency_key return the original order.
 */
export async function createOrder(db: PoolClient, userId: string, input: CheckoutInput, now = new Date()): Promise<CheckoutResult> {
  if (input.payment_method !== 'cod') {
    const status = getOnlinePaymentStatus();
    throw new ApiError(503, 'payment_unavailable', 'Online payment is not available yet. Please choose Cash on Delivery.', { reason: status.reason });
  }

  const prior = await db.query(`SELECT id, order_number, total FROM orders WHERE user_id = $1 AND idempotency_key = $2`, [userId, input.idempotency_key]);
  if (prior.rowCount) return { orderId: prior.rows[0].id, orderNumber: prior.rows[0].order_number, total: prior.rows[0].total, replayed: true };

  const cart = await db.query<{ product_id: string; quantity: number }>(
    `SELECT ci.product_id, ci.quantity FROM cart_items ci JOIN carts c ON c.id = ci.cart_id WHERE c.user_id = $1`,
    [userId],
  );
  if (!cart.rowCount) throw new ApiError(400, 'cart_empty', 'Your cart is empty.');

  // Lock product rows in a stable order to avoid deadlocks between concurrent checkouts.
  const ids = cart.rows.map((r) => r.product_id);
  const products = await db.query<{ id: string; name: string; slug: string; sku: string; price: number; stock: number; primary_image: string | null; is_published: boolean }>(
    `SELECT id, name, slug, sku, price, stock, primary_image, is_published FROM products WHERE id = ANY($1) ORDER BY id FOR UPDATE`,
    [ids],
  );
  const byId = new Map(products.rows.map((p) => [p.id, p]));
  const problems: string[] = [];
  const lines = cart.rows.map((item) => {
    const p = byId.get(item.product_id);
    if (!p || !p.is_published) problems.push('An item in your cart is no longer available.');
    else if (p.stock < item.quantity) problems.push(`Only ${p.stock} left of ${p.name}.`);
    return { item, product: p! };
  });
  if (problems.length) throw new ApiError(409, 'insufficient_stock', problems[0], { problems });

  let coupon: CouponRow | null = null;
  if (input.coupon_code) {
    const c = await db.query<CouponRow & { id: string }>(`SELECT * FROM coupons WHERE code = $1 FOR UPDATE`, [input.coupon_code.toUpperCase()]);
    if (!c.rowCount) throw new ApiError(400, 'invalid_coupon', 'Invalid coupon code');
    coupon = c.rows[0];
  }

  let totals;
  try {
    totals = computeTotals(lines.map((l) => ({ unitPrice: l.product.price, quantity: l.item.quantity })), input.delivery_method, coupon, now);
  } catch (err) {
    if (err instanceof CouponError) throw new ApiError(400, 'invalid_coupon', err.message);
    throw err;
  }

  const addr = input.shipping_address;
  const inserted = await db.query<{ id: string; order_number: string }>(
    `INSERT INTO orders (order_number, user_id, status, payment_status, payment_method, subtotal, discount, shipping_cost, tax, total,
                         coupon_code, shipping_address, idempotency_key)
     VALUES ($1, $2, 'confirmed', 'pending', 'cod', $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (user_id, idempotency_key) DO NOTHING
     RETURNING id, order_number`,
    [newOrderNumber(now), userId, totals.subtotal, totals.discount, totals.shipping, totals.tax, totals.total,
     coupon ? coupon.code : null, JSON.stringify(addr), input.idempotency_key],
  );
  if (!inserted.rowCount) {
    // A concurrent request with the same key committed first.
    const again = await db.query(`SELECT id, order_number, total FROM orders WHERE user_id = $1 AND idempotency_key = $2`, [userId, input.idempotency_key]);
    return { orderId: again.rows[0].id, orderNumber: again.rows[0].order_number, total: again.rows[0].total, replayed: true };
  }
  const order = inserted.rows[0];

  for (const { item, product } of lines) {
    await db.query(
      `INSERT INTO order_items (order_id, product_id, product_name, product_image, product_slug, sku, price, quantity, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [order.id, product.id, product.name, product.primary_image, product.slug, product.sku, product.price, item.quantity,
       Math.round(product.price * 100 * item.quantity) / 100],
    );
    await db.query(`UPDATE products SET stock = stock - $2 WHERE id = $1`, [product.id, item.quantity]);
    await db.query(
      `INSERT INTO inventory_transactions (product_id, quantity, type, reference_id) VALUES ($1, $2, 'sale', $3)`,
      [product.id, -item.quantity, order.id],
    );
  }

  if (coupon) await db.query(`UPDATE coupons SET used_count = COALESCE(used_count, 0) + 1 WHERE code = $1`, [coupon.code]);

  // Existing checkout behaviour: remember the shipping address as the default.
  await db.query(`UPDATE addresses SET is_default = false WHERE user_id = $1 AND is_default`, [userId]);
  await db.query(
    `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)`,
    [userId, addr.fullName, addr.phone, addr.addressLine1, addr.addressLine2 || null, addr.city, addr.state, addr.postalCode, addr.country],
  );

  await db.query(`DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1)`, [userId]);

  // Emails are queued in this transaction, so they exist only if the order commits.
  await queueOrderEmails(db, userId, {
    id: order.id,
    order_number: order.order_number,
    total: totals.total,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping_cost: totals.shipping,
    tax: totals.tax,
    status: 'confirmed',
    payment_method: 'cod',
    items: lines.map(({ item, product }) => ({
      product_name: product.name,
      quantity: item.quantity,
      total: Math.round(product.price * 100 * item.quantity) / 100,
    })),
  });

  return { orderId: order.id, orderNumber: order.order_number, total: totals.total, replayed: false };
}

async function queueOrderEmails(db: PoolClient, userId: string, summary: OrderSummary) {
  const baseUrl = appUrl();
  const customer = await db.query<{ email: string; full_name: string | null }>(
    `SELECT u.email, p.full_name FROM users u JOIN profiles p ON p.id = u.id WHERE u.id = $1`,
    [userId],
  );
  const c = customer.rows[0];
  // Order confirmation is transactional, so it is sent regardless of marketing settings.
  await enqueueEmail(db, c.email, templates.orderConfirmation(c.full_name, summary, baseUrl));
  const admins = await db.query<{ email: string }>(
    `SELECT u.email FROM users u JOIN profiles p ON p.id = u.id
      WHERE p.role = 'admin' AND p.notify_admin_new_orders AND u.email_verified_at IS NOT NULL`,
  );
  for (const a of admins.rows) await enqueueEmail(db, a.email, templates.adminNewOrder(summary, c.email, baseUrl));
}

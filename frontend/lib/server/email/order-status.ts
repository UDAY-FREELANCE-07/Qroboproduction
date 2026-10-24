import 'server-only';
import type { Pool } from 'pg';
import { appUrl, enqueueEmail, kickOutbox, templates } from './index';
import { NOTIFY_STATUSES } from './templates';

/**
 * After an admin changes an order's status through the data gateway, email the customer
 * (respecting their "order updates" setting). Runs after the update has committed; a failure
 * here is logged and never turns a successful status change into an error.
 * Shipment details (courier / tracking) saved in the same update are included in the email.
 */
export async function notifyOrderStatusChange(pool: Pool, body: unknown): Promise<void> {
  const b = body as { table?: unknown; op?: unknown; values?: Record<string, unknown>; filters?: unknown[] };
  if (b?.table !== 'orders' || b.op !== 'update' || typeof b.values?.status !== 'string') return;
  const status = b.values.status;
  if (!NOTIFY_STATUSES.includes(status)) return;
  const idFilter = (b.filters ?? []).find((f) => Array.isArray(f) && f[0] === 'eq' && f[1] === 'id' && typeof f[2] === 'string') as [string, string, string] | undefined;
  if (!idFilter) return;

  try {
    const { rows } = await pool.query<{
      id: string; order_number: string; status: string; total: number; payment_method: string;
      courier: string | null; tracking_number: string | null; tracking_url: string | null;
      email: string; full_name: string | null; notify: boolean;
    }>(
      `SELECT o.id, o.order_number, o.status, o.total, o.payment_method, o.courier, o.tracking_number, o.tracking_url,
              u.email, p.full_name, p.notify_order_updates AS notify
         FROM orders o JOIN users u ON u.id = o.user_id JOIN profiles p ON p.id = o.user_id
        WHERE o.id = $1`,
      [idFilter[2]],
    );
    const o = rows[0];
    if (!o || !o.notify || o.status !== status) return;
    const items = await pool.query<{ product_name: string; quantity: number; total: number; price: number; image: string | null; slug: string | null }>(
      `SELECT product_name, quantity, total, price, product_image AS image, product_slug AS slug
         FROM order_items WHERE order_id = $1 ORDER BY created_at, id`,
      [o.id],
    );
    await enqueueEmail(
      pool,
      o.email,
      templates.orderStatus(
        {
          name: o.full_name,
          orderNumber: o.order_number,
          status,
          total: Number(o.total),
          paymentMethod: o.payment_method,
          courier: o.courier,
          trackingNumber: o.tracking_number,
          trackingUrl: o.tracking_url,
          items: items.rows.map((i) => ({ ...i, total: Number(i.total), price: Number(i.price) })),
        },
        appUrl(),
      ),
    );
    kickOutbox();
  } catch (err) {
    console.error('[email] could not queue order status email:', (err as Error).message);
  }
}

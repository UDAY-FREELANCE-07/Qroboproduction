import 'server-only';
import type { Pool } from 'pg';
import { appUrl, enqueueEmail, kickOutbox, templates } from './index';
import { NOTIFY_STATUSES } from './templates';

/**
 * After an admin changes an order's status through the data gateway, email the customer
 * (respecting their "order updates" setting). Runs after the update has committed; a failure
 * here is logged and never turns a successful status change into an error.
 */
export async function notifyOrderStatusChange(pool: Pool, body: unknown): Promise<void> {
  const b = body as { table?: unknown; op?: unknown; values?: Record<string, unknown>; filters?: unknown[] };
  if (b?.table !== 'orders' || b.op !== 'update' || typeof b.values?.status !== 'string') return;
  const status = b.values.status;
  if (!NOTIFY_STATUSES.includes(status)) return;
  const idFilter = (b.filters ?? []).find((f) => Array.isArray(f) && f[0] === 'eq' && f[1] === 'id' && typeof f[2] === 'string') as [string, string, string] | undefined;
  if (!idFilter) return;

  try {
    const { rows } = await pool.query<{ order_number: string; status: string; email: string; full_name: string | null; notify: boolean }>(
      `SELECT o.order_number, o.status, u.email, p.full_name, p.notify_order_updates AS notify
         FROM orders o JOIN users u ON u.id = o.user_id JOIN profiles p ON p.id = o.user_id
        WHERE o.id = $1`,
      [idFilter[2]],
    );
    const o = rows[0];
    if (!o || !o.notify || o.status !== status) return;
    await enqueueEmail(pool, o.email, templates.orderStatus(o.full_name, o.order_number, status, appUrl()));
    kickOutbox();
  } catch (err) {
    console.error('[email] could not queue order status email:', (err as Error).message);
  }
}

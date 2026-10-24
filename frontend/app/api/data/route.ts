import { getPool } from '@/lib/server/db';
import { executeGateway } from '@/lib/server/gateway/engine';
import { assertSameOriginJson, handler, readJson } from '@/lib/server/http';
import { getSessionUser } from '@/lib/server/auth/session';
import { NextResponse } from 'next/server';
import { notifyOrderStatusChange } from '@/lib/server/email/order-status';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/data — policy-enforced data gateway used by the existing UI's query-builder calls
 * (see lib/api-client.ts and docs/api-reference.md). Response: { data, error, count }.
 */
export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const pool = getPool(); // throws 503 in mock mode / when misconfigured
  const body = await readJson(req);
  const user = await getSessionUser(req);
  const result = await executeGateway(pool, body, { userId: user?.id ?? null, role: user ? user.role : 'anon' });
  // Only admins can update orders.status (gateway policy); email the customer about it.
  if (user?.role === 'admin') await notifyOrderStatusChange(pool, body);
  return NextResponse.json({ data: result.data, error: null, count: result.count }, { headers: { 'Cache-Control': 'no-store' } });
});

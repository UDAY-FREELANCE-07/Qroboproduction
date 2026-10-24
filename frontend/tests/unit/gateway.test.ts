import { describe, expect, it } from 'vitest';
import { executeGateway, type GatewayContext, type Queryable } from '@/lib/server/gateway/engine';
import { ApiError } from '@/lib/server/http';

/** Records SQL instead of executing it. */
function fakeDb(rows: any[] = []) {
  const calls: { text: string; params: unknown[] }[] = [];
  const db: Queryable = {
    query: async (text, params = []) => {
      calls.push({ text, params });
      if (/count\(\*\)/.test(text)) return { rows: [{ n: rows.length }], rowCount: 1 };
      return { rows: rows.map((r) => ({ ...r })), rowCount: rows.length };
    },
  };
  return { db, calls };
}

const anon: GatewayContext = { userId: null, role: 'anon' };
const alice: GatewayContext = { userId: '11111111-1111-4111-8111-111111111111', role: 'customer' };
const admin: GatewayContext = { userId: '22222222-2222-4222-8222-222222222222', role: 'admin' };

async function status(p: Promise<unknown>) {
  try {
    await p;
    return 'ok';
  } catch (e) {
    return e instanceof ApiError ? e.status : (e as Error).name;
  }
}

describe('gateway SQL generation', () => {
  it('binds every value as a parameter (no SQL injection through values)', async () => {
    const { db, calls } = fakeDb();
    const evil = "x'; DROP TABLE users; --";
    await executeGateway(db, { table: 'products', op: 'select', filters: [['eq', 'slug', evil]], or: `name.ilike.%${evil}%` }, anon);
    expect(calls[0].text).not.toContain('DROP TABLE');
    expect(calls[0].params).toContain(evil);
    expect(calls[0].text).toMatch(/"is_published" = true/); // anon only sees published products
  });

  it('rejects identifiers that are not allowlisted', async () => {
    const { db } = fakeDb();
    expect(await status(executeGateway(db, { table: 'products', op: 'select', filters: [['eq', 'slug" OR 1=1 --', 'a']] }, anon))).toBe(400);
    expect(await status(executeGateway(db, { table: 'products', op: 'select', order: [{ column: 'price; DROP', ascending: true }] }, anon))).toBe(400);
    expect(await status(executeGateway(db, { table: 'users', op: 'select' }, admin))).toBe(404);
    expect(await status(executeGateway(db, { table: 'inventory_transactions', op: 'select' }, admin))).toBe(404);
    expect(await status(executeGateway(db, { table: 'sessions', op: 'select' }, admin))).toBe(404);
  });

  it('hides internal columns from non-admins', async () => {
    const { db, calls } = fakeDb();
    await executeGateway(db, { table: 'products', op: 'select', select: '*' }, anon);
    expect(calls[0].text).not.toContain('cost_price');
    expect(await status(executeGateway(db, { table: 'products', op: 'select', select: 'cost_price' }, anon))).toBe(400);
    await executeGateway(db, { table: 'products', op: 'select', select: 'cost_price' }, admin);
  });

  it('coupons cannot be listed by customers, only looked up by code', async () => {
    const { db, calls } = fakeDb();
    expect(await status(executeGateway(db, { table: 'coupons', op: 'select' }, alice))).toBe(403);
    await executeGateway(db, { table: 'coupons', op: 'select', filters: [['eq', 'code', 'WELCOME10']] }, anon);
    expect(calls.at(-1)!.text).not.toMatch(/used_count|usage_limit/);
  });

  it('personal tables require a session and are scoped to the session user', async () => {
    const { db, calls } = fakeDb();
    expect(await status(executeGateway(db, { table: 'orders', op: 'select' }, anon))).toBe(401);
    // Even if the client asks for another user's id, the server ANDs its own scope.
    await executeGateway(db, { table: 'orders', op: 'select', filters: [['eq', 'user_id', admin.userId]] }, alice);
    expect(calls.at(-1)!.params).toContain(alice.userId);
    await executeGateway(db, { table: 'carts', op: 'select' }, admin);
    expect(calls.at(-1)!.params).toContain(admin.userId); // ownerOnly applies to admins too
  });

  it('customers cannot modify catalog data', async () => {
    const { db } = fakeDb();
    expect(await status(executeGateway(db, { table: 'products', op: 'insert', values: { name: 'x' } }, alice))).toBe(403);
    expect(await status(executeGateway(db, { table: 'products', op: 'update', values: { price: 1 }, filters: [['eq', 'id', 'a']] }, alice))).toBe(403);
    expect(await status(executeGateway(db, { table: 'categories', op: 'delete', filters: [['eq', 'id', 'a']] }, anon))).toBe(401);
  });

  it('nobody can change roles or protected order fields through the gateway', async () => {
    const { db } = fakeDb();
    expect(await status(executeGateway(db, { table: 'profiles', op: 'update', values: { role: 'admin' }, filters: [['eq', 'id', alice.userId]] }, alice))).toBe(400);
    expect(await status(executeGateway(db, { table: 'profiles', op: 'update', values: { role: 'admin' }, filters: [['eq', 'id', alice.userId]] }, admin))).toBe(400);
    expect(await status(executeGateway(db, { table: 'orders', op: 'update', values: { payment_status: 'paid' }, filters: [['eq', 'id', 'a']] }, admin))).toBe(400);
    expect(await status(executeGateway(db, { table: 'orders', op: 'update', values: { status: 'shipped' }, filters: [['eq', 'id', 'a']] }, alice))).toBe(403);
    expect(await status(executeGateway(db, { table: 'orders', op: 'insert', values: { total: 0 } }, alice))).toBe(403);
  });

  it('owner inserts force the session user id', async () => {
    const { db, calls } = fakeDb();
    expect(await status(executeGateway(db, { table: 'wishlists', op: 'insert', values: { user_id: admin.userId, product_id: 'p' } }, alice))).toBe(403);
    await executeGateway(db, { table: 'wishlists', op: 'insert', values: { product_id: 'p' } }, alice);
    expect(calls.at(-1)!.text).toMatch(/INSERT INTO "wishlists" \("product_id", "user_id"\)/);
    expect(calls.at(-1)!.params).toEqual(['p', alice.userId]);
  });

  it('writes require an eq filter and refuse "or"', async () => {
    const { db } = fakeDb();
    expect(await status(executeGateway(db, { table: 'categories', op: 'delete' }, admin))).toBe(400);
    expect(await status(executeGateway(db, { table: 'categories', op: 'update', values: { name: 'x' }, filters: [['gt', 'sort_order', 0]] }, admin))).toBe(400);
  });

  it('caps page sizes for non-admins', async () => {
    const { db, calls } = fakeDb();
    await executeGateway(db, { table: 'products', op: 'select', limit: 1000 }, anon);
    expect(calls[0].params.at(-1)).toBe(200);
  });

  it('only allowlisted relations can be embedded', async () => {
    const { db } = fakeDb();
    expect(await status(executeGateway(db, { table: 'products', op: 'select', select: '*, users(*)' }, admin))).toBe(400);
    expect(await status(executeGateway(db, { table: 'deals', op: 'select', select: '*, product:products(*)' }, anon))).toBe('ok');
  });
});

import { createHmac, randomUUID } from 'crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as logout } from '@/app/api/auth/logout/route';
import { GET as me } from '@/app/api/auth/me/route';
import { POST as changePassword } from '@/app/api/auth/password/route';
import { POST as data } from '@/app/api/data/route';
import { POST as checkout } from '@/app/api/checkout/route';
import { POST as webhook } from '@/app/api/payments/razorpay/webhook/route';
import { GET as health } from '@/app/api/health/route';
import { setPoolForTesting } from '@/lib/server/db';
import { computeTotals } from '@/lib/server/pricing';
import { call, createTestDb, dbAvailable, uniqueEmail, uniqueIp, type TestDb } from './helpers';

const PASSWORD = 'correct horse battery';

describe.skipIf(!dbAvailable())('API against PostgreSQL', () => {
  let db: TestDb;
  let alice: { cookie: string; id: string };
  let bob: { cookie: string; id: string };
  let admin: { cookie: string; id: string; email: string };

  async function signUp(extra: Record<string, unknown> = {}) {
    const email = uniqueEmail();
    const r = await call(register, '/api/auth/register', { body: { email, password: PASSWORD, full_name: 'Test User', ...extra }, ip: uniqueIp() });
    expect(r.status).toBe(201);
    return { cookie: r.cookie!, id: r.json.data.user.id as string, email, json: r.json };
  }
  const q = (cookie: string | undefined, body: Record<string, unknown>) => call(data, '/api/data', { body, cookie });

  beforeAll(async () => {
    db = await createTestDb();
    alice = await signUp();
    bob = await signUp();
    const a = await signUp();
    await db.pool.query(`UPDATE profiles SET role = 'admin' WHERE id = $1`, [a.id]); // what promote-admin.ts does
    admin = { cookie: a.cookie, id: a.id, email: a.email };
  });
  afterAll(async () => db?.drop());

  // ---------------- auth ----------------
  describe('authentication', () => {
    it('registration ignores client-supplied roles', async () => {
      const r = await signUp({ role: 'admin', options: { data: { role: 'admin' } } });
      expect(r.json.data.profile.role).toBe('customer');
      const row = await db.pool.query('SELECT role FROM profiles WHERE id = $1', [r.id]);
      expect(row.rows[0].role).toBe('customer');
    });

    it('stores only a bcrypt hash and an HttpOnly session cookie', async () => {
      const u = await db.pool.query('SELECT password_hash FROM users WHERE id = $1', [alice.id]);
      expect(u.rows[0].password_hash).toMatch(/^\$2[aby]\$12\$/);
      const r = await call(login, '/api/auth/login', { body: { email: (await db.pool.query('SELECT email FROM users WHERE id=$1', [alice.id])).rows[0].email, password: PASSWORD }, ip: uniqueIp() });
      expect(r.status).toBe(200);
      const setCookie = r.headers.get('set-cookie')!;
      expect(setCookie).toMatch(/HttpOnly/i);
      expect(setCookie).toMatch(/SameSite=lax/i);
      const s = await db.pool.query('SELECT token_hash FROM sessions WHERE user_id = $1', [alice.id]);
      expect(s.rows.every((row) => row.token_hash.length === 64 && !r.cookie!.includes(row.token_hash))).toBe(true);
    });

    it('duplicate registration and bad logins return generic errors', async () => {
      const email = uniqueEmail();
      await call(register, '/api/auth/register', { body: { email, password: PASSWORD }, ip: uniqueIp() });
      const dup = await call(register, '/api/auth/register', { body: { email, password: PASSWORD }, ip: uniqueIp() });
      expect(dup.status).toBe(409);
      const wrongPw = await call(login, '/api/auth/login', { body: { email, password: 'wrong password!' }, ip: uniqueIp() });
      const noUser = await call(login, '/api/auth/login', { body: { email: uniqueEmail('ghost'), password: 'wrong password!' }, ip: uniqueIp() });
      expect(wrongPw.status).toBe(401);
      expect(noUser.status).toBe(401);
      expect(wrongPw.json.error.message).toBe(noUser.json.error.message);
    });

    it('rejects weak passwords and cross-site requests', async () => {
      expect((await call(register, '/api/auth/register', { body: { email: uniqueEmail(), password: 'short' }, ip: uniqueIp() })).status).toBe(400);
      expect((await call(login, '/api/auth/login', { body: { email: 'a@b.c', password: 'x' }, origin: 'https://evil.example' })).status).toBe(403);
    });

    it('rate-limits repeated login attempts', async () => {
      const ip = uniqueIp();
      const email = uniqueEmail('victim');
      const statuses: number[] = [];
      for (let i = 0; i < 6; i++) statuses.push((await call(login, '/api/auth/login', { body: { email, password: 'guess-' + i + 'xxxx' }, ip })).status);
      expect(statuses.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
      expect(statuses[5]).toBe(429);
    });

    it('me reflects the session and logout invalidates it server-side', async () => {
      const u = await signUp();
      expect((await call(me, '/api/auth/me', { cookie: u.cookie })).json.data.user.id).toBe(u.id);
      expect((await call(logout, '/api/auth/logout', { body: {}, cookie: u.cookie })).status).toBe(200);
      // The old cookie value no longer works even if replayed.
      expect((await call(me, '/api/auth/me', { cookie: u.cookie })).json.data.user).toBeNull();
    });

    it('password change requires the current password and revokes other sessions', async () => {
      const u = await signUp();
      const wrong = await call(changePassword, '/api/auth/password', { body: { current_password: 'not my password', password: 'a much better passphrase' }, cookie: u.cookie });
      expect(wrong.status).toBe(400);
      expect(wrong.json.error.code).toBe('wrong_password');
      const missing = await call(changePassword, '/api/auth/password', { body: { password: 'a much better passphrase' }, cookie: u.cookie });
      expect(missing.status).toBe(400);
      const r = await call(changePassword, '/api/auth/password', { body: { current_password: PASSWORD, password: 'a much better passphrase' }, cookie: u.cookie });
      expect(r.status).toBe(200);
      expect((await call(me, '/api/auth/me', { cookie: u.cookie })).json.data.user).toBeNull();
      expect((await call(me, '/api/auth/me', { cookie: r.cookie })).json.data.user.id).toBe(u.id);
    });
  });

  // ---------------- catalog & authorization ----------------
  describe('catalog and authorization', () => {
    it('lists published products with pagination and count (shop page query)', async () => {
      const r = await q(undefined, { table: 'products', op: 'select', select: '*', count: 'exact', filters: [['eq', 'is_published', true], ['gte', 'price', 0], ['lte', 'price', 25000]], order: [{ column: 'price', ascending: true }], offset: 0, limit: 12 });
      expect(r.status).toBe(200);
      expect(r.json.count).toBe(42);
      expect(r.json.data).toHaveLength(12);
      expect(typeof r.json.data[0].price).toBe('number');
      expect(r.json.data[0]).not.toHaveProperty('cost_price');
    });

    it('product detail by slug, deals with embedded products, search via "or"', async () => {
      const p = await q(undefined, { table: 'products', op: 'select', filters: [['eq', 'slug', 'arduino-uno-r3']], single: 'maybe' });
      expect(p.json.data.name).toBeTruthy();
      expect(p.json.data.images.length).toBeGreaterThan(0);
      const d = await q(undefined, { table: 'deals', op: 'select', select: '*, product:products(*)', filters: [['eq', 'is_active', true]], limit: 8 });
      expect(d.json.data).toHaveLength(8);
      expect(d.json.data[0].product.slug).toBeTruthy();
      const s = await q(undefined, { table: 'products', op: 'select', or: 'name.ilike.%arduino%,tags.cs.{arduino}', limit: 5 });
      expect(s.json.data.length).toBeGreaterThan(0);
      const missing = await q(undefined, { table: 'products', op: 'select', filters: [['eq', 'slug', 'does-not-exist']], single: 'maybe' });
      expect(missing.json.data).toBeNull();
      const badId = await q(undefined, { table: 'orders', op: 'select', filters: [['eq', 'id', 'not-a-uuid']] });
      expect(badId.status).toBe(401);
    });

    it('project detail returns its components (present in SQL seeds)', async () => {
      const proj = await q(undefined, { table: 'projects', op: 'select', filters: [['eq', 'slug', 'line-following-robot']], single: 'maybe' });
      const comps = await q(undefined, { table: 'project_components', op: 'select', select: '*, product:products(*)', filters: [['eq', 'project_id', proj.json.data.id]] });
      expect(comps.json.data).toHaveLength(4);
      expect(comps.json.data.every((c: any) => c.product?.slug)).toBe(true);
    });

    it('customers cannot change the catalog; admins can, with integrity checks', async () => {
      const deny = await q(alice.cookie, { table: 'categories', op: 'insert', values: { name: 'Hack', slug: 'hack' } });
      expect(deny.status).toBe(403);
      const created = await q(admin.cookie, { table: 'categories', op: 'insert', values: { name: 'Test Cat', slug: 'test-cat', icon_name: 'Cpu', is_featured: false }, returning: 'id', single: 'single' });
      expect(created.status).toBe(200);
      const dup = await q(admin.cookie, { table: 'categories', op: 'insert', values: { name: 'Test Cat', slug: 'test-cat' } });
      expect(dup.status).toBe(409);
      const arduino = await q(admin.cookie, { table: 'categories', op: 'select', select: 'id', filters: [['eq', 'slug', 'arduino']], single: 'single' });
      const inUse = await q(admin.cookie, { table: 'categories', op: 'delete', filters: [['eq', 'id', arduino.json.data.id]] });
      expect(inUse.status).toBe(409);
      expect((await q(admin.cookie, { table: 'categories', op: 'delete', filters: [['eq', 'id', created.json.data.id]] })).status).toBe(200);
      expect((await q(admin.cookie, { table: 'products', op: 'update', values: { price: -5 }, filters: [['eq', 'slug', 'arduino-uno-r3']] })).status).toBe(400);
    });

    it('profiles: own only, role not writable, admin can list customers', async () => {
      const own = await q(alice.cookie, { table: 'profiles', op: 'select', select: 'id, full_name, role, phone', filters: [['eq', 'id', alice.id]], single: 'maybe' });
      expect(own.json.data.id).toBe(alice.id);
      const other = await q(alice.cookie, { table: 'profiles', op: 'select', filters: [['eq', 'id', bob.id]], single: 'maybe' });
      expect(other.json.data).toBeNull();
      expect((await q(alice.cookie, { table: 'profiles', op: 'update', values: { role: 'admin' }, filters: [['eq', 'id', alice.id]] })).status).toBe(400);
      expect((await q(alice.cookie, { table: 'profiles', op: 'update', values: { full_name: 'Alice', phone: '9999999999' }, filters: [['eq', 'id', alice.id]] })).status).toBe(200);
      // Updating someone else's profile silently affects nothing.
      await q(alice.cookie, { table: 'profiles', op: 'update', values: { full_name: 'pwned' }, filters: [['eq', 'id', bob.id]] });
      expect((await db.pool.query('SELECT full_name FROM profiles WHERE id=$1', [bob.id])).rows[0].full_name).toBe('Test User');
      const all = await q(admin.cookie, { table: 'profiles', op: 'select', select: '*' });
      expect(all.json.data.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ---------------- cart & checkout ----------------
  describe('cart and checkout', () => {
    const address = { fullName: 'Alice', phone: '9876543210', addressLine1: '1 MG Road', addressLine2: '', city: 'Bengaluru', state: 'KA', postalCode: '560001', country: 'India' };
    let cartId: string;
    let uno: { id: string; price: number; stock: number };

    async function addToCart(cookie: string, productId: string, quantity: number) {
      return q(cookie, { table: 'cart_items', op: 'insert', values: { cart_id: cartId, product_id: productId, quantity } });
    }

    beforeAll(async () => {
      const c = await q(alice.cookie, { table: 'carts', op: 'insert', values: { user_id: alice.id }, returning: 'id', single: 'single' });
      cartId = c.json.data.id;
      uno = (await db.pool.query(`SELECT id, price, stock FROM products WHERE slug = 'arduino-uno-r3'`)).rows[0];
    });

    it("users cannot touch another user's cart", async () => {
      expect((await addToCart(bob.cookie, uno.id, 1)).status).toBe(403);
      const peek = await q(bob.cookie, { table: 'cart_items', op: 'select', filters: [['eq', 'cart_id', cartId]] });
      expect(peek.json.data).toEqual([]);
    });

    it('creates an order with server-side totals, decrements stock, clears the cart', async () => {
      expect((await addToCart(alice.cookie, uno.id, 2)).status).toBe(200);
      const key = randomUUID();
      // Tampered client fields are ignored (not in the schema / not trusted).
      const r = await call(checkout, '/api/checkout', { cookie: alice.cookie, body: { idempotency_key: key, delivery_method: 'standard', shipping_address: address } });
      expect(r.status).toBe(201);
      const expected = computeTotals([{ unitPrice: uno.price, quantity: 2 }], 'standard');
      const order = (await db.pool.query('SELECT * FROM orders WHERE id = $1', [r.json.data.orderId])).rows[0];
      expect([order.subtotal, order.shipping_cost, order.tax, order.total]).toEqual([expected.subtotal, expected.shipping, expected.tax, expected.total]);
      expect(order.total).toBe(2 * uno.price + 0 + Math.round(2 * uno.price * 0.05)); // 1299 x 2 -> free shipping
      expect(order.payment_status).toBe('pending');
      expect(order.status).toBe('confirmed');
      expect((await db.pool.query('SELECT stock FROM products WHERE id=$1', [uno.id])).rows[0].stock).toBe(uno.stock - 2);
      expect((await db.pool.query('SELECT count(*)::int n FROM cart_items WHERE cart_id=$1', [cartId])).rows[0].n).toBe(0);

      // Retry with the same key: same order, no double stock decrement.
      const again = await call(checkout, '/api/checkout', { cookie: alice.cookie, body: { idempotency_key: key, delivery_method: 'standard', shipping_address: address } });
      expect(again.status).toBe(200);
      expect(again.json.data.orderId).toBe(r.json.data.orderId);
      expect((await db.pool.query('SELECT stock FROM products WHERE id=$1', [uno.id])).rows[0].stock).toBe(uno.stock - 2);

      // Order isolation.
      const mine = await q(alice.cookie, { table: 'orders', op: 'select', select: '*, order_items(*)', filters: [['eq', 'id', r.json.data.orderId]], single: 'maybe' });
      expect(mine.json.data.order_items).toHaveLength(1);
      expect(mine.json.data).not.toHaveProperty('idempotency_key');
      const theirs = await q(bob.cookie, { table: 'orders', op: 'select', filters: [['eq', 'id', r.json.data.orderId]], single: 'maybe' });
      expect(theirs.json.data).toBeNull();
      expect((await q(alice.cookie, { table: 'order_items', op: 'select', select: '*' })).json.data).toHaveLength(1);
      expect((await q(bob.cookie, { table: 'order_items', op: 'select', select: '*' })).json.data).toHaveLength(0);

      // Admin may change fulfilment status only.
      expect((await q(admin.cookie, { table: 'orders', op: 'update', values: { status: 'shipped' }, filters: [['eq', 'id', r.json.data.orderId]] })).status).toBe(200);
      expect((await q(admin.cookie, { table: 'orders', op: 'update', values: { payment_status: 'paid' }, filters: [['eq', 'id', r.json.data.orderId]] })).status).toBe(400);
      expect((await q(alice.cookie, { table: 'orders', op: 'update', values: { status: 'delivered' }, filters: [['eq', 'id', r.json.data.orderId]] })).status).toBe(403);
    });

    it('concurrent duplicate submissions create exactly one order', async () => {
      await addToCart(alice.cookie, uno.id, 1);
      const key = randomUUID();
      const body = { idempotency_key: key, delivery_method: 'express', shipping_address: address };
      const results = await Promise.all([1, 2, 3].map(() => call(checkout, '/api/checkout', { cookie: alice.cookie, body })));
      const ids = new Set(results.filter((x) => x.status < 300).map((x) => x.json.data.orderId));
      expect(ids.size).toBe(1);
      expect((await db.pool.query('SELECT count(*)::int n FROM orders WHERE idempotency_key=$1', [key])).rows[0].n).toBe(1);
    });

    it('rolls back everything when stock is insufficient or the coupon is invalid', async () => {
      const before = (await db.pool.query('SELECT stock FROM products WHERE id=$1', [uno.id])).rows[0].stock;
      const ordersBefore = (await db.pool.query('SELECT count(*)::int n FROM orders')).rows[0].n;
      expect((await addToCart(alice.cookie, uno.id, before + 1)).status).toBe(200); // more than in stock
      const r = await call(checkout, '/api/checkout', { cookie: alice.cookie, body: { idempotency_key: randomUUID(), delivery_method: 'standard', shipping_address: address } });
      expect(r.status).toBe(409);
      await db.pool.query('UPDATE cart_items SET quantity = 1 WHERE cart_id = $1', [cartId]);
      const c = await call(checkout, '/api/checkout', { cookie: alice.cookie, body: { idempotency_key: randomUUID(), delivery_method: 'standard', shipping_address: address, coupon_code: 'NOPE' } });
      expect(c.status).toBe(400);
      expect((await db.pool.query('SELECT stock FROM products WHERE id=$1', [uno.id])).rows[0].stock).toBe(before);
      expect((await db.pool.query('SELECT count(*)::int n FROM orders')).rows[0].n).toBe(ordersBefore);
      expect((await db.pool.query('SELECT count(*)::int n FROM cart_items WHERE cart_id=$1', [cartId])).rows[0].n).toBe(1);
    });

    it('applies a valid coupon server-side and refuses online payment', async () => {
      const r = await call(checkout, '/api/checkout', { cookie: alice.cookie, body: { idempotency_key: randomUUID(), delivery_method: 'standard', shipping_address: address, coupon_code: 'welcome10' } });
      expect(r.status).toBe(201);
      const o = (await db.pool.query('SELECT discount, coupon_code FROM orders WHERE id=$1', [r.json.data.orderId])).rows[0];
      expect(o.coupon_code).toBe('WELCOME10');
      expect(Number(o.discount)).toBeGreaterThan(0);
      await addToCart(alice.cookie, uno.id, 1);
      const online = await call(checkout, '/api/checkout', { cookie: alice.cookie, body: { idempotency_key: randomUUID(), delivery_method: 'standard', shipping_address: address, payment_method: 'razorpay' } });
      expect(online.status).toBe(503);
      expect(online.json.error.code).toBe('payment_unavailable');
    });

    it('requires a signed-in user', async () => {
      expect((await call(checkout, '/api/checkout', { body: { idempotency_key: randomUUID(), delivery_method: 'standard', shipping_address: address } })).status).toBe(401);
    });
  });

  // ---------------- payments webhook ----------------
  describe('Razorpay webhook verification', () => {
    const secret = 'whsec_test_only';
    const send = (payload: object, opts: { sig?: string; id?: string } = {}) => {
      const raw = JSON.stringify(payload);
      const sig = opts.sig ?? createHmac('sha256', secret).update(raw).digest('hex');
      return call(webhook, '/api/payments/razorpay/webhook', { body: raw, origin: null, headers: { 'x-razorpay-signature': sig, 'x-razorpay-event-id': opts.id ?? randomUUID() } });
    };

    it('is unavailable without a configured secret, rejects bad signatures', async () => {
      delete process.env.RAZORPAY_WEBHOOK_SECRET;
      expect((await send({ event: 'x' })).status).toBe(503);
      process.env.RAZORPAY_WEBHOOK_SECRET = secret;
      expect((await send({ event: 'x' }, { sig: 'deadbeef' })).status).toBe(401);
    });

    it('marks an order paid only for a verified, amount-matching event, idempotently', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = secret;
      const o = (await db.pool.query(`SELECT id, total FROM orders WHERE user_id=$1 ORDER BY created_at LIMIT 1`, [alice.id])).rows[0];
      await db.pool.query(`UPDATE orders SET payment_method='razorpay', payment_status='pending', razorpay_order_id='order_TEST1' WHERE id=$1`, [o.id]);
      const paise = Math.round(Number(o.total) * 100);
      const ev = (amount: number) => ({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_TEST1', order_id: 'order_TEST1', amount } } } });

      expect((await send(ev(paise - 100))).status).toBe(200);
      expect((await db.pool.query('SELECT payment_status FROM orders WHERE id=$1', [o.id])).rows[0].payment_status).toBe('pending');

      const id = randomUUID();
      expect((await send(ev(paise), { id })).status).toBe(200);
      expect((await db.pool.query('SELECT payment_status, razorpay_payment_id FROM orders WHERE id=$1', [o.id])).rows[0]).toEqual({ payment_status: 'paid', razorpay_payment_id: 'pay_TEST1' });
      expect((await send(ev(paise), { id })).status).toBe(200); // replay
      expect((await db.pool.query(`SELECT count(*)::int n FROM payment_events WHERE event_id=$1`, [id])).rows[0].n).toBe(1);
      delete process.env.RAZORPAY_WEBHOOK_SECRET;
    });
  });

  // ---------------- health ----------------
  describe('health and safe failure', () => {
    it('reports ok with a working database, without configuration details', async () => {
      const r = await call(health, '/api/health');
      expect(r.status).toBe(200);
      expect(r.json).toEqual({ status: 'ok', dataSource: 'postgres', database: 'ok' });
    });

    it('fails closed when postgres mode is selected but not configured (no mock fallback)', async () => {
      setPoolForTesting(undefined);
      const saved = process.env.DATABASE_URL;
      delete process.env.DATABASE_URL;
      try {
        const h = await call(health, '/api/health');
        expect(h.status).toBe(503);
        expect(h.json.database).toBe('not_configured');
        const d = await q(undefined, { table: 'products', op: 'select' });
        expect(d.status).toBe(503);
        expect(d.json.data).toBeNull();
        expect(JSON.stringify(d.json)).not.toMatch(/DATABASE_URL|postgres:\/\//);
      } finally {
        if (saved !== undefined) process.env.DATABASE_URL = saved;
        setPoolForTesting(db.pool);
      }
    });

    it('in mock mode the API is disabled and health stays ok', async () => {
      process.env.DATA_SOURCE = 'mock';
      try {
        expect((await call(health, '/api/health')).json).toEqual({ status: 'ok', dataSource: 'mock', database: 'disabled' });
        expect((await q(undefined, { table: 'products', op: 'select' })).status).toBe(503);
      } finally {
        process.env.DATA_SOURCE = 'postgres';
      }
    });
  });
});

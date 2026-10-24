import { randomUUID } from 'crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as login } from '@/app/api/auth/login/route';
import { POST as verifyEmail } from '@/app/api/auth/verify-email/route';
import { POST as data } from '@/app/api/data/route';
import { POST as checkout } from '@/app/api/checkout/route';
import { POST as subscribe } from '@/app/api/newsletter/subscribe/route';
import { POST as confirmSub } from '@/app/api/newsletter/confirm/route';
import { POST as unsubscribe } from '@/app/api/newsletter/unsubscribe/route';
import { setEmailRuntimeForTesting } from '@/lib/server/email';
import { loadEmailConfig } from '@/lib/server/email/config';
import { call, createTestDb, dbAvailable, uniqueEmail, uniqueIp, type TestDb } from './helpers';

const PASSWORD = 'correct horse battery';
const ADMIN_EMAIL = 'shop.owner@qrobo.test';

describe.skipIf(!dbAvailable())('e-commerce emails: welcome, shipping, low stock, newsletter', () => {
  let db: TestDb;
  let adminCookie = '';

  beforeAll(async () => {
    db = await createTestDb();
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;
    setEmailRuntimeForTesting({ cfg: loadEmailConfig({ EMAIL_PROVIDER: 'log', APP_URL: 'https://shop.test' }), send: async () => {} });
    const a = await signUp(ADMIN_EMAIL, 'Owner');
    await verify(a.email);
    adminCookie = (await call(login, '/api/auth/login', { body: { email: ADMIN_EMAIL, password: PASSWORD }, ip: uniqueIp() })).cookie!;
  });
  afterAll(async () => {
    setEmailRuntimeForTesting(undefined);
    delete process.env.ADMIN_EMAILS;
    await db?.drop();
  });

  const outbox = async (to: string) =>
    (await db.pool.query(`SELECT template, subject, html, text_body FROM email_outbox WHERE to_email = $1 ORDER BY created_at`, [to])).rows;
  const tokenFrom = (text: string, path: string) => decodeURIComponent(new RegExp(`${path}\\?token=([A-Za-z0-9_\\-%]+)`).exec(text)![1]);

  async function signUp(email = uniqueEmail(), fullName = 'Test Maker') {
    const r = await call(register, '/api/auth/register', { body: { email, password: PASSWORD, full_name: fullName }, ip: uniqueIp() });
    expect(r.status).toBe(201);
    return { email, cookie: r.cookie!, id: r.json.data.user.id as string };
  }
  async function verify(email: string) {
    const mail = (await outbox(email)).find((m) => m.template === 'verify_email')!;
    return call(verifyEmail, '/api/auth/verify-email', { body: { token: tokenFrom(mail.text_body, 'verify-email') }, ip: uniqueIp() });
  }
  async function order(cookie: string, slug: string, quantity = 1) {
    const product = (await db.pool.query(`SELECT id FROM products WHERE slug = $1`, [slug])).rows[0];
    const cart = await call(data, '/api/data', { cookie, body: { table: 'carts', op: 'insert', values: {}, returning: 'id', single: 'single' } });
    let cartId = cart.json.data?.id;
    if (!cartId) cartId = (await call(data, '/api/data', { cookie, body: { table: 'carts', op: 'select', single: 'single' } })).json.data.id;
    await call(data, '/api/data', { cookie, body: { table: 'cart_items', op: 'insert', values: { cart_id: cartId, product_id: product.id, quantity } } });
    const address = { fullName: 'Ravi Kumar', phone: '9876543210', addressLine1: '12 Tank Bund Rd', addressLine2: '', city: 'Hyderabad', state: 'TS', postalCode: '500001', country: 'India' };
    const r = await call(checkout, '/api/checkout', { cookie, body: { idempotency_key: randomUUID(), delivery_method: 'express', shipping_address: address } });
    expect(r.status).toBe(201);
    return r.json.data as { orderId: string; orderNumber: string };
  }

  it('customers get one welcome email (with the active welcome coupon) on first verification only', async () => {
    const u = await signUp(uniqueEmail('welcome'), 'Priya Sharma');
    expect((await verify(u.email)).status).toBe(200);
    const welcome = (await outbox(u.email)).filter((m) => m.template === 'welcome');
    expect(welcome).toHaveLength(1);
    expect(welcome[0].subject).toBe('Welcome to Qrobo, Priya!');
    expect(welcome[0].html).toContain('WELCOME10');
    // The admin bootstrap account got admin access instead of a customer welcome.
    expect((await outbox(ADMIN_EMAIL)).map((m) => m.template)).not.toContain('welcome');
  });

  it('order confirmation and admin alert include images, the address and delivery method', async () => {
    const u = await signUp();
    const o = await order(u.cookie, 'arduino-uno-r3');
    const conf = (await outbox(u.email)).find((m) => m.template === 'order_confirmation')!;
    expect(conf.html).toContain('Hyderabad');
    expect(conf.html).toContain('Express delivery');
    expect(conf.html).toMatch(/<img src="https:\/\//);
    const alert = (await outbox(ADMIN_EMAIL)).find((m) => m.template === 'admin_new_order' && m.subject.includes(o.orderNumber))!;
    expect(alert.html).toContain('Ravi Kumar');
    expect(alert.html).toContain(u.email);
  });

  it('admins add courier/tracking when shipping; the customer email carries it; tracking-only edits send nothing', async () => {
    const u = await signUp();
    const o = await order(u.cookie, 'arduino-uno-r3');
    const ship = await call(data, '/api/data', {
      cookie: adminCookie,
      body: { table: 'orders', op: 'update', values: { status: 'shipped', courier: 'Delhivery', tracking_number: 'DL998877', tracking_url: 'https://www.delhivery.com/track/package/DL998877' }, filters: [['eq', 'id', o.orderId]] },
    });
    expect(ship.status).toBe(200);
    const mails = (await outbox(u.email)).filter((m) => m.template === 'order_status');
    expect(mails).toHaveLength(1);
    expect(mails[0].html).toContain('DL998877');
    expect(mails[0].html).toContain('https://www.delhivery.com/track/package/DL998877');
    expect(mails[0].text_body).toContain('Courier: Delhivery');

    // Customer sees it on their order, cannot change it.
    const mine = await call(data, '/api/data', { cookie: u.cookie, body: { table: 'orders', op: 'select', filters: [['eq', 'id', o.orderId]], single: 'single' } });
    expect(mine.json.data.tracking_number).toBe('DL998877');
    expect((await call(data, '/api/data', { cookie: u.cookie, body: { table: 'orders', op: 'update', values: { tracking_number: 'x' }, filters: [['eq', 'id', o.orderId]] } })).status).toBe(403);

    // Editing tracking only (no status) does not email again; non-https links are rejected by the database.
    await call(data, '/api/data', { cookie: adminCookie, body: { table: 'orders', op: 'update', values: { tracking_number: 'DL000' }, filters: [['eq', 'id', o.orderId]] } });
    expect((await outbox(u.email)).filter((m) => m.template === 'order_status')).toHaveLength(1);
    const bad = await call(data, '/api/data', { cookie: adminCookie, body: { table: 'orders', op: 'update', values: { tracking_url: 'javascript:alert(1)' }, filters: [['eq', 'id', o.orderId]] } });
    expect(bad.status).toBe(400);

    // Delivered email asks for a review of the purchased product.
    await call(data, '/api/data', { cookie: adminCookie, body: { table: 'orders', op: 'update', values: { status: 'delivered' }, filters: [['eq', 'id', o.orderId]] } });
    const delivered = (await outbox(u.email)).filter((m) => m.template === 'order_status').pop()!;
    expect(delivered.html).toContain('/product/arduino-uno-r3');
  });

  it('admins get a low-stock alert once, when an order makes a product cross its threshold', async () => {
    await db.pool.query(`UPDATE products SET stock = 7, low_stock_threshold = 5 WHERE slug = 'esp32-devkit-v1'`);
    const before = (await outbox(ADMIN_EMAIL)).filter((m) => m.template === 'admin_low_stock').length;
    const u = await signUp();
    await order(u.cookie, 'esp32-devkit-v1', 1); // 7 -> 6: above threshold, no alert
    expect((await outbox(ADMIN_EMAIL)).filter((m) => m.template === 'admin_low_stock')).toHaveLength(before);
    await order(u.cookie, 'esp32-devkit-v1', 2); // 6 -> 4: crosses 5
    let alerts = (await outbox(ADMIN_EMAIL)).filter((m) => m.template === 'admin_low_stock');
    expect(alerts).toHaveLength(before + 1);
    expect(alerts[alerts.length - 1].html).toContain('4 left');
    await order(u.cookie, 'esp32-devkit-v1', 1); // 4 -> 3: already below, no repeat
    alerts = (await outbox(ADMIN_EMAIL)).filter((m) => m.template === 'admin_low_stock');
    expect(alerts).toHaveLength(before + 1);
    await order(u.cookie, 'esp32-devkit-v1', 3); // 3 -> 0: sold out alert
    alerts = (await outbox(ADMIN_EMAIL)).filter((m) => m.template === 'admin_low_stock');
    expect(alerts).toHaveLength(before + 2);
    expect(alerts[alerts.length - 1].subject).toMatch(/^Out of stock/);
  });

  it('newsletter: double opt-in, no enumeration, one-click unsubscribe, profile setting kept in sync', async () => {
    const u = await signUp(uniqueEmail('news'));
    const ip = uniqueIp();
    const first = await call(subscribe, '/api/newsletter/subscribe', { body: { email: u.email.toUpperCase() }, ip });
    expect(first.status).toBe(200);
    const status = async () => (await db.pool.query(`SELECT status FROM newsletter_subscribers WHERE email = $1`, [u.email])).rows[0]?.status;
    expect(await status()).toBe('pending');
    // Pending subscribers receive only the confirmation email.
    const mails = await outbox(u.email);
    expect(mails.filter((m) => m.template.startsWith('newsletter'))).toHaveLength(1);
    const confirmMail = mails.find((m) => m.template === 'newsletter_confirm')!;
    const token = tokenFrom(confirmMail.text_body, 'newsletter/confirm');
    const stored = (await db.pool.query(`SELECT confirm_token_hash FROM newsletter_subscribers WHERE email = $1`, [u.email])).rows[0];
    expect(stored.confirm_token_hash).not.toContain(token);

    expect((await call(confirmSub, '/api/newsletter/confirm', { body: { token }, ip: uniqueIp() })).status).toBe(200);
    expect(await status()).toBe('subscribed');
    expect((await db.pool.query(`SELECT notify_marketing FROM profiles WHERE id = $1`, [u.id])).rows[0].notify_marketing).toBe(true);
    expect((await call(confirmSub, '/api/newsletter/confirm', { body: { token }, ip: uniqueIp() })).status).toBe(400); // single use

    // Subscribing again while subscribed: same answer, no new email.
    const again = await call(subscribe, '/api/newsletter/subscribe', { body: { email: u.email }, ip: uniqueIp() });
    expect(again.json).toEqual(first.json);
    const unknown = await call(subscribe, '/api/newsletter/subscribe', { body: { email: uniqueEmail('stranger') }, ip: uniqueIp() });
    expect(unknown.json).toEqual(first.json);
    expect((await outbox(u.email)).filter((m) => m.template === 'newsletter_confirm')).toHaveLength(1);

    const welcome = (await outbox(u.email)).find((m) => m.template === 'newsletter_welcome')!;
    const unsubToken = tokenFrom(welcome.text_body, 'newsletter/unsubscribe');
    expect((await call(unsubscribe, '/api/newsletter/unsubscribe', { body: { token: unsubToken }, ip: uniqueIp() })).status).toBe(200);
    expect(await status()).toBe('unsubscribed');
    expect((await db.pool.query(`SELECT notify_marketing FROM profiles WHERE id = $1`, [u.id])).rows[0].notify_marketing).toBe(false);
    expect((await call(unsubscribe, '/api/newsletter/unsubscribe', { body: { token: 'x'.repeat(43) }, ip: uniqueIp() })).status).toBe(400);

    // Invalid emails are rejected; the subscriber table is not reachable through the data gateway.
    expect((await call(subscribe, '/api/newsletter/subscribe', { body: { email: 'not-an-email' }, ip: uniqueIp() })).status).toBe(400);
    expect((await call(data, '/api/data', { cookie: adminCookie, body: { table: 'newsletter_subscribers', op: 'select' } })).status).toBe(404);
  });
});

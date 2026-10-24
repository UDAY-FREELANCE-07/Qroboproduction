import { randomUUID } from 'crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as login } from '@/app/api/auth/login/route';
import { GET as me } from '@/app/api/auth/me/route';
import { POST as verifyEmail } from '@/app/api/auth/verify-email/route';
import { POST as resendVerification } from '@/app/api/auth/resend-verification/route';
import { POST as forgotPassword } from '@/app/api/auth/forgot-password/route';
import { POST as resetPassword } from '@/app/api/auth/reset-password/route';
import { POST as data } from '@/app/api/data/route';
import { POST as checkout } from '@/app/api/checkout/route';
import { GET as emailStatus, POST as sendTestEmail } from '@/app/api/admin/email/route';
import { setEmailRuntimeForTesting } from '@/lib/server/email';
import { loadEmailConfig } from '@/lib/server/email/config';
import { deliverPending, MAX_ATTEMPTS } from '@/lib/server/email/outbox';
import { call, createTestDb, dbAvailable, uniqueEmail, uniqueIp, type TestDb } from './helpers';

const PASSWORD = 'correct horse battery';
const ADMIN_EMAIL = 'chirrauday02@gmail.com';

describe.skipIf(!dbAvailable())('email: verification, admin bootstrap, password reset, notifications', () => {
  let db: TestDb;
  const delivered: { to: string; subject: string; text: string }[] = [];

  beforeAll(async () => {
    db = await createTestDb();
    process.env.ADMIN_EMAILS = ADMIN_EMAIL;
    // Capture instead of sending; kickOutbox() uses this runtime too.
    setEmailRuntimeForTesting({
      cfg: loadEmailConfig({ EMAIL_PROVIDER: 'log', APP_URL: 'https://shop.test' }),
      send: async (m) => {
        delivered.push({ to: m.to, subject: m.subject, text: m.text });
      },
    });
  });
  afterAll(async () => {
    setEmailRuntimeForTesting(undefined);
    delete process.env.ADMIN_EMAILS;
    await db?.drop();
  });
  beforeEach(() => {
    delivered.length = 0;
  });

  const outbox = async (to: string) =>
    (await db.pool.query(`SELECT template, subject, text_body, status FROM email_outbox WHERE to_email = $1 ORDER BY created_at`, [to])).rows;
  const tokenFrom = (text: string, path: string) => {
    const m = new RegExp(`${path}\\?token=([A-Za-z0-9_\\-%]+)`).exec(text);
    if (!m) throw new Error('no token link in email');
    return decodeURIComponent(m[1]);
  };
  async function signUp(email = uniqueEmail(), fullName = 'Test User') {
    const r = await call(register, '/api/auth/register', { body: { email, password: PASSWORD, full_name: fullName }, ip: uniqueIp() });
    expect(r.status).toBe(201);
    return { email, cookie: r.cookie!, id: r.json.data.user.id as string };
  }

  it('registration queues a verification email with an https APP_URL link', async () => {
    const u = await signUp();
    const mails = await outbox(u.email);
    expect(mails.map((m) => m.template)).toEqual(['verify_email']);
    expect(mails[0].text_body).toContain('https://shop.test/verify-email?token=');
    const status = await call(me, '/api/auth/me', { cookie: u.cookie });
    expect(status.json.data.user.email_verified).toBe(false);
  });

  it('verification tokens are hashed at rest, single-use, and mark the email verified', async () => {
    const u = await signUp();
    const token = tokenFrom((await outbox(u.email))[0].text_body, 'verify-email');
    const stored = await db.pool.query(`SELECT token_hash FROM email_tokens WHERE user_id = $1`, [u.id]);
    expect(stored.rows[0].token_hash).toHaveLength(64);
    expect(stored.rows[0].token_hash).not.toContain(token);

    const ok = await call(verifyEmail, '/api/auth/verify-email', { body: { token }, ip: uniqueIp() });
    expect(ok.status).toBe(200);
    expect(ok.json.data).toEqual({ verified: true, role: 'customer' });
    expect((await call(me, '/api/auth/me', { cookie: u.cookie })).json.data.user.email_verified).toBe(true);

    const replay = await call(verifyEmail, '/api/auth/verify-email', { body: { token }, ip: uniqueIp() });
    expect(replay.status).toBe(400);
    expect((await call(verifyEmail, '/api/auth/verify-email', { body: { token: 'x'.repeat(43) }, ip: uniqueIp() })).status).toBe(400);
  });

  it('expired tokens are rejected', async () => {
    const u = await signUp();
    const token = tokenFrom((await outbox(u.email))[0].text_body, 'verify-email');
    await db.pool.query(`UPDATE email_tokens SET expires_at = now() - interval '1 minute' WHERE user_id = $1`, [u.id]);
    expect((await call(verifyEmail, '/api/auth/verify-email', { body: { token }, ip: uniqueIp() })).status).toBe(400);
  });

  it(`${ADMIN_EMAIL} becomes admin only after verifying the inbox`, async () => {
    const u = await signUp(ADMIN_EMAIL, 'Uday');
    // Registering the address alone grants nothing.
    let role = (await db.pool.query(`SELECT role, full_name FROM profiles WHERE id = $1`, [u.id])).rows[0];
    expect(role).toEqual({ role: 'customer', full_name: 'Uday' });
    const adminWrite = { table: 'banners', op: 'update', values: { sort_order: 1 }, filters: [['eq', 'title', 'BUILD SOMETHING AMAZING']] };
    expect((await call(data, '/api/data', { body: adminWrite, cookie: u.cookie })).status).toBe(403);

    const token = tokenFrom((await outbox(ADMIN_EMAIL))[0].text_body, 'verify-email');
    const v = await call(verifyEmail, '/api/auth/verify-email', { body: { token }, ip: uniqueIp() });
    expect(v.json.data.role).toBe('admin');
    role = (await db.pool.query(`SELECT role, full_name FROM profiles WHERE id = $1`, [u.id])).rows[0];
    expect(role).toEqual({ role: 'admin', full_name: 'Uday' });
    expect((await outbox(ADMIN_EMAIL)).map((m) => m.template)).toContain('admin_access');
    // Role is read from the DB per request, so the same session now has admin rights.
    expect((await call(data, '/api/data', { body: adminWrite, cookie: u.cookie })).status).toBe(200);
  });

  it('a non-listed address is never promoted by verification', async () => {
    const u = await signUp(uniqueEmail('not.admin'));
    const token = tokenFrom((await outbox(u.email))[0].text_body, 'verify-email');
    expect((await call(verifyEmail, '/api/auth/verify-email', { body: { token }, ip: uniqueIp() })).json.data.role).toBe('customer');
  });

  it('resend-verification needs a session and issues a fresh token that invalidates the old one', async () => {
    expect((await call(resendVerification, '/api/auth/resend-verification', { body: {} })).status).toBe(401);
    const u = await signUp();
    const first = tokenFrom((await outbox(u.email))[0].text_body, 'verify-email');
    expect((await call(resendVerification, '/api/auth/resend-verification', { body: {}, cookie: u.cookie })).json.data.sent).toBe(true);
    const mails = await outbox(u.email);
    const second = tokenFrom(mails[mails.length - 1].text_body, 'verify-email');
    expect(second).not.toBe(first);
    expect((await call(verifyEmail, '/api/auth/verify-email', { body: { token: first }, ip: uniqueIp() })).status).toBe(400);
    expect((await call(verifyEmail, '/api/auth/verify-email', { body: { token: second }, ip: uniqueIp() })).status).toBe(200);
  });

  it('forgot-password answers identically for unknown emails (no enumeration)', async () => {
    const u = await signUp();
    const known = await call(forgotPassword, '/api/auth/forgot-password', { body: { email: u.email }, ip: uniqueIp() });
    const unknown = await call(forgotPassword, '/api/auth/forgot-password', { body: { email: uniqueEmail('ghost') }, ip: uniqueIp() });
    expect([known.status, unknown.status]).toEqual([200, 200]);
    expect(known.json).toEqual(unknown.json);
    expect((await outbox(u.email)).map((m) => m.template)).toContain('reset_password');
  });

  it('reset-password sets the new password, revokes sessions, is single-use, and verifies the email', async () => {
    const u = await signUp();
    await call(forgotPassword, '/api/auth/forgot-password', { body: { email: u.email }, ip: uniqueIp() });
    const mails = await outbox(u.email);
    const token = tokenFrom(mails.find((m) => m.template === 'reset_password')!.text_body, 'reset-password');

    expect((await call(resetPassword, '/api/auth/reset-password', { body: { token, password: 'short' }, ip: uniqueIp() })).status).toBe(400);
    const r = await call(resetPassword, '/api/auth/reset-password', { body: { token, password: 'brand new passphrase' }, ip: uniqueIp() });
    expect(r.status).toBe(200);
    expect((await call(me, '/api/auth/me', { cookie: u.cookie })).json.data.user).toBeNull();
    expect((await call(login, '/api/auth/login', { body: { email: u.email, password: PASSWORD }, ip: uniqueIp() })).status).toBe(401);
    const relogin = await call(login, '/api/auth/login', { body: { email: u.email, password: 'brand new passphrase' }, ip: uniqueIp() });
    expect(relogin.status).toBe(200);
    expect(relogin.json.data.user.email_verified).toBe(true);
    expect((await outbox(u.email)).map((m) => m.template)).toContain('password_changed');
    expect((await call(resetPassword, '/api/auth/reset-password', { body: { token, password: 'another passphrase' }, ip: uniqueIp() })).status).toBe(400);
  });

  it('notification settings are owner-editable; role stays protected; other tables unreachable', async () => {
    const u = await signUp();
    const upd = await call(data, '/api/data', { cookie: u.cookie, body: { table: 'profiles', op: 'update', values: { notify_marketing: true, notify_order_updates: false }, filters: [['eq', 'id', u.id]] } });
    expect(upd.status).toBe(200);
    const row = (await db.pool.query(`SELECT notify_marketing, notify_order_updates, role FROM profiles WHERE id = $1`, [u.id])).rows[0];
    expect(row).toEqual({ notify_marketing: true, notify_order_updates: false, role: 'customer' });
    expect((await call(data, '/api/data', { cookie: u.cookie, body: { table: 'profiles', op: 'update', values: { role: 'admin' }, filters: [['eq', 'id', u.id]] } })).status).toBe(400);
    expect((await call(data, '/api/data', { cookie: u.cookie, body: { table: 'email_outbox', op: 'select' } })).status).toBe(404);
    expect((await call(data, '/api/data', { cookie: u.cookie, body: { table: 'email_tokens', op: 'select' } })).status).toBe(404);
  });

  it('checkout queues an order confirmation and an alert to verified admins; status changes notify the customer', async () => {
    const admin = (await db.pool.query(`SELECT u.id FROM users u WHERE email = $1`, [ADMIN_EMAIL])).rows[0];
    const adminLogin = await call(login, '/api/auth/login', { body: { email: ADMIN_EMAIL, password: PASSWORD }, ip: uniqueIp() });
    expect(admin && adminLogin.status).toBe(200);

    const u = await signUp();
    const product = (await db.pool.query(`SELECT id FROM products WHERE slug = 'arduino-uno-r3'`)).rows[0];
    const cart = await call(data, '/api/data', { cookie: u.cookie, body: { table: 'carts', op: 'insert', values: {}, returning: 'id', single: 'single' } });
    await call(data, '/api/data', { cookie: u.cookie, body: { table: 'cart_items', op: 'insert', values: { cart_id: cart.json.data.id, product_id: product.id, quantity: 1 } } });
    const address = { fullName: 'Test', phone: '9876543210', addressLine1: '1 MG Road', addressLine2: '', city: 'Bengaluru', state: 'KA', postalCode: '560001', country: 'India' };
    const order = await call(checkout, '/api/checkout', { cookie: u.cookie, body: { idempotency_key: randomUUID(), delivery_method: 'standard', shipping_address: address } });
    expect(order.status).toBe(201);

    const customerMail = await outbox(u.email);
    expect(customerMail.map((m) => m.template)).toContain('order_confirmation');
    expect(customerMail.find((m) => m.template === 'order_confirmation')!.subject).toContain(order.json.data.orderNumber);
    expect((await outbox(ADMIN_EMAIL)).map((m) => m.template)).toContain('admin_new_order');

    const ship = await call(data, '/api/data', { cookie: adminLogin.cookie, body: { table: 'orders', op: 'update', values: { status: 'shipped' }, filters: [['eq', 'id', order.json.data.orderId]] } });
    expect(ship.status).toBe(200);
    expect((await outbox(u.email)).filter((m) => m.template === 'order_status').map((m) => m.subject)[0]).toMatch(/has been shipped/);

    // Customer opts out: no further status emails.
    await call(data, '/api/data', { cookie: u.cookie, body: { table: 'profiles', op: 'update', values: { notify_order_updates: false }, filters: [['eq', 'id', u.id]] } });
    await call(data, '/api/data', { cookie: adminLogin.cookie, body: { table: 'orders', op: 'update', values: { status: 'delivered' }, filters: [['eq', 'id', order.json.data.orderId]] } });
    expect((await outbox(u.email)).filter((m) => m.template === 'order_status')).toHaveLength(1);
  });

  it('a failed order rolls back its emails too', async () => {
    const u = await signUp();
    const before = (await outbox(u.email)).length;
    const r = await call(checkout, '/api/checkout', { cookie: u.cookie, body: { idempotency_key: randomUUID(), delivery_method: 'standard', shipping_address: { fullName: 'T', phone: '9876543210', addressLine1: 'x', addressLine2: '', city: 'x', state: 'x', postalCode: '560001', country: 'India' } } });
    expect(r.status).toBe(400); // empty cart
    expect((await outbox(u.email)).length).toBe(before);
  });

  it('admin email endpoints: status without secrets, test email to self only, customers forbidden', async () => {
    const adminLogin = await call(login, '/api/auth/login', { body: { email: ADMIN_EMAIL, password: PASSWORD }, ip: uniqueIp() });
    const s = await call(emailStatus, '/api/admin/email', { cookie: adminLogin.cookie });
    expect(s.status).toBe(200);
    expect(s.json.data.provider).toBe('log');
    expect(s.json.data.adminEmails).toEqual([ADMIN_EMAIL]);
    expect(JSON.stringify(s.json)).not.toMatch(/SMTP_PASS|RESEND_API_KEY|smtp_pass|resendApiKey|"pass"|token_hash|html/);
    expect(Object.keys(s.json.data.recent[0] ?? {})).not.toContain('text_body'); // email bodies contain one-time links
    const t = await call(sendTestEmail, '/api/admin/email', { cookie: adminLogin.cookie, body: { to: 'someone@else.test' } });
    expect(t.json.data.to).toBe(ADMIN_EMAIL);

    const u = await signUp();
    expect((await call(emailStatus, '/api/admin/email', { cookie: u.cookie })).status).toBe(403);
    expect((await call(sendTestEmail, '/api/admin/email', { cookie: u.cookie, body: {} })).status).toBe(403);
  });

  it('outbox delivers pending mail, retries failures with backoff and gives up after the limit', async () => {
    await db.pool.query(`UPDATE email_outbox SET status = 'sent'`);
    await db.pool.query(`INSERT INTO email_outbox (to_email, template, subject, html, text_body) VALUES ('a@x.test','t','ok','<p>a</p>','a'), ('b@x.test','t','bad','<p>b</p>','b')`);
    const sent: string[] = [];
    const flaky = async (m: { to: string }) => {
      if (m.to === 'b@x.test') throw new Error('SMTP 421 try later');
      sent.push(m.to);
    };
    expect(await deliverPending(db.pool, flaky)).toEqual({ sent: 1, failed: 1 });
    expect(sent).toEqual(['a@x.test']);
    let b = (await db.pool.query(`SELECT status, attempts, last_error, next_attempt_at > now() AS later FROM email_outbox WHERE to_email = 'b@x.test'`)).rows[0];
    expect(b).toEqual({ status: 'pending', attempts: 1, last_error: 'SMTP 421 try later', later: true });
    for (let i = 1; i < MAX_ATTEMPTS; i++) {
      await db.pool.query(`UPDATE email_outbox SET next_attempt_at = now() WHERE to_email = 'b@x.test'`);
      await deliverPending(db.pool, flaky);
    }
    b = (await db.pool.query(`SELECT status, attempts FROM email_outbox WHERE to_email = 'b@x.test'`)).rows[0];
    expect(b).toEqual({ status: 'failed', attempts: MAX_ATTEMPTS });
  });
});

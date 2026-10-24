import { describe, expect, it } from 'vitest';
import { adminEmails, loadEmailConfig } from '@/lib/server/email/config';
import { ConfigError } from '@/lib/server/config';
import * as t from '@/lib/server/email/templates';

describe('email config', () => {
  it('defaults to the log provider and localhost links', () => {
    expect(loadEmailConfig({})).toMatchObject({ provider: 'log', appUrl: 'http://localhost:3000' });
  });
  it('requires real SMTP settings and rejects placeholders', () => {
    expect(() => loadEmailConfig({ EMAIL_PROVIDER: 'smtp', EMAIL_FROM: 'Qrobo <a@b.in>' })).toThrow(ConfigError);
    expect(() => loadEmailConfig({ EMAIL_PROVIDER: 'smtp', EMAIL_FROM: 'Qrobo <a@b.in>', SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'u@gmail.com', SMTP_PASS: 'your-app-password' })).toThrow(/SMTP_PASS/);
    const ok = loadEmailConfig({ EMAIL_PROVIDER: 'smtp', EMAIL_FROM: 'Qrobo <a@b.in>', SMTP_HOST: 'smtp.gmail.com', SMTP_PORT: '465', SMTP_USER: 'u@gmail.com', SMTP_PASS: 'abcd efgh ijkl mnop' });
    expect(ok.smtp).toMatchObject({ host: 'smtp.gmail.com', port: 465 });
  });
  it('requires https links in production when actually sending', () => {
    expect(() => loadEmailConfig({ NODE_ENV: 'production', EMAIL_PROVIDER: 'resend', EMAIL_FROM: 'Q <a@b.in>', RESEND_API_KEY: 're_123', APP_URL: 'http://shop.in' })).toThrow(/https/);
  });
  it('rejects unknown providers', () => expect(() => loadEmailConfig({ EMAIL_PROVIDER: 'carrier-pigeon' })).toThrow(ConfigError));
  it('parses ADMIN_EMAILS case-insensitively', () => {
    expect(adminEmails({ ADMIN_EMAILS: ' ChirraUday02@Gmail.com , bad, x@y.in' })).toEqual(['chirrauday02@gmail.com', 'x@y.in']);
  });
});

describe('email templates', () => {
  it('escapes user-controlled values in HTML', () => {
    const e = t.verifyEmail('<script>alert(1)</script>', 'https://shop.test/verify-email?token=abc');
    expect(e.html).not.toContain('<script>');
    expect(e.html).toContain('&lt;script&gt;');
    expect(e.text).toContain('https://shop.test/verify-email?token=abc');
  });
  it('order emails list items and totals', () => {
    const o = { id: '1', order_number: 'QR-1', total: 1413, subtotal: 1299, discount: 0, shipping_cost: 49, tax: 65, status: 'confirmed', payment_method: 'cod', items: [{ product_name: 'Arduino <Uno>', quantity: 1, total: 1299 }] };
    const c = t.orderConfirmation('Uday', o, 'https://shop.test');
    expect(c.subject).toBe('Order confirmed: #QR-1');
    expect(c.html).toContain('Arduino &lt;Uno&gt;');
    expect(c.text).toContain('Cash on Delivery');
    expect(t.orderStatus(null, 'QR-1', 'out_for_delivery', 'https://shop.test').subject).toBe('Order #QR-1 is out for delivery');
  });
});

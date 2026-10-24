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
    expect(t.orderStatus({ name: null, orderNumber: 'QR-1', status: 'out_for_delivery' }, 'https://shop.test').subject).toBe('Order #QR-1 is out for delivery');
  });
  it('order confirmation shows the shipping address, and product images only when they are http(s)', () => {
    const o = {
      id: '1', order_number: 'QR-2', total: 100, subtotal: 100, discount: 0, shipping_cost: 0, tax: 0, status: 'confirmed', payment_method: 'cod',
      shipping_address: { fullName: 'Uday <b>', city: 'Hyderabad', postalCode: '500001' },
      items: [
        { product_name: 'A', quantity: 1, total: 50, image: 'https://images.pexels.com/a.jpg', slug: 'a' },
        { product_name: 'B', quantity: 1, total: 50, image: 'javascript:alert(1)' },
      ],
    };
    const c = t.orderConfirmation('Uday', o, 'https://shop.test');
    expect(c.html).toContain('https://images.pexels.com/a.jpg');
    expect(c.html).not.toContain('javascript:');
    expect(c.html).toContain('Uday &lt;b&gt;');
    expect(c.html).toContain('https://shop.test/product/a');
    expect(c.text).toContain('Hyderabad');
  });
  it('shipped emails include tracking details; unsafe tracking URLs are dropped', () => {
    const s = t.orderStatus({ name: 'U', orderNumber: 'QR-3', status: 'shipped', courier: 'Delhivery', trackingNumber: 'DL123', trackingUrl: 'https://track.test/DL123', paymentMethod: 'cod', total: 999 }, 'https://shop.test');
    expect(s.subject).toBe('Order #QR-3 has been shipped');
    expect(s.html).toContain('Delhivery');
    expect(s.html).toContain('DL123');
    expect(s.html).toContain('https://track.test/DL123');
    expect(s.html).toContain('Rs 999');
    expect(s.text).toContain('Tracking number: DL123');
    const bad = t.orderStatus({ name: 'U', orderNumber: 'QR-3', status: 'shipped', trackingNumber: 'X1', trackingUrl: 'javascript:alert(1)' }, 'https://shop.test');
    expect(bad.html).not.toContain('javascript:');
    expect(bad.html).toContain('X1');
  });
  it('delivered emails ask for reviews of the purchased products', () => {
    const d = t.orderStatus({ name: 'U', orderNumber: 'QR-4', status: 'delivered', items: [{ product_name: 'ESP32', quantity: 1, total: 1, slug: 'esp32' }] }, 'https://shop.test');
    expect(d.html).toContain('Review ESP32');
    expect(d.html).toContain('https://shop.test/product/esp32');
  });
  it('welcome, low-stock and newsletter emails', () => {
    const w = t.welcome('Uday Chirra', 'https://shop.test', { code: 'WELCOME10', description: '10% off' });
    expect(w.subject).toBe('Welcome to Qrobo, Uday!');
    expect(w.html).toContain('WELCOME10');
    const l = t.adminLowStock([{ name: 'Servo', sku: 'S1', stock: 0, threshold: 5 }, { name: 'LED', sku: 'L1', stock: 3, threshold: 5 }], 'https://shop.test');
    expect(l.subject).toBe('Out of stock: Servo (+1 more)');
    expect(l.html).toContain('3 left');
    const n = t.newsletterWelcome('https://shop.test', 'https://shop.test/newsletter/unsubscribe?token=abc');
    expect(n.html).toContain('Unsubscribe');
    expect(n.text).toContain('newsletter/unsubscribe?token=abc');
  });
});

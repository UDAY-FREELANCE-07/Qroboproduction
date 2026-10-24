import { createHmac } from 'crypto';
import { describe, expect, it } from 'vitest';
import { verifyPaymentSignature, verifyWebhookSignature } from '@/lib/server/payments/razorpay';
import { getOnlinePaymentStatus } from '@/lib/server/payments/provider';
import { RateLimiter } from '@/lib/server/auth/rate-limit';
import { passwordProblem, hashPassword, verifyPassword } from '@/lib/server/auth/password';
import { ApiError, assertSameOriginJson, clientIp } from '@/lib/server/http';

describe('Razorpay signature verification', () => {
  const secret = 'test_webhook_secret';
  const body = JSON.stringify({ event: 'payment.captured' });
  const sig = createHmac('sha256', secret).update(body).digest('hex');

  it('accepts a valid webhook signature', () => expect(verifyWebhookSignature(body, sig, secret)).toBe(true));
  it('rejects tampered bodies, wrong secrets, missing or malformed signatures', () => {
    expect(verifyWebhookSignature(body + ' ', sig, secret)).toBe(false);
    expect(verifyWebhookSignature(body, sig, 'other')).toBe(false);
    expect(verifyWebhookSignature(body, null, secret)).toBe(false);
    expect(verifyWebhookSignature(body, 'zz', secret)).toBe(false);
    expect(verifyWebhookSignature(body, sig, '')).toBe(false);
  });
  it('verifies checkout payment signatures', () => {
    const s = createHmac('sha256', 'key_secret').update('order_1|pay_1').digest('hex');
    expect(verifyPaymentSignature({ razorpayOrderId: 'order_1', razorpayPaymentId: 'pay_1', signature: s }, 'key_secret')).toBe(true);
    expect(verifyPaymentSignature({ razorpayOrderId: 'order_1', razorpayPaymentId: 'pay_2', signature: s }, 'key_secret')).toBe(false);
  });
  it('online payment is reported unavailable, never faked', () => {
    expect(getOnlinePaymentStatus({})).toEqual({ provider: 'razorpay', available: false, reason: 'not_configured' });
    expect(getOnlinePaymentStatus({ RAZORPAY_KEY_ID: 'a', RAZORPAY_KEY_SECRET: 'b', RAZORPAY_WEBHOOK_SECRET: 'c' }).available).toBe(false);
  });
});

describe('RateLimiter', () => {
  it('blocks after the limit and resets after the window', () => {
    let t = 0;
    const rl = new RateLimiter(2, 1000, () => t);
    expect(rl.hit('k')).toBe(0);
    expect(rl.hit('k')).toBe(0);
    expect(rl.hit('k')).toBeGreaterThan(0);
    expect(rl.hit('other')).toBe(0);
    t = 1001;
    expect(rl.hit('k')).toBe(0);
  });
});

describe('passwords', () => {
  it('enforces length limits (bcrypt 72-byte limit is not silently truncated)', () => {
    expect(passwordProblem('short')).toMatch(/at least 8/);
    expect(passwordProblem('a'.repeat(73))).toMatch(/at most 72/);
    expect(passwordProblem('correct horse')).toBeNull();
  });
  it('hashes with bcrypt and verifies', async () => {
    const h = await hashPassword('correct horse battery', 4);
    expect(h).toMatch(/^\$2[aby]\$04\$/);
    expect(h).not.toContain('correct horse');
    expect(await verifyPassword('correct horse battery', h)).toBe(true);
    expect(await verifyPassword('wrong', h)).toBe(false);
  });
});

describe('CSRF / origin checks', () => {
  const req = (headers: Record<string, string>) => new Request('http://localhost:3000/api/x', { method: 'POST', headers, body: '{}' });
  it('accepts same-origin JSON', () => {
    expect(() => assertSameOriginJson(req({ host: 'localhost:3000', origin: 'http://localhost:3000', 'content-type': 'application/json' }))).not.toThrow();
  });
  it('rejects cross-origin, missing origin and non-JSON (form) posts', () => {
    const cases: Record<string, string>[] = [
      { host: 'localhost:3000', origin: 'https://evil.example', 'content-type': 'application/json' },
      { host: 'localhost:3000', 'content-type': 'application/json' },
      { host: 'localhost:3000', origin: 'http://localhost:3000', 'content-type': 'application/x-www-form-urlencoded' },
    ];
    const codes = cases.map((h) => {
      try {
        assertSameOriginJson(req(h));
        return 'ok';
      } catch (e) {
        return (e as ApiError).status;
      }
    });
    expect(codes).toEqual([403, 403, 415]);
  });
  it('uses X-Real-IP, else the proxy-appended (right-most) X-Forwarded-For entry', () => {
    expect(clientIp(new Request('http://x', { headers: { 'x-real-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' } }))).toBe('1.2.3.4');
    expect(clientIp(new Request('http://x', { headers: { 'x-forwarded-for': 'spoofed, 5.6.7.8' } }))).toBe('5.6.7.8');
  });
});

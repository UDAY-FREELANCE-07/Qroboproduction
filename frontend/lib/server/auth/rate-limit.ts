/**
 * Fixed-window, in-process rate limiter.
 *
 * Adequate for the documented single-EC2-instance deployment. If the app is scaled to several
 * instances, replace the store with a shared one (e.g. a PostgreSQL table or Redis); the
 * interface stays the same.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private buckets = new Map<string, Bucket>();
  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Records one attempt. Returns retry-after seconds when the limit is exceeded, otherwise 0. */
  hit(key: string): number {
    const t = this.now();
    if (this.buckets.size > 10_000) this.sweep(t);
    let b = this.buckets.get(key);
    if (!b || b.resetAt <= t) {
      b = { count: 0, resetAt: t + this.windowMs };
      this.buckets.set(key, b);
    }
    b.count += 1;
    return b.count > this.limit ? Math.ceil((b.resetAt - t) / 1000) : 0;
  }

  reset(key: string) {
    this.buckets.delete(key);
  }

  private sweep(t: number) {
    this.buckets.forEach((b, k) => {
      if (b.resetAt <= t) this.buckets.delete(k);
    });
  }
}

const FIFTEEN_MIN = 15 * 60 * 1000;
const globalForRl = globalThis as unknown as { __qroboRateLimits?: Record<string, RateLimiter> };
export const limits = (globalForRl.__qroboRateLimits ??= {
  loginPerIp: new RateLimiter(20, FIFTEEN_MIN),
  loginPerAccount: new RateLimiter(5, FIFTEEN_MIN),
  registerPerIp: new RateLimiter(5, 60 * 60 * 1000),
  passwordChangePerUser: new RateLimiter(5, FIFTEEN_MIN),
  checkoutPerUser: new RateLimiter(10, 60 * 1000),
  forgotPerIp: new RateLimiter(10, 60 * 60 * 1000),
  forgotPerEmail: new RateLimiter(3, 60 * 60 * 1000),
  emailTokenPerIp: new RateLimiter(30, FIFTEEN_MIN),
  resendVerifyPerUser: new RateLimiter(3, 60 * 60 * 1000),
  testEmailPerUser: new RateLimiter(5, 60 * 60 * 1000),
});

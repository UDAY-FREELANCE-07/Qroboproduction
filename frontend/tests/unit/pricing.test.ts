import { describe, expect, it } from 'vitest';
import { computeTotals, CouponError, type CouponRow } from '@/lib/server/pricing';

const now = new Date('2026-10-23T12:00:00Z');
const coupon = (over: Partial<CouponRow>): CouponRow => ({
  code: 'X', discount_type: 'percentage', discount_value: 10, min_order_value: 0, max_discount: null,
  usage_limit: null, used_count: 0, expires_at: null, is_active: true, ...over,
});

describe('computeTotals (matches the checkout page formulas)', () => {
  it('standard shipping below the free threshold', () => {
    // 2 x Rs 349 = 698 -> shipping 49, tax round(34.9)=35
    expect(computeTotals([{ unitPrice: 349, quantity: 2 }], 'standard')).toEqual({ subtotal: 698, discount: 0, shipping: 49, tax: 35, total: 782 });
  });
  it('free standard shipping above Rs 999, express always 99', () => {
    expect(computeTotals([{ unitPrice: 1299, quantity: 1 }], 'standard').shipping).toBe(0);
    expect(computeTotals([{ unitPrice: 1299, quantity: 1 }], 'express').shipping).toBe(99);
    expect(computeTotals([{ unitPrice: 999, quantity: 1 }], 'standard').shipping).toBe(49);
  });
  it('handles paise without floating-point drift', () => {
    const t = computeTotals([{ unitPrice: 0.1, quantity: 3 }, { unitPrice: 0.2, quantity: 1 }], 'standard');
    expect(t.subtotal).toBe(0.5);
  });
  it('percentage coupon with cap', () => {
    const t = computeTotals([{ unitPrice: 6000, quantity: 1 }], 'standard', coupon({ discount_value: 20, max_discount: 1000 }), now);
    expect(t.discount).toBe(1000);
    expect(t.total).toBe(6000 - 1000 + 0 + 300);
  });
  it('fixed coupon never exceeds subtotal', () => {
    expect(computeTotals([{ unitPrice: 30, quantity: 1 }], 'standard', coupon({ discount_type: 'fixed', discount_value: 50 }), now).discount).toBe(30);
  });
  it('rejects expired, inactive, exhausted and below-minimum coupons', () => {
    const lines = [{ unitPrice: 600, quantity: 1 }];
    expect(() => computeTotals(lines, 'standard', coupon({ expires_at: '2026-01-01T00:00:00Z' }), now)).toThrow(CouponError);
    expect(() => computeTotals(lines, 'standard', coupon({ is_active: false }), now)).toThrow(CouponError);
    expect(() => computeTotals(lines, 'standard', coupon({ usage_limit: 5, used_count: 5 }), now)).toThrow(/usage limit/);
    expect(() => computeTotals(lines, 'standard', coupon({ min_order_value: 1000 }), now)).toThrow(/Minimum order value/);
  });
});

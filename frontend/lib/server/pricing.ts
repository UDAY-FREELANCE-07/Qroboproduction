/**
 * Authoritative order pricing. Mirrors the formulas the existing UI displays
 * (app/checkout/page.tsx and app/cart/page.tsx) so server totals match what customers see:
 *   shipping = express ? 99 : (subtotal > 999 ? 0 : 49)
 *   tax      = round(subtotal * 5%)            (whole rupees)
 *   total    = subtotal - discount + shipping + tax
 * All arithmetic is done in integer paise to avoid floating-point drift.
 */
export type DeliveryMethod = 'standard' | 'express';

export interface PricedLine {
  unitPrice: number; // rupees, as stored (numeric(10,2))
  quantity: number;
}

export interface CouponRow {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number | null;
  expires_at: Date | string | null;
  is_active: boolean | null;
}

export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

const toPaise = (rupees: number) => Math.round(rupees * 100);
const toRupees = (paise: number) => paise / 100;

export class CouponError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CouponError';
  }
}

/** Returns the discount in paise, or throws CouponError with a customer-safe message. */
export function couponDiscountPaise(coupon: CouponRow, subtotalPaise: number, now = new Date()): number {
  if (!coupon.is_active) throw new CouponError('Invalid coupon code');
  if (coupon.expires_at && new Date(coupon.expires_at) < now) throw new CouponError('This coupon has expired');
  if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && (coupon.used_count ?? 0) >= coupon.usage_limit) {
    throw new CouponError('This coupon has reached its usage limit');
  }
  if (coupon.min_order_value && subtotalPaise < toPaise(coupon.min_order_value)) {
    throw new CouponError(`Minimum order value is Rs ${coupon.min_order_value}`);
  }
  let discount: number;
  if (coupon.discount_type === 'percentage') {
    // UI rounds to whole rupees.
    discount = Math.round((subtotalPaise / 100) * coupon.discount_value / 100) * 100;
    if (coupon.max_discount) discount = Math.min(discount, toPaise(coupon.max_discount));
  } else {
    discount = toPaise(coupon.discount_value);
  }
  return Math.max(0, Math.min(discount, subtotalPaise));
}

export function computeTotals(lines: PricedLine[], delivery: DeliveryMethod, coupon?: CouponRow | null, now = new Date()): Totals {
  const subtotalP = lines.reduce((sum, l) => sum + toPaise(l.unitPrice) * l.quantity, 0);
  const discountP = coupon ? couponDiscountPaise(coupon, subtotalP, now) : 0;
  const shippingP = delivery === 'express' ? 9900 : subtotalP > 99900 ? 0 : 4900;
  const taxP = Math.round((subtotalP / 100) * 0.05) * 100;
  const totalP = subtotalP - discountP + shippingP + taxP;
  return {
    subtotal: toRupees(subtotalP),
    discount: toRupees(discountP),
    shipping: toRupees(shippingP),
    tax: toRupees(taxP),
    total: toRupees(totalP),
  };
}

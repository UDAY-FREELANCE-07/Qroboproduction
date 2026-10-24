'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/format';
import { useState } from 'react';
import { dataClient } from '@/lib/data-client';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const shippingCost = subtotal > 999 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal - discount + shippingCost + tax;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const { data: coupon } = await dataClient
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (!coupon) {
      toast.error('Invalid coupon code');
      return;
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      toast.error('This coupon has expired');
      return;
    }
    if (coupon.min_order_value && subtotal < coupon.min_order_value) {
      toast.error(`Minimum order value is ${formatPrice(coupon.min_order_value)}`);
      return;
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discount_value) / 100);
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }
    setDiscount(discountAmount);
    setCouponApplied(true);
    toast.success(`Coupon applied! You saved ${formatPrice(discountAmount)}`);
  };

  if (items.length === 0) {
    return (
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-navy mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some products to get started</p>
        <Link href="/shop"><Button size="lg">Start Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-6">
      <h1 className="text-2xl font-bold text-navy mb-6">Shopping Cart ({totalItems})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <Link href={`/product/${item.product.slug}`}>
                <img
                  src={item.product.primary_image || ''}
                  alt={item.product.name}
                  className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                />
              </Link>
              <div className="flex-1">
                <Link href={`/product/${item.product.slug}`}>
                  <h3 className="text-sm font-medium text-navy hover:text-primary line-clamp-2">{item.product.name}</h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-1">SKU: {item.product.sku}</p>
                <p className="text-sm font-bold text-navy mt-1">{formatPrice(item.product.price)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-100 rounded-l-lg"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-100 rounded-r-lg"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-navy">{formatPrice(item.product.price * item.quantity)}</p>
              </div>
            </div>
          ))}
          <div className="flex justify-between">
            <Button variant="ghost" onClick={clearCart}>Clear cart</Button>
            <Link href="/shop"><Button variant="outline">Continue shopping</Button></Link>
          </div>
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-bold text-navy mb-4">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-4">
              {couponApplied ? (
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">{couponCode.toUpperCase()}</span>
                  </div>
                  <button
                    onClick={() => { setDiscount(0); setCouponApplied(false); setCouponCode(''); }}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="h-9"
                  />
                  <Button size="sm" onClick={applyCoupon}>Apply</Button>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-navy">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-navy">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span className="font-medium text-navy">{formatPrice(tax)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-navy">Total</span>
                  <span className="text-base font-bold text-navy">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <Link href="/checkout" className="block mt-4">
              <Button className="w-full" size="lg">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-medium text-navy mb-1">Have a coupon?</p>
            <p>Try WELCOME10 for 10% off, or YANTRA50 for Rs 50 off orders above Rs 500.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

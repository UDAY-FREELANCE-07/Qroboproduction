'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { dataClient } from '@/lib/data-client';
import { CLIENT_DATA_SOURCE } from '@/lib/data-source';
import { newIdempotencyKey, placeOrderViaApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronRight, CreditCard, Truck, MapPin, Package } from 'lucide-react';
import { formatPrice, generateOrderNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

const steps = ['Address', 'Delivery', 'Summary', 'Payment'];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', postalCode: '', country: 'India',
  });
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  // One key per checkout visit: retries/double-clicks cannot create duplicate orders.
  const [idempotencyKey] = useState(newIdempotencyKey);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;
  if (items.length === 0) {
    return (
      <div className="w-full px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy mb-4">Your cart is empty</h1>
        <Link href="/shop"><Button>Start Shopping</Button></Link>
      </div>
    );
  }

  const shippingCost = deliveryMethod === 'express' ? 99 : subtotal > 999 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingCost + tax;

  const placeOrder = async () => {
    setIsLoading(true);
    if (CLIENT_DATA_SOURCE === 'postgres') {
      // Server prices the order from the database cart; COD orders stay payment "pending".
      const { data, error } = await placeOrderViaApi({ idempotencyKey, deliveryMethod, address });
      if (error || !data) {
        toast.error(error?.message || 'Failed to create order');
        setIsLoading(false);
        return;
      }
      await clearCart();
      toast.success('Order placed successfully!');
      router.push(`/order-success?id=${data.orderId}`);
      setIsLoading(false);
      return;
    }
    try {
      const orderNumber = generateOrderNumber();
      const { data: order, error: orderError } = await dataClient
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          status: 'confirmed',
          payment_status: 'paid',
          payment_method: 'cod',
          subtotal,
          shipping_cost: shippingCost,
          tax,
          total,
          shipping_address: address,
        })
        .select('id')
        .single();

      if (orderError || !order) {
        toast.error('Failed to create order');
        setIsLoading(false);
        return;
      }

      for (const item of items) {
        await dataClient.from('order_items').insert({
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.primary_image,
          product_slug: item.product.slug,
          sku: item.product.sku,
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity,
        });
        await dataClient
          .from('products')
          .update({ stock: item.product.stock - item.quantity })
          .eq('id', item.product.id);
      }

      await dataClient.from('addresses').insert({
        user_id: user.id,
        full_name: address.fullName,
        phone: address.phone,
        address_line1: address.addressLine1,
        address_line2: address.addressLine2,
        city: address.city,
        state: address.state,
        postal_code: address.postalCode,
        country: address.country,
        is_default: true,
      });

      await clearCart();
      toast.success('Order placed successfully!');
      router.push(`/order-success?id=${order.id}`);
    } catch {
      toast.error('Something went wrong');
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-6">
      <h1 className="text-2xl font-bold text-navy mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2 shrink-0">
            <div className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              i === currentStep ? 'bg-primary text-white' :
              i < currentStep ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-muted-foreground'
            )}>
              {i < currentStep ? <Check className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">{i + 1}</span>}
              {step}
            </div>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {currentStep === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-navy">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} required className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input id="addressLine1" value={address.addressLine1} onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })} required className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                  <Input id="addressLine2" value={address.addressLine2} onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className="mt-1" />
                </div>
              </div>
              <Button
                className="mt-6"
                onClick={() => setCurrentStep(1)}
                disabled={!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.postalCode}
              >
                Continue to Delivery
              </Button>
            </div>
          )}

          {/* Step 2: Delivery */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-navy">Delivery Method</h2>
              </div>
              <div className="space-y-3">
                <label className={cn('flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors', deliveryMethod === 'standard' ? 'border-primary bg-blue-50' : 'border-gray-200')}>
                  <input type="radio" name="delivery" value="standard" checked={deliveryMethod === 'standard'} onChange={(e) => setDeliveryMethod(e.target.value)} className="accent-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy">Standard Delivery (5-7 days)</p>
                    <p className="text-xs text-muted-foreground">Free for orders above Rs 999</p>
                  </div>
                  <span className="text-sm font-bold text-navy">{subtotal > 999 ? 'Free' : formatPrice(49)}</span>
                </label>
                <label className={cn('flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors', deliveryMethod === 'express' ? 'border-primary bg-blue-50' : 'border-gray-200')}>
                  <input type="radio" name="delivery" value="express" checked={deliveryMethod === 'express'} onChange={(e) => setDeliveryMethod(e.target.value)} className="accent-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy">Express Delivery (2-3 days)</p>
                    <p className="text-xs text-muted-foreground">Fast delivery to your doorstep</p>
                  </div>
                  <span className="text-sm font-bold text-navy">{formatPrice(99)}</span>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>Back</Button>
                <Button onClick={() => setCurrentStep(2)}>Continue to Summary</Button>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-navy">Order Summary</h2>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                    {item.product.primary_image && (
                      <img src={item.product.primary_image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-navy">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-navy">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                <Button onClick={() => setCurrentStep(3)}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-navy">Payment Method</h2>
              </div>
              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <input type="radio" checked readOnly className="accent-primary" />
                    <span className="text-sm font-medium text-navy">Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-7">Pay when your order is delivered. Razorpay integration ready for online payments.</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                <Button onClick={placeOrder} disabled={isLoading} size="lg">
                  {isLoading ? 'Placing order...' : `Place Order - ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <h3 className="text-base font-bold text-navy mb-4">Order Total</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-navy">{formatPrice(subtotal)}</span>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

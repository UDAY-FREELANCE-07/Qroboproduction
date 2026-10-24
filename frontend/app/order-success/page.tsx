'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { CheckCircle2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDate } from '@/lib/format';
import Link from 'next/link';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<(Order & { order_items: OrderItem[] }) | null>(null);

  useEffect(() => {
    if (orderId) {
      dataClient
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .maybeSingle()
        .then(({ data }) => setOrder(data as any));
    }
  }, [orderId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-navy mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-8">Thank you for your purchase. Your order has been placed successfully.</p>

      {order && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-left mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-lg font-bold text-navy">#{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="text-sm font-medium text-navy">{formatDate(order.created_at)}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                {item.product_image && (
                  <img src={item.product_image} alt={item.product_name} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <span className="flex-1 text-muted-foreground">{item.product_name}</span>
                <span className="text-muted-foreground">x{item.quantity}</span>
                <span className="font-medium text-navy">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 flex justify-between">
            <span className="font-bold text-navy">Total</span>
            <span className="font-bold text-navy">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Link href="/shop"><Button variant="outline">Continue Shopping</Button></Link>
        <Link href="/account?tab=orders"><Button>View Orders</Button></Link>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Order = Database['public']['Tables']['orders']['Row'];

const orderStatuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { order_items: any[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      const { data } = await dataClient
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });
      setOrders((data as any) || []);
      setIsLoading(false);
    };
    load();
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await dataClient.from('orders').update({ status }).eq('id', id);
    if (error) { toast.error('Failed to update status'); }
    else {
      toast.success('Order status updated');
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Orders</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={cn('px-3 py-1.5 rounded-lg text-sm font-medium shrink-0', filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-navy')}
        >
          All ({orders.length})
        </button>
        {orderStatuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn('px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 capitalize', filter === status ? 'bg-primary text-white' : 'bg-gray-100 text-navy')}
          >
            {status.replace(/_/g, ' ')} ({orders.filter((o) => o.status === status).length})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="animate-pulse text-muted-foreground">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">No orders found</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-sm font-medium text-navy">{order.order_number}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{order.order_items?.length || 0} items</TableCell>
                  <TableCell className="text-sm font-bold text-navy">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <span className={cn('text-xs px-2 py-1 rounded-full', order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                      {order.payment_status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-xs border rounded-md px-2 py-1 bg-white"
                    >
                      {orderStatuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

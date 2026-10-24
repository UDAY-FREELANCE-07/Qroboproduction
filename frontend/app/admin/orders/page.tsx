'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Truck } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Order = Database['public']['Tables']['orders']['Row'];

const COURIERS = ['Delhivery', 'Blue Dart', 'DTDC', 'Ecom Express', 'Xpressbees', 'Shadowfax', 'India Post', 'Shiprocket'];

const orderStatuses = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { order_items: any[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  // Shipping dialog: opened when an order is moved to "shipped" (or "Edit tracking" is clicked).
  const [shipFor, setShipFor] = useState<Order | null>(null);
  const [ship, setShip] = useState({ courier: '', tracking_number: '', tracking_url: '' });
  const [saving, setSaving] = useState(false);

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

  const applyUpdate = async (id: string, values: Partial<Order>) => {
    const { error } = await dataClient.from('orders').update(values).eq('id', id);
    if (error) {
      toast.error(error.message || 'Failed to update order');
      return false;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...values } : o)));
    return true;
  };

  const updateStatus = async (order: Order, status: string) => {
    if (status === 'shipped') {
      setShip({ courier: order.courier ?? '', tracking_number: order.tracking_number ?? '', tracking_url: order.tracking_url ?? '' });
      setShipFor(order);
      return;
    }
    if (await applyUpdate(order.id, { status })) toast.success('Order status updated. The customer has been emailed.');
  };

  const saveShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipFor) return;
    const url = ship.tracking_url.trim();
    if (url && !/^https:\/\//i.test(url)) {
      toast.error('Tracking link must start with https://');
      return;
    }
    setSaving(true);
    const values = {
      status: 'shipped',
      courier: ship.courier.trim() || null,
      tracking_number: ship.tracking_number.trim() || null,
      tracking_url: url || null,
    };
    const notify = shipFor.status !== 'shipped';
    const ok = await applyUpdate(shipFor.id, notify ? values : { courier: values.courier, tracking_number: values.tracking_number, tracking_url: values.tracking_url });
    setSaving(false);
    if (ok) {
      toast.success(notify ? 'Marked as shipped. The customer has been emailed the tracking details.' : 'Tracking details saved.');
      setShipFor(null);
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
                  <TableCell className="text-sm font-medium text-navy">
                    {order.order_number}
                    {(order.tracking_number || order.courier) && (
                      <div className="mt-1 flex items-center gap-1 text-xs font-normal text-muted-foreground">
                        <Truck className="h-3 w-3" aria-hidden="true" />
                        {[order.courier, order.tracking_number].filter(Boolean).join(' ? ')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{order.order_items?.length || 0} items</TableCell>
                  <TableCell className="text-sm font-bold text-navy">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <span className={cn('text-xs px-2 py-1 rounded-full', order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                      {order.payment_status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <select
                        aria-label={`Status of order ${order.order_number}`}
                        value={order.status}
                        onChange={(e) => updateStatus(order, e.target.value)}
                        className="text-xs border rounded-md px-2 py-1 bg-white"
                      >
                        {orderStatuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                      {['shipped', 'out_for_delivery'].includes(order.status) && (
                        <button
                          type="button"
                          onClick={() => { setShip({ courier: order.courier ?? '', tracking_number: order.tracking_number ?? '', tracking_url: order.tracking_url ?? '' }); setShipFor(order); }}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Tracking
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!shipFor} onOpenChange={(open) => { if (!open) setShipFor(null); }}>
        <DialogContent>
          <form onSubmit={saveShipment}>
            <DialogHeader>
              <DialogTitle>Ship order {shipFor?.order_number}</DialogTitle>
              <DialogDescription>
                {shipFor?.status === 'shipped'
                  ? 'Update the shipment details shown in the customer\'s account.'
                  : 'The customer gets a "your order is on the way" email with these details. All fields are optional.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="ship-courier">Courier</Label>
                <Input id="ship-courier" list="ship-couriers" maxLength={60} value={ship.courier} onChange={(e) => setShip({ ...ship, courier: e.target.value })} placeholder="e.g. Delhivery" />
                <datalist id="ship-couriers">{COURIERS.map((c) => <option key={c} value={c} />)}</datalist>
              </div>
              <div>
                <Label htmlFor="ship-number">Tracking number</Label>
                <Input id="ship-number" maxLength={80} value={ship.tracking_number} onChange={(e) => setShip({ ...ship, tracking_number: e.target.value })} placeholder="AWB / consignment number" />
              </div>
              <div>
                <Label htmlFor="ship-url">Tracking link</Label>
                <Input id="ship-url" type="url" maxLength={500} value={ship.tracking_url} onChange={(e) => setShip({ ...ship, tracking_url: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShipFor(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{shipFor?.status === 'shipped' ? 'Save tracking' : 'Mark as shipped & email customer'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

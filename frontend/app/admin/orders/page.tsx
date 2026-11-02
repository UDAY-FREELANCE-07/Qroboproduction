'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { adminService } from '@/lib/admin/admin-service';
import { AdminOrder, OrderStatus } from '@/lib/admin/admin-types';
import { formatPrice, formatDate } from '@/lib/format';

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const initialStatusParam = searchParams.get('status') || 'ALL';

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusParam);
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    const data = await adminService.getOrders();
    setOrders(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleQuickStatusUpdate = async (id: string, status: OrderStatus) => {
    await adminService.updateOrderStatus(id, status);
    fetchOrders();
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || o.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track customer transactions, dispatch workflows, tracking barcodes, and fulfillment status.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          className="h-9 gap-1.5 text-xs text-slate-600 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Orders</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by order #, customer, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Order Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="packed">Packed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Payment Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending (e.g. COD)</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders found"
            description="No customer transactions match your filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Fulfillment</th>
                  <th className="py-3 px-3">Quick Advance</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{o.customerName}</p>
                      <p className="text-[11px] text-slate-400">{o.customerEmail}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(o.createdAt)}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {o.items.length} item{o.items.length === 1 ? '' : 's'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {formatPrice(o.grandTotal)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={o.paymentStatus} size="sm" />
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={o.orderStatus} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      {o.orderStatus === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickStatusUpdate(o.id, 'processing')}
                          className="h-7 text-[11px]"
                        >
                          Confirm & Process
                        </Button>
                      )}
                      {o.orderStatus === 'processing' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickStatusUpdate(o.id, 'packed')}
                          className="h-7 text-[11px]"
                        >
                          Mark Packed
                        </Button>
                      )}
                      {o.orderStatus === 'packed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickStatusUpdate(o.id, 'shipped')}
                          className="h-7 text-[11px]"
                        >
                          Mark Shipped
                        </Button>
                      )}
                      {o.orderStatus === 'shipped' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickStatusUpdate(o.id, 'delivered')}
                          className="h-7 text-[11px] text-emerald-700"
                        >
                          Confirm Delivery
                        </Button>
                      )}
                      {['delivered', 'cancelled', 'returned'].includes(o.orderStatus) && (
                        <span className="text-[11px] text-slate-400 italic">Complete</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

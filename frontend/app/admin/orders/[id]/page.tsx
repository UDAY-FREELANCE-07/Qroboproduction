'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  User,
  CreditCard,
  MapPin,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { adminService } from '@/lib/admin/admin-service';
import { AdminOrder, OrderStatus } from '@/lib/admin/admin-types';
import { formatPrice, formatDateTime } from '@/lib/format';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tracking inputs
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('BlueDart Express');
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);

  const fetchOrder = async () => {
    setIsLoading(true);
    const data = await adminService.getOrderById(id);
    if (data) {
      setOrder(data);
      setTrackingNumber(data.trackingNumber || '');
      setCarrier(data.carrier || 'BlueDart Express');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (status: OrderStatus) => {
    await adminService.updateOrderStatus(id, status);
    fetchOrder();
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setIsUpdatingTracking(true);
    await adminService.updateOrderTracking(id, trackingNumber, carrier);
    setIsUpdatingTracking(false);
    fetchOrder();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-slate-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon={Package}
        title="Order Not Found"
        description={`We could not locate transaction records for ID "${id}".`}
        actionLabel="Back to Orders"
        onAction={() => router.push('/admin/orders')}
      />
    );
  }

  const timelineSteps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'processing', label: 'Processing' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const currentStepIdx = timelineSteps.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/orders')}
            className="h-9 w-9 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-mono">
                {order.orderNumber}
              </h1>
              <StatusBadge status={order.orderStatus} size="sm" />
              <StatusBadge status={order.paymentStatus} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {formatDateTime(order.createdAt)} &bull; Gateway ID:{' '}
              <span className="font-mono text-slate-700">{order.paymentMethod}</span>
            </p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          {order.orderStatus === 'pending' && (
            <Button
              size="sm"
              onClick={() => handleUpdateStatus('processing')}
              className="h-9 text-xs"
            >
              Verify & Process Order
            </Button>
          )}
          {order.orderStatus === 'processing' && (
            <Button
              size="sm"
              onClick={() => handleUpdateStatus('packed')}
              className="h-9 text-xs"
            >
              Mark Order Packed
            </Button>
          )}
          {order.orderStatus === 'packed' && (
            <Button
              size="sm"
              onClick={() => handleUpdateStatus('shipped')}
              className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Dispatch & Ship
            </Button>
          )}
          {order.orderStatus === 'shipped' && (
            <Button
              size="sm"
              onClick={() => handleUpdateStatus('delivered')}
              className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm Delivered
            </Button>
          )}
          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateStatus('cancelled')}
              className="h-9 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Visual Fulfillment Progress Timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
          Order Lifecycle Timeline
        </h3>

        <div className="relative">
          <div className="grid grid-cols-5 gap-2 relative">
            {timelineSteps.map((step, idx) => {
              const isPast = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                      isPast
                        ? 'bg-primary border-primary text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-300'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                  >
                    {isPast ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold ${
                      isPast ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Line behind circles */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 z-0 mx-10" />
        </div>
      </div>

      {/* Main 2-Column Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Products List & Price Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Itemized Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Purchased Hardware Items ({order.items.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Unit Price</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt=""
                            className="h-10 w-10 rounded-md object-cover border border-slate-200 shrink-0 bg-white"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <span className="text-[10px] text-slate-400">Genuine Hardware</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-500">{item.sku}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {formatPrice(item.price)}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">
                        &times; {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatPrice(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount ({order.couponCode || 'PROMO'})</span>
                  <span className="font-semibold">-{formatPrice(order.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Estimated GST (18%)</span>
                <span>{formatPrice(order.taxTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Standard Dispatch Shipping</span>
                <span>{order.shippingTotal === 0 ? 'FREE' : formatPrice(order.shippingTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Paid / Payable</span>
                <span className="text-base text-primary font-bold">
                  {formatPrice(order.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Tracking & Carrier Info */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <span>Courier & Tracking Barcode</span>
            </h3>

            <form onSubmit={handleSaveTracking} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="carrier">Carrier</Label>
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger id="carrier">
                    <SelectValue placeholder="Carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BlueDart Express">BlueDart Express</SelectItem>
                    <SelectItem value="DTDC Express">DTDC Express</SelectItem>
                    <SelectItem value="Delhivery">Delhivery</SelectItem>
                    <SelectItem value="India Post SpeedPost">India Post SpeedPost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="tracking">Tracking / AWB Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BLUEDART-882194"
                    className="font-mono text-xs"
                    required
                  />
                  <Button type="submit" size="sm" disabled={isUpdatingTracking}>
                    Update
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Customer Info & Address Cards (1 col) */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              <span>Customer Account</span>
            </h3>
            <div>
              <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
              <p className="text-xs text-slate-600">{order.customerEmail}</p>
              <p className="text-xs text-slate-600">{order.customerPhone}</p>
            </div>
            <Link
              href={`/admin/customers/${order.customerId}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>View full customer record</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* Shipping Address */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Delivery Address</span>
            </h3>
            <div className="text-xs text-slate-700 space-y-1 leading-relaxed">
              <p className="font-semibold text-slate-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-slate-500 font-mono">Contact: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Billing Address */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Tax Invoice Billing Address</span>
            </h3>
            <div className="text-xs text-slate-700 space-y-1 leading-relaxed">
              <p className="font-semibold text-slate-900">{order.billingAddress.fullName}</p>
              <p>{order.billingAddress.street}</p>
              <p>
                {order.billingAddress.city}, {order.billingAddress.state} -{' '}
                {order.billingAddress.postalCode}
              </p>
              <p>{order.billingAddress.country}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Payment Details</span>
            </h3>
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span className="font-semibold text-slate-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status</span>
                <StatusBadge status={order.paymentStatus} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gross Total</span>
                <span className="font-bold text-slate-900">{formatPrice(order.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

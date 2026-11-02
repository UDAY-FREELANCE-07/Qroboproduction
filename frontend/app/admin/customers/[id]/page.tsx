'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingCart,
  DollarSign,
  Calendar,
  Eye,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { adminService } from '@/lib/admin/admin-service';
import { formatPrice, formatDate } from '@/lib/format';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomer = async () => {
    setIsLoading(true);
    const data = await adminService.getCustomerById(id);
    setCustomer(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (id) fetchCustomer();
  }, [id]);

  const toggleStatus = async () => {
    if (!customer) return;
    const next = customer.status === 'active' ? 'suspended' : 'active';
    await adminService.updateCustomerStatus(customer.id, next);
    fetchCustomer();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-slate-500">Loading customer account...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <EmptyState
        icon={User}
        title="Customer Record Not Found"
        description={`We could not locate profile data for customer ID "${id}".`}
        actionLabel="Back to Customers"
        onAction={() => router.push('/admin/customers')}
      />
    );
  }

  const averageOrderValue =
    customer.totalOrders > 0 ? Math.round(customer.totalSpent / customer.totalOrders) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/customers')}
            className="h-9 w-9 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white font-bold text-lg shadow-md">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">{customer.name}</h1>
                <StatusBadge status={customer.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-mono">Customer ID: {customer.id}</p>
            </div>
          </div>
        </div>

        <Button
          variant={customer.status === 'active' ? 'outline' : 'default'}
          size="sm"
          onClick={toggleStatus}
          className="h-9 text-xs"
        >
          {customer.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Lifetime Spend</p>
            <p className="text-xl font-bold text-emerald-700 mt-1">
              {formatPrice(customer.totalSpent)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Completed Orders</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{customer.totalOrders}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Average Order Value (AOV)</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {formatPrice(averageOrderValue)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order History (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            Purchase History ({customer.orders?.length || 0})
          </h3>

          {!customer.orders || customer.orders.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No orders on record.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-y border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Total</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customer.orders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-primary">{o.orderNumber}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(o.createdAt)}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {formatPrice(o.grandTotal)}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={o.paymentStatus} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={o.orderStatus} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          View &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contact & Addresses (1 col) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Contact Channels
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-medium">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-mono">{customer.phone}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Saved Delivery Addresses</span>
            </h3>

            {customer.addresses?.map((a: any) => (
              <div
                key={a.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1 text-slate-700"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
                    {a.type} Address
                  </span>
                  {a.isDefault && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                      Default
                    </span>
                  )}
                </div>
                <p>{a.street}</p>
                <p>
                  {a.city}, {a.state} - {a.postalCode}
                </p>
                <p className="text-slate-500">{a.country}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

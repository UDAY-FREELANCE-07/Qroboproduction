'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { EmptyState } from '@/components/admin/EmptyState';
import { adminService } from '@/lib/admin/admin-service';
import { AdminPayment } from '@/lib/admin/admin-types';
import { formatPrice, formatDateTime } from '@/lib/format';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Refund Dialog
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [paymentToRefund, setPaymentToRefund] = useState<AdminPayment | null>(null);

  const fetchPayments = async () => {
    setIsLoading(true);
    const data = await adminService.getPayments();
    setPayments(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefundConfirm = async () => {
    if (paymentToRefund) {
      await adminService.refundPayment(paymentToRefund.id);
      setPaymentToRefund(null);
      fetchPayments();
    }
  };

  const filtered = payments.filter((p) => {
    const matchSearch =
      p.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      p.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase());
    const matchProvider = providerFilter === 'ALL' || p.provider === providerFilter;
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchProvider && matchStatus;
  });

  const totalCaptured = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'refunded')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment Transactions</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Financial ledger, gateway transaction references (Razorpay, UPI, COD), and refund audits.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPayments}
          className="h-9 gap-1.5 text-xs text-slate-600 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Ledger</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Net Captured Revenue</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">
              {formatPrice(totalCaptured)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Transactions</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{payments.length}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Refunded</p>
            <p className="text-2xl font-bold text-rose-600 mt-0.5">
              {formatPrice(totalRefunded)}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <RotateCcw className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by transaction ID, order #, or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Payment Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Providers</SelectItem>
              <SelectItem value="Razorpay">Razorpay</SelectItem>
              <SelectItem value="UPI">UPI Direct</SelectItem>
              <SelectItem value="Cash on Delivery">Cash on Delivery (COD)</SelectItem>
              <SelectItem value="Stripe">Stripe</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Transaction Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Payment Statuses</SelectItem>
              <SelectItem value="paid">Paid / Settled</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading payment ledger...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No transactions found"
            description="No transaction records match your query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Provider & Method</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {p.transactionId}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-primary">
                      <Link href={`/admin/orders/${p.orderId}`} className="hover:underline">
                        {p.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{p.customerName}</p>
                      <p className="text-[11px] text-slate-400">{p.customerEmail}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">{p.provider}</span>
                      <span className="block text-[11px] text-slate-400">{p.paymentMethod}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {formatPrice(p.amount)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {formatDateTime(p.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === 'paid' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPaymentToRefund(p);
                            setRefundDialogOpen(true);
                          }}
                          className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                        >
                          Initiate Refund
                        </Button>
                      ) : p.status === 'refunded' ? (
                        <span className="text-[11px] text-slate-400 font-medium">Refunded</span>
                      ) : (
                        <span className="text-[11px] text-slate-400">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Confirmation Dialog */}
      <ConfirmDialog
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        title="Authorize Customer Refund"
        description={`Are you sure you want to refund ${formatPrice(
          paymentToRefund?.amount || 0
        )} for transaction ${paymentToRefund?.transactionId}? This will record a reversal in the gateway ledger.`}
        confirmLabel="Authorize Refund"
        destructive
        onConfirm={handleRefundConfirm}
      />
    </div>
  );
}

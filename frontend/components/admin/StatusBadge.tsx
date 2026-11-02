'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { OrderStatus, PaymentStatus } from '@/lib/admin/admin-types';

type BadgeType =
  | OrderStatus
  | PaymentStatus
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'expired'
  | 'scheduled'
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'published'
  | 'draft'
  | 'archived'
  | 'approved'
  | 'rejected'
  | 'hidden'
  | 'open'
  | 'in_progress'
  | 'waiting'
  | 'resolved'
  | 'closed';

interface StatusBadgeProps {
  status: BadgeType | string;
  className?: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  // Order statuses
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  processing: { label: 'Processing', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  packed: { label: 'Packed', bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  shipped: { label: 'Shipped', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  delivered: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  returned: { label: 'Returned', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },

  // Payment statuses
  paid: { label: 'Paid', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  failed: { label: 'Failed', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  refunded: { label: 'Refunded', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
  partially_refunded: { label: 'Partially Refunded', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },

  // Stock statuses
  in_stock: { label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  low_stock: { label: 'Low Stock', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  out_of_stock: { label: 'Out of Stock', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },

  // Publishing / Entity statuses
  published: { label: 'Published', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
  archived: { label: 'Archived', bg: 'bg-zinc-100', text: 'text-zinc-600', dot: 'bg-zinc-400' },
  active: { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  inactive: { label: 'Inactive', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
  suspended: { label: 'Suspended', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  expired: { label: 'Expired', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
  scheduled: { label: 'Scheduled', bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },

  // Review statuses
  approved: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  hidden: { label: 'Hidden', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },

  // Support Ticket statuses
  open: { label: 'Open', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  waiting: { label: 'Waiting on Customer', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  closed: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
};

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const norm = String(status).toLowerCase().replace(' ', '_');
  const conf = statusConfig[norm] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border border-black/5',
        conf.bg,
        conf.text,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', conf.dot)} />
      {conf.label}
    </span>
  );
}

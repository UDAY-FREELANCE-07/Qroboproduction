'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  EyeOff,
  Trash2,
  Check,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { EmptyState } from '@/components/admin/EmptyState';
import { adminService } from '@/lib/admin/admin-service';
import { AdminReview } from '@/lib/admin/admin-types';
import { formatDate } from '@/lib/format';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchReviews = async () => {
    setIsLoading(true);
    const data = await adminService.getReviews();
    setReviews(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: AdminReview['status']) => {
    await adminService.updateReviewStatus(id, status);
    fetchReviews();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await adminService.deleteReview(deleteId);
      setDeleteId(null);
      fetchReviews();
    }
  };

  const filtered = reviews.filter((r) => {
    const matchSearch =
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Review Moderation</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Moderate community feedback, verify hardware purchase ratings, and reject spam.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchReviews}
          className="h-9 gap-1.5 text-xs text-slate-600 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by product, reviewer, or text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Moderation Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="approved">Approved & Visible</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No reviews found"
            description="No customer reviews match your filter parameters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Hardware Product</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">Feedback & Comments</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <img
                          src={r.productImage}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover border border-slate-200 shrink-0 bg-white"
                        />
                        <span className="font-bold text-slate-900 line-clamp-1">{r.productName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{r.customerName}</p>
                      {r.isVerifiedPurchase && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          Verified Buyer
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-500 whitespace-nowrap">
                      {'★'.repeat(r.rating)}
                      <span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span>
                    </td>
                    <td className="py-3 px-3 max-w-sm">
                      <p className="font-semibold text-slate-900">{r.title}</p>
                      <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">{r.comment}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== 'approved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(r.id, 'approved')}
                            className="h-7 text-xs text-emerald-600 hover:bg-emerald-50"
                            title="Approve"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            <span>Approve</span>
                          </Button>
                        )}
                        {r.status !== 'rejected' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(r.id, 'rejected')}
                            className="h-7 text-xs text-amber-600 hover:bg-amber-50"
                            title="Reject"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            <span>Reject</span>
                          </Button>
                        )}
                        {r.status !== 'hidden' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(r.id, 'hidden')}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                            title="Hide"
                          >
                            <EyeOff className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteId(r.id);
                            setDeleteOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Review"
        description="Are you sure you want to permanently delete this customer review?"
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { adminService } from '@/lib/admin/admin-service';
import { AdminCoupon } from '@/lib/admin/admin-types';
import { formatPrice, formatDate } from '@/lib/format';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(200);
  const [minOrder, setMinOrder] = useState<number>(1499);
  const [maxDiscount, setMaxDiscount] = useState<number>(500);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [status, setStatus] = useState<'active' | 'inactive' | 'expired'>('active');

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchCoupons = async () => {
    setIsLoading(true);
    const data = await adminService.getCoupons();
    setCoupons(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDesc('');
    setDiscountType('fixed');
    setDiscountValue(200);
    setMinOrder(1499);
    setMaxDiscount(500);
    setUsageLimit(500);
    setStartDate('2026-01-01');
    setEndDate('2026-12-31');
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (c: AdminCoupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDesc(c.description);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrder(c.minOrderValue);
    setMaxDiscount(c.maxDiscount || 500);
    setUsageLimit(c.usageLimit);
    setStartDate(c.startDate.split('T')[0]);
    setEndDate(c.endDate.split('T')[0]);
    setStatus(c.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const payload = {
      code: code.trim().toUpperCase(),
      description: desc,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrder),
      maxDiscount: discountType === 'percentage' ? Number(maxDiscount) : undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      usageLimit: Number(usageLimit),
      perCustomerLimit: 1,
      status,
    };

    if (editingCoupon) {
      await adminService.updateCoupon(editingCoupon.id, payload);
    } else {
      await adminService.createCoupon(payload);
    }
    setModalOpen(false);
    fetchCoupons();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await adminService.deleteCoupon(deleteId);
      setDeleteId(null);
      fetchCoupons();
    }
  };

  const toggleStatus = async (c: AdminCoupon) => {
    const next = c.status === 'active' ? 'inactive' : 'active';
    await adminService.updateCoupon(c.id, { status: next });
    fetchCoupons();
  };

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Discount Coupons & Vouchers</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create promotional codes, bulk student classroom vouchers, and festive cart discounts.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="h-9 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>Create Coupon Code</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search coupon codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">{filtered.length} coupons total</span>
      </div>

      {/* Coupons Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-3">Discount Type & Value</th>
                <th className="py-3 px-3">Min Order</th>
                <th className="py-3 px-3">Redemption Usage</th>
                <th className="py-3 px-3">Validity Window</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-primary tracking-wide bg-primary/10 px-2 py-0.5 rounded">
                        {c.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 max-w-xs">
                      {c.description}
                    </p>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% OFF (Max ₹${c.maxDiscount || 'N/A'})`
                      : `Flat ₹${c.discountValue} OFF`}
                  </td>
                  <td className="py-3 px-3 text-slate-700">{formatPrice(c.minOrderValue)}</td>
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-600 font-mono">
                        <span>{c.usedCount} used</span>
                        <span>{c.usageLimit} cap</span>
                      </div>
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {formatDate(c.startDate)} &rarr; {formatDate(c.endDate)}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(c)}
                        className="h-8 text-xs text-slate-600"
                      >
                        {c.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(c)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteId(c.id);
                          setDeleteOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
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
      </div>

      {/* Add / Edit Coupon Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-slate-900">
                {editingCoupon ? 'Edit Coupon' : 'Create New Discount Coupon'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ROBOFEST500"
                  className="font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc">Promotion Description</Label>
                <Input
                  id="desc"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. ₹500 off on educational robotics kits"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Discount Type</Label>
                  <Select
                    value={discountType}
                    onValueChange={(val) => setDiscountType(val as 'fixed' | 'percentage')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Flat Rupee Amount (₹)</SelectItem>
                      <SelectItem value="percentage">Percentage Discount (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="val">
                    {discountType === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
                  </Label>
                  <Input
                    id="val"
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="min-order">Min Order Value (₹)</Label>
                  <Input
                    id="min-order"
                    type="number"
                    min="0"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="usage-limit">Total Usage Limit</Label>
                  <Input
                    id="usage-limit"
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start">Start Date</Label>
                  <Input
                    id="start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="end">End Date</Label>
                  <Input
                    id="end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as 'active' | 'inactive' | 'expired')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingCoupon ? 'Update Coupon' : 'Create Coupon'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? Customers will no longer be able to apply this code at checkout."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { InventoryAdjustment } from '@/lib/admin/admin-types';

interface StockAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: { id: string; name: string; sku: string; stock: number } | null;
  onConfirm: (
    productId: string,
    delta: number,
    type: InventoryAdjustment['type'],
    reason: string
  ) => Promise<void>;
}

export function StockAdjustmentModal({
  open,
  onOpenChange,
  product,
  onConfirm,
}: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<InventoryAdjustment['type']>('restock');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;

  const currentStock = product.stock;
  // If damaged or audit correction, allow negative delta
  const isDeduction = adjustmentType === 'damaged';
  const effectiveDelta = isDeduction ? -Math.abs(quantity) : Math.abs(quantity);
  const resultingStock = Math.max(0, currentStock + effectiveDelta);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for this stock adjustment.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(product.id, effectiveDelta, adjustmentType, reason);
      onOpenChange(false);
      setReason('');
      setQuantity(10);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-slate-900">Adjust Inventory Stock</DialogTitle>
            <DialogDescription className="text-slate-500">
              Update on-hand warehouse quantity for <span className="font-semibold text-slate-800">{product.name}</span> ({product.sku}).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 grid grid-cols-3 text-center">
              <div>
                <p className="text-xs text-slate-500">Current Stock</p>
                <p className="text-lg font-bold text-slate-800">{currentStock}</p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-xs text-slate-500">Adjustment</p>
                <p
                  className={`text-lg font-bold ${
                    effectiveDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {effectiveDelta >= 0 ? `+${effectiveDelta}` : effectiveDelta}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">New Total</p>
                <p className="text-lg font-bold text-primary">{resultingStock}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adj-type">Adjustment Reason / Type</Label>
              <Select
                value={adjustmentType}
                onValueChange={(val) => setAdjustmentType(val as InventoryAdjustment['type'])}
              >
                <SelectTrigger id="adj-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restock">Restock / Supplier Delivery (+)</SelectItem>
                  <SelectItem value="audit">Inventory Count Reconciliation (+/-)</SelectItem>
                  <SelectItem value="damaged">Damaged / Written-off Stock (-)</SelectItem>
                  <SelectItem value="return">Customer Return (+)</SelectItem>
                  <SelectItem value="adjustment">Internal Lab Allocation / Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quantity">Adjustment Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason">Operational Note / PO Number</Label>
              <Textarea
                id="reason"
                placeholder="e.g. Received shipment from Robocraze partner, PO #89201"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Confirm Adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

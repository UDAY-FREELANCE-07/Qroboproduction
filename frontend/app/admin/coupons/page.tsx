'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';

type Coupon = Database['public']['Tables']['coupons']['Row'];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');

  const load = async () => {
    const { data } = await dataClient.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      code: code.toUpperCase(),
      description,
      discount_type: discountType,
      discount_value: parseFloat(discountValue) || 0,
      min_order_value: parseFloat(minOrderValue) || 0,
      max_discount: maxDiscount ? parseFloat(maxDiscount) : null,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
      is_active: true,
    };
    if (editing) {
      await dataClient.from('coupons').update(data).eq('id', editing.id);
      toast.success('Coupon updated');
    } else {
      await dataClient.from('coupons').insert(data);
      toast.success('Coupon created');
    }
    setEditing(null); setCode(''); setDescription(''); setDiscountValue(''); setMaxDiscount(''); setUsageLimit('');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await dataClient.from('coupons').delete().eq('id', id);
    toast.success('Coupon deleted');
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Coupons</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-navy mb-4">{editing ? 'Edit Coupon' : 'Add Coupon'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="code">Code</Label><Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required className="mt-1 uppercase" /></div>
            <div><Label htmlFor="description">Description</Label><Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" /></div>
            <div>
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="discountValue">Discount Value {discountType === 'percentage' ? '(%)' : '(Rs)'}</Label><Input id="discountValue" type="number" step="0.01" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required className="mt-1" /></div>
            <div><Label htmlFor="minOrderValue">Min Order Value</Label><Input id="minOrderValue" type="number" value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="maxDiscount">Max Discount (optional)</Label><Input id="maxDiscount" type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="usageLimit">Usage Limit (optional)</Label><Input id="usageLimit" type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} className="mt-1" /></div>
            <div className="flex gap-2">
              <Button type="submit">{editing ? 'Update' : 'Add'} Coupon</Button>
              {editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); setCode(''); }}>Cancel</Button>}
            </div>
          </form>
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          {isLoading ? <div className="p-4 animate-pulse">Loading...</div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead>Min Order</TableHead><TableHead>Used</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="text-sm font-bold text-navy">{coupon.code}</TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">{coupon.discount_type}</TableCell>
                    <TableCell className="text-sm text-navy">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatPrice(coupon.discount_value)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatPrice(coupon.min_order_value)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{coupon.used_count}/{coupon.usage_limit || '∞'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setEditing(coupon); setCode(coupon.code); setDescription(coupon.description || ''); setDiscountType(coupon.discount_type); setDiscountValue(coupon.discount_value.toString()); setMinOrderValue(coupon.min_order_value.toString()); setMaxDiscount(coupon.max_discount?.toString() || ''); setUsageLimit(coupon.usage_limit?.toString() || ''); }}><Pencil className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(coupon.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { adminService } from '@/lib/admin/admin-service';
import { AdminPromotion } from '@/lib/admin/admin-types';
import { formatDate } from '@/lib/format';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<AdminPromotion | null>(null);
  const [name, setName] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [description, setDescription] = useState('');
  const [discountText, setDiscountText] = useState('FLAT 30% OFF');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaDestination, setCtaDestination] = useState('/shop');
  const [position, setPosition] = useState<AdminPromotion['position']>('hero');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-11-30');
  const [status, setStatus] = useState<AdminPromotion['status']>('active');

  // Preview State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPromo, setPreviewPromo] = useState<AdminPromotion | null>(null);

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchPromos = async () => {
    setIsLoading(true);
    const data = await adminService.getPromotions();
    setPromotions(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const openCreateModal = () => {
    setEditingPromo(null);
    setName('');
    setBannerImage('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200');
    setDescription('');
    setDiscountText('UP TO 40% OFF');
    setCtaText('Explore Hardware');
    setCtaDestination('/shop');
    setPosition('hero');
    setStartDate('2026-11-01');
    setEndDate('2026-11-30');
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (p: AdminPromotion) => {
    setEditingPromo(p);
    setName(p.name);
    setBannerImage(p.bannerImage);
    setDescription(p.description);
    setDiscountText(p.discountText);
    setCtaText(p.ctaText);
    setCtaDestination(p.ctaDestination);
    setPosition(p.position);
    setStartDate(p.startDate.split('T')[0]);
    setEndDate(p.endDate.split('T')[0]);
    setStatus(p.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      bannerImage,
      description,
      discountText,
      ctaText,
      ctaDestination,
      position,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status,
    };

    if (editingPromo) {
      await adminService.updatePromotion(editingPromo.id, payload);
    } else {
      await adminService.createPromotion(payload);
    }
    setModalOpen(false);
    fetchPromos();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await adminService.deletePromotion(deleteId);
      setDeleteId(null);
      fetchPromos();
    }
  };

  const toggleStatus = async (p: AdminPromotion) => {
    const next = p.status === 'active' ? 'inactive' : 'active';
    await adminService.updatePromotion(p.id, { status: next });
    fetchPromos();
  };

  const filtered = promotions.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Promotional Campaigns</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage storefront banners, hero carousel slides, flash event headers, and CTAs.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="h-9 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>New Promotion</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">{filtered.length} campaigns</span>
      </div>

      {/* Promotions Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Campaign Banner</th>
                <th className="py-3 px-3">Position</th>
                <th className="py-3 px-3">Headline / Callout</th>
                <th className="py-3 px-3">Call to Action</th>
                <th className="py-3 px-3">Schedule Window</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <img
                        src={p.bannerImage}
                        alt=""
                        className="h-12 w-20 rounded-md object-cover border border-slate-200 shrink-0 bg-slate-100"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-600 font-mono">
                    {p.position.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3 font-semibold text-primary">{p.discountText}</td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">{p.ctaText}</span>
                    <span className="block text-[10px] font-mono text-slate-400">
                      {p.ctaDestination}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {formatDate(p.startDate)} &rarr; {formatDate(p.endDate)}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPreviewPromo(p);
                          setPreviewOpen(true);
                        }}
                        className="h-8 w-8 p-0"
                        title="Preview Banner"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(p)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteId(p.id);
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

      {/* Add / Edit Promotion Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-slate-900">
                {editingPromo ? 'Edit Promotional Campaign' : 'Create New Campaign Banner'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="p-name">Campaign Title *</Label>
                <Input
                  id="p-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diwali Robotics Mega Sale"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-img">Banner Image URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="p-img"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="https://..."
                    className="text-xs"
                    required
                  />
                  <img
                    src={bannerImage}
                    alt=""
                    className="h-8 w-12 rounded border border-slate-200 object-cover shrink-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-desc">Subtitle / Teaser Description</Label>
                <Input
                  id="p-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Up to 40% discount on microcontrollers..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="p-disc">Highlight Badge / Tag</Label>
                  <Input
                    id="p-disc"
                    value={discountText}
                    onChange={(e) => setDiscountText(e.target.value)}
                    placeholder="FLAT 40% OFF"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Storefront Position</Label>
                  <Select
                    value={position}
                    onValueChange={(val) => setPosition(val as AdminPromotion['position'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero Main Carousel</SelectItem>
                      <SelectItem value="top_strip">Top Promotional Strip</SelectItem>
                      <SelectItem value="middle_banner">Middle Feature Banner</SelectItem>
                      <SelectItem value="sidebar">Sidebar Ad Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="p-cta-text">CTA Button Label</Label>
                  <Input
                    id="p-cta-text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Shop Now"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="p-cta-dest">CTA Link Destination</Label>
                  <Input
                    id="p-cta-dest"
                    value={ctaDestination}
                    onChange={(e) => setCtaDestination(e.target.value)}
                    placeholder="/shop?category=development-boards"
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="p-start">Start Date</Label>
                  <Input
                    id="p-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="p-end">End Date</Label>
                  <Input
                    id="p-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Campaign Status</Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as AdminPromotion['status'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Live in Store)</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="inactive">Inactive / Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPromo ? 'Save Campaign' : 'Create Campaign'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Banner Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Campaign Preview</DialogTitle>
          </DialogHeader>
          {previewPromo && (
            <div className="relative overflow-hidden rounded-xl border border-slate-200">
              <img
                src={previewPromo.bannerImage}
                alt=""
                className="h-64 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-center text-white">
                <span className="inline-block bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded w-fit mb-2">
                  {previewPromo.discountText}
                </span>
                <h3 className="text-2xl font-bold">{previewPromo.name}</h3>
                <p className="text-xs text-slate-200 max-w-sm mt-1">{previewPromo.description}</p>
                <Button className="mt-4 w-fit h-9 text-xs font-bold" size="sm">
                  {previewPromo.ctaText} &rarr;
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Campaign"
        description="Are you sure you want to remove this promotional campaign? It will be removed from storefront banners immediately."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

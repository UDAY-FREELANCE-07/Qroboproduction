'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Tag, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { adminService } from '@/lib/admin/admin-service';
import { AdminBrand } from '@/lib/admin/admin-types';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<AdminBrand | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchBrands = async () => {
    setIsLoading(true);
    const data = await adminService.getBrands();
    setBrands(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setLogo('https://images.unsplash.com/photo-1518770660439-4636190af475?w=160');
    setWebsite('');
    setDescription('');
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (b: AdminBrand) => {
    setEditingBrand(b);
    setName(b.name);
    setSlug(b.slug);
    setLogo(b.logo);
    setWebsite(b.website || '');
    setDescription(b.description);
    setStatus(b.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      logo,
      website,
      description,
      status,
    };

    if (editingBrand) {
      await adminService.updateBrand(editingBrand.id, payload);
    } else {
      await adminService.createBrand(payload);
    }
    setModalOpen(false);
    fetchBrands();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await adminService.deleteBrand(deleteId);
      setDeleteId(null);
      fetchBrands();
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brand Partners & Manufacturers</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage electronics manufacturers, authorized distributors, and supplier profiles.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="h-9 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>Add Brand</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredBrands.length} partner brands
        </span>
      </div>

      {/* Brands Grid / Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Brand Logo & Details</th>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Official Website</th>
                <th className="py-3 px-3">Products Listed</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBrands.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.logo}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-white p-1"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{b.name}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-sm">
                          {b.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">{b.slug}</td>
                  <td className="py-3 px-3">
                    {b.website ? (
                      <a
                        href={b.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">{b.website.replace('https://', '')}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    ) : (
                      <span className="text-slate-400">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">{b.productCount} items</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={b.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(b)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteId(b.id);
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

      {/* Add / Edit Brand Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-slate-900">
                {editingBrand ? 'Edit Brand Partner' : 'Add New Brand Partner'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="brand-name">Brand Name *</Label>
                <Input
                  id="brand-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Raspberry Pi"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brand-slug">URL Slug</Label>
                <Input
                  id="brand-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="raspberry-pi"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brand-logo">Logo Image URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="brand-logo"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="https://..."
                    className="text-xs"
                  />
                  <img
                    src={logo}
                    alt=""
                    className="h-8 w-8 rounded border border-slate-200 object-cover shrink-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brand-web">Official Website</Label>
                <Input
                  id="brand-web"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://arduino.cc"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brand-desc">Short Profile / Description</Label>
                <Textarea
                  id="brand-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Manufacturer summary and distributor details..."
                />
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as 'active' | 'inactive')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingBrand ? 'Save Changes' : 'Create Brand'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Brand"
        description="Are you sure you want to remove this brand? Products linked to this brand will remain intact."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

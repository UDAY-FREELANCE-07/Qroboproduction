'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoveUp,
  MoveDown,
  CheckCircle2,
  XCircle,
  Layers,
  Bot,
  Cpu,
  Radar,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { adminService } from '@/lib/admin/admin-service';
import { AdminCategory } from '@/lib/admin/admin-types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formParentId, setFormParentId] = useState<string>('none');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Cpu');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  // Delete Dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchCats = async () => {
    setIsLoading(true);
    const data = await adminService.getCategories();
    setCategories(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormParentId('none');
    setFormDesc('');
    setFormIcon('Cpu');
    setFormStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (cat: AdminCategory) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormParentId(cat.parentId || 'none');
    setFormDesc(cat.description);
    setFormIcon(cat.iconName || 'Cpu');
    setFormStatus(cat.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const parentCat = categories.find((c) => c.id === formParentId);

    const payload = {
      name: formName,
      slug: formSlug || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formDesc,
      parentId: formParentId === 'none' ? null : formParentId,
      parentName: parentCat ? parentCat.name : undefined,
      iconName: formIcon,
      status: formStatus,
      isFeatured: false,
      sortOrder: editingCategory ? editingCategory.sortOrder : categories.length + 1,
    };

    if (editingCategory) {
      await adminService.updateCategory(editingCategory.id, payload);
    } else {
      await adminService.createCategory(payload);
    }
    setModalOpen(false);
    fetchCats();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await adminService.deleteCategory(deleteId);
      setDeleteId(null);
      fetchCats();
    }
  };

  const toggleStatus = async (cat: AdminCategory) => {
    const nextStatus = cat.status === 'active' ? 'inactive' : 'active';
    await adminService.updateCategory(cat.id, { status: nextStatus });
    fetchCats();
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const getIconComponent = (name?: string) => {
    switch (name) {
      case 'Bot':
        return <Bot className="h-4 w-4" />;
      case 'Radar':
        return <Radar className="h-4 w-4" />;
      case 'GraduationCap':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Cpu className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Category Hierarchy</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize catalog into parents, subcategories, and hardware classifications.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="h-9 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>New Category</span>
        </Button>
      </div>

      {/* Filter / Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredCategories.length} categories total
        </span>
      </div>

      {/* Categories Table with Hierarchy Indentation */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Category Name & Hierarchy</th>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Parent Group</th>
                <th className="py-3 px-3">Product Count</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.map((c) => {
                const isChild = !!c.parentId;
                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isChild ? 'bg-slate-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div
                        className={`flex items-center gap-2.5 ${
                          isChild ? 'pl-6 border-l-2 border-primary/30 ml-2' : ''
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 shrink-0">
                          {getIconComponent(c.iconName)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {c.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{c.slug}</td>
                    <td className="py-3 px-3">
                      {c.parentName ? (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          <Layers className="h-3 w-3 text-slate-400" />
                          {c.parentName}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Root Level</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">{c.productCount} items</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(c)}
                          className="h-8 text-xs text-slate-500 hover:text-slate-900"
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat-name">Category Name *</Label>
                <Input
                  id="cat-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Robot Arms & Grippers"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-slug">URL Slug</Label>
                <Input
                  id="cat-slug"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="robot-arms-grippers"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Parent Hierarchy (Optional)</Label>
                <Select value={formParentId} onValueChange={setFormParentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Root Level (None)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top-Level Category)</SelectItem>
                    {categories
                      .filter((c) => !c.parentId && c.id !== editingCategory?.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-desc">Description</Label>
                <Input
                  id="cat-desc"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Summary for browsing and SEO..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Icon</Label>
                  <Select value={formIcon} onValueChange={setFormIcon}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cpu">Microcontroller (Cpu)</SelectItem>
                      <SelectItem value="Bot">Robotics (Bot)</SelectItem>
                      <SelectItem value="Radar">Sensors (Radar)</SelectItem>
                      <SelectItem value="GraduationCap">STEM (GraduationCap)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={formStatus}
                    onValueChange={(val) => setFormStatus(val as 'active' | 'inactive')}
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
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Category"
        description="Deleting this category will unassign associated hardware items. Are you sure you want to proceed?"
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowUpDown,
  RefreshCw,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { EmptyState } from '@/components/admin/EmptyState';
import { adminService } from '@/lib/admin/admin-service';
import { AdminProduct } from '@/lib/admin/admin-types';
import { formatPrice, formatDate } from '@/lib/format';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'price' | 'stock' | 'name'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    const data = await adminService.getProducts();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDuplicate = async (id: string) => {
    await adminService.duplicateProduct(id);
    fetchProducts();
  };

  const handleTogglePublish = async (p: AdminProduct) => {
    const nextStatus = p.status === 'published' ? 'draft' : 'published';
    await adminService.updateProduct(p.id, { status: nextStatus });
    fetchProducts();
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      await adminService.deleteProduct(productToDelete);
      setProductToDelete(null);
      fetchProducts();
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await adminService.deleteProduct(id);
    }
    setSelectedIds([]);
    fetchProducts();
  };

  const handleBulkStatusChange = async (status: 'published' | 'draft') => {
    for (const id of selectedIds) {
      await adminService.updateProduct(id, { status });
    }
    setSelectedIds([]);
    fetchProducts();
  };

  // Filtered & Sorted List
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesBrand = brandFilter === 'ALL' || p.brand === brandFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesCat && matchesBrand && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'price') comparison = a.price - b.price;
    else if (sortBy === 'stock') comparison = a.stock - b.stock;
    else if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    else comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const brands = Array.from(new Set(products.map((p) => p.brand)));

  const allSelected =
    sortedProducts.length > 0 && selectedIds.length === sortedProducts.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product Catalog</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your hardware inventory, pricing, specifications, and e-commerce listings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            className="h-9 gap-1.5 text-xs text-slate-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Link href="/admin/products/new">
            <Button size="sm" className="h-9 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Hardware Item</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Category: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Brand Filter */}
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Brand: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Action Bar (Visible when items selected) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 text-xs">
            <span className="font-semibold text-primary">
              {selectedIds.length} product{selectedIds.length === 1 ? '' : 's'} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange('published')}
                className="h-7 text-xs"
              >
                Publish Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusChange('draft')}
                className="h-7 text-xs"
              >
                Unpublish Selected
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="h-7 text-xs"
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading catalog...</div>
        ) : sortedProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="No items match your filter criteria. Try clearing search or add a new hardware item."
            actionLabel="Add Product"
            onAction={() => router.push('/admin/products/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th className="py-3 px-3">Item</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Brand</th>
                  <th
                    className="py-3 px-3 cursor-pointer select-none"
                    onClick={() => {
                      setSortBy('price');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Price</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 cursor-pointer select-none"
                    onClick={() => {
                      setSortBy('stock');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>Stock</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedProducts.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleSelectOne(p.id)}
                          aria-label={`Select ${p.name}`}
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          {p.primaryImage ? (
                            <img
                              src={p.primaryImage}
                              alt=""
                              className="h-10 w-10 rounded-md object-contain border border-slate-200 shrink-0 bg-white p-0.5"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center text-slate-400">
                              <Package className="h-4 w-4 text-slate-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-bold text-slate-900 hover:text-primary transition-colors line-clamp-1"
                            >
                              {p.name}
                            </Link>
                            <span className="text-[10px] text-slate-400">
                              {p.warehouse}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-600">{p.sku}</td>
                      <td className="py-3 px-3 text-slate-700">{p.category}</td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{p.brand}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{formatPrice(p.price)}</td>
                      <td className="py-3 px-3">
                        <StatusBadge
                          status={
                            p.stock <= 0
                              ? 'out_of_stock'
                              : p.stock <= p.lowStockThreshold
                              ? 'low_stock'
                              : 'in_stock'
                          }
                          size="sm"
                        />
                        <span className="ml-1.5 text-[11px] text-slate-500 font-semibold">
                          ({p.stock})
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(p.updatedAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 text-xs">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/products/${p.id}`}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span>Edit Product</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(p.id)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>Duplicate</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleTogglePublish(p)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              {p.status === 'published' ? (
                                <>
                                  <XCircle className="h-3.5 w-3.5 text-amber-500" />
                                  <span>Unpublish</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>Publish</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setProductToDelete(p.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="flex items-center gap-2 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description="Are you sure you want to permanently delete this product? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

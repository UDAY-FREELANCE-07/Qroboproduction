'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminProduct } from '@/lib/admin/admin-types';
import { adminService } from '@/lib/admin/admin-service';
import { formatPrice, calculateDiscountPercentage } from '@/lib/format';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProductFormProps {
  initialData?: AdminProduct | null;
  isEditing?: boolean;
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();

  // Categories and Brands for dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [brand, setBrand] = useState(initialData?.brand || 'Arduino');
  const [category, setCategory] = useState(initialData?.category || 'Development Boards');
  const [subcategory, setSubcategory] = useState(initialData?.subcategory || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');

  // Media
  const [primaryImage, setPrimaryImage] = useState(
    initialData?.primaryImage ||
      'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80'
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.galleryImages || []
  );
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');

  // Pricing
  const [price, setPrice] = useState<number>(initialData?.price || 1499);
  const [originalPrice, setOriginalPrice] = useState<number>(initialData?.originalPrice || 1799);
  const [taxRate, setTaxRate] = useState<number>(initialData?.taxRate || 18);

  // Inventory
  const [stock, setStock] = useState<number>(initialData?.stock ?? 50);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    initialData?.lowStockThreshold ?? 10
  );
  const [warehouse, setWarehouse] = useState(initialData?.warehouse || 'Bangalore Hub A');

  // Dynamic Specifications
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>(() => {
    if (initialData?.specifications) {
      return Object.entries(initialData.specifications).map(([key, value]) => ({ key, value }));
    }
    return [
      { key: 'Microcontroller / CPU', value: 'Arm Cortex-M4' },
      { key: 'Operating Voltage', value: '5V DC' },
      { key: 'Digital I/O Pins', value: '14' },
    ];
  });

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');

  // Status
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>(
    initialData?.status || 'published'
  );

  // Submission & Preview state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchCatsAndBrands = async () => {
      const [c, b] = await Promise.all([
        adminService.getCategories(),
        adminService.getBrands(),
      ]);
      setCategories(c);
      setBrands(b);
    };
    fetchCatsAndBrands();
  }, []);

  // Auto-slug generator from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const addSpecRow = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const removeSpecRow = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const updateSpecRow = (idx: number, field: 'key' | 'value', val: string) => {
    setSpecs(
      specs.map((row, i) => (i === idx ? { ...row, [field]: val } : row))
    );
  };

  const addGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setGalleryImages([...galleryImages, newGalleryUrl.trim()]);
      setNewGalleryUrl('');
    }
  };

  const removeGalleryImage = (idx: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== idx));
  };

  const handleSave = async (targetStatus?: 'published' | 'draft') => {
    setError(null);
    if (!name.trim()) {
      setError('Product Name is required.');
      return;
    }
    if (!sku.trim()) {
      setError('SKU is required.');
      return;
    }
    if (price <= 0) {
      setError('Selling price must be greater than zero.');
      return;
    }

    setIsSubmitting(true);

    const specRecord: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specRecord[s.key.trim()] = s.value.trim();
      }
    });

    const finalStatus = targetStatus || status;

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: sku.toUpperCase(),
      brand,
      category,
      subcategory,
      shortDescription,
      description,
      primaryImage,
      galleryImages,
      videoUrl,
      price: Number(price),
      originalPrice: Number(originalPrice) || Number(price),
      discountPercentage: calculateDiscountPercentage(Number(originalPrice), Number(price)),
      taxRate: Number(taxRate),
      stock: Number(stock),
      reservedStock: initialData?.reservedStock || 0,
      lowStockThreshold: Number(lowStockThreshold),
      warehouse,
      specifications: specRecord,
      seoTitle: seoTitle || `${name} | QROBO India`,
      seoDescription: seoDescription || shortDescription,
      status: finalStatus,
    };

    try {
      if (isEditing && initialData) {
        await adminService.updateProduct(initialData.id, payload);
      } else {
        await adminService.createProduct(payload);
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/products'); router.refresh();
      }, 600);
    } catch {
      setError('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const discountPercent = calculateDiscountPercentage(originalPrice, price);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-16 z-20 bg-slate-50/95 py-3 backdrop-blur border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/products')}
            className="h-9 w-9 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {isEditing ? `Edit: ${name || 'Product'}` : 'Create New Product'}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              {sku ? `SKU: ${sku}` : 'New Hardware Item'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            className="h-9 gap-1.5 text-xs text-slate-700"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSave('draft')}
            className="h-9 gap-1.5 text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleSave('published')}
            className="h-9 gap-1.5 text-xs"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{isEditing ? 'Update & Publish' : 'Publish Product'}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-2.5 text-xs text-emerald-700">
          <Check className="h-4 w-4 shrink-0" />
          <span>Product successfully saved! Redirecting to catalog...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: General Information */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              1. General Information
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Arduino Uno R4 WiFi Board"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU Code *</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="e.g. ARD-UNO-R4-WF"
                  className="font-mono"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="arduino-uno-r4-wifi"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Brand</Label>
                <Select value={brand} onValueChange={setBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.name}>
                        {b.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other / Generic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Primary Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="short-desc">Short Summary / Highlights</Label>
              <Input
                id="short-desc"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="32-bit RA4M1 processor with ESP32-S3 Wi-Fi & Bluetooth, 12x8 LED matrix"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Full Description & Technical Details</Label>
              <Textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed hardware documentation, connector specs, power parameters, pinout explanations..."
              />
            </div>
          </div>

          {/* Section 2: Technical Specifications */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                2. Technical Specifications
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpecRow}
                className="h-8 gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Attribute</span>
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Technical attributes will be cleanly rendered on the product detail specification table.
            </p>

            <div className="space-y-2.5">
              {specs.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="Attribute name (e.g. Clock Speed)"
                    value={row.key}
                    onChange={(e) => updateSpecRow(idx, 'key', e.target.value)}
                    className="flex-1 text-xs"
                  />
                  <Input
                    placeholder="Value (e.g. 48 MHz)"
                    value={row.value}
                    onChange={(e) => updateSpecRow(idx, 'value', e.target.value)}
                    className="flex-1 text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSpecRow(idx)}
                    className="h-9 w-9 p-0 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Media Gallery */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              3. Product Media & Gallery
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="primary-img">Primary Image URL *</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="primary-img"
                  value={primaryImage}
                  onChange={(e) => setPrimaryImage(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 text-xs"
                />
                <img
                  src={primaryImage}
                  alt="Preview"
                  className="h-10 w-10 rounded-md border border-slate-200 object-cover shrink-0 bg-slate-50"
                  onError={(e) => {
                    (e.target as any).src =
                      'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=200';
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Gallery Images</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="Paste additional product image URL..."
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addGalleryImage}
                  className="h-9 shrink-0 text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add URL</span>
                </Button>
              </div>

              {galleryImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2.5 pt-2">
                  {galleryImages.map((url, idx) => (
                    <div key={idx} className="relative group rounded-lg border border-slate-200 overflow-hidden">
                      <img src={url} alt="" className="h-20 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="video">Product Video Demo URL (YouTube / MP4)</Label>
              <Input
                id="video"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Controls (1 Column) */}
        <div className="space-y-6">
          {/* Pricing & GST Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Pricing & Taxes
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="price">Selling Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="orig-price">Original MRP (₹)</Label>
              <Input
                id="orig-price"
                type="number"
                min="1"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
              />
            </div>

            {discountPercent > 0 && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-center text-xs font-semibold text-emerald-700">
                Customer saves {discountPercent}% off MRP
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="tax">GST Tax Rate (%)</Label>
              <Select value={String(taxRate)} onValueChange={(v) => setTaxRate(Number(v))}>
                <SelectTrigger id="tax">
                  <SelectValue placeholder="Select GST" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% (Exempt)</SelectItem>
                  <SelectItem value="5">5% GST</SelectItem>
                  <SelectItem value="12">12% GST</SelectItem>
                  <SelectItem value="18">18% Standard Electronics GST</SelectItem>
                  <SelectItem value="28">28% Luxury Hardware GST</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Inventory & Warehousing Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Inventory & Warehouse
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="stock">Initial On-Hand Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="threshold">Low-Stock Alert Threshold</Label>
              <Input
                id="threshold"
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Fulfillment Warehouse</Label>
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bangalore Hub A">Bangalore Hub A (Primary)</SelectItem>
                  <SelectItem value="Hyderabad Central">Hyderabad Central</SelectItem>
                  <SelectItem value="Delhi Warehouse">Delhi Warehouse</SelectItem>
                  <SelectItem value="Mumbai West">Mumbai West</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Publishing & SEO Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Publishing & SEO
            </h3>

            <div className="space-y-1.5">
              <Label>Visibility Status</Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as 'published' | 'draft' | 'archived')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published (Visible in store)</SelectItem>
                  <SelectItem value="draft">Draft (Admin eyes only)</SelectItem>
                  <SelectItem value="archived">Archived / Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="seo-title">Custom SEO Meta Title</Label>
              <Input
                id="seo-title"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Buy ... Online | QROBO India"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="seo-desc">SEO Meta Description</Label>
              <Textarea
                id="seo-desc"
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Keywords, brief summary..."
                className="text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Customer Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Storefront Product Card Preview</DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-5 items-start">
            <img
              src={primaryImage}
              alt=""
              className="h-44 w-44 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
            />
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                {brand} &bull; {category}
              </span>
              <h4 className="text-base font-bold text-slate-900 leading-tight">
                {name || 'Product Title'}
              </h4>
              <p className="text-xs text-slate-500 font-mono">SKU: {sku || 'SKU-CODE'}</p>
              <p className="text-xs text-slate-600 line-clamp-2">
                {shortDescription || 'Short description will appear here...'}
              </p>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold text-slate-900">{formatPrice(price)}</span>
                {originalPrice > price && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-600">
                    ({discountPercent}% OFF)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Inclusive of {taxRate}% GST &bull; Ships from {warehouse}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

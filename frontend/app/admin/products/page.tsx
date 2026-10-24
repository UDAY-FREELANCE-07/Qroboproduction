'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const [prodRes, catRes, brandRes] = await Promise.all([
      dataClient.from('products').select('*').order('created_at', { ascending: false }),
      dataClient.from('categories').select('*').order('sort_order'),
      dataClient.from('brands').select('*').order('name'),
    ]);
    setProducts(prodRes.data || []);
    setCategories(catRes.data || []);
    setBrands(brandRes.data || []);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const { error } = await dataClient.from('products').delete().eq('id', id);
    if (error) { toast.error('Failed to delete product'); }
    else { toast.success('Product deleted'); load(); }
  };

  const handleSave = async (data: Partial<Product>) => {
    if (editingProduct) {
      const { error } = await dataClient.from('products').update(data).eq('id', editingProduct.id);
      if (error) { toast.error('Failed to update product'); }
      else { toast.success('Product updated'); setIsDialogOpen(false); load(); }
    } else {
      const { error } = await dataClient.from('products').insert(data);
      if (error) { toast.error('Failed to create product'); }
      else { toast.success('Product created'); setIsDialogOpen(false); load(); }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Products</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingProduct(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editingProduct}
              categories={categories}
              brands={brands}
              onSave={handleSave}
              onCancel={() => { setIsDialogOpen(false); setEditingProduct(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="animate-pulse text-muted-foreground">Loading products...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.primary_image && (
                        <img src={product.primary_image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <span className="text-sm font-medium text-navy line-clamp-1">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="text-sm font-medium text-navy">{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      'text-xs font-bold px-2 py-1 rounded-full',
                      product.stock <= 0 ? 'bg-red-100 text-red-700' :
                      product.stock <= product.low_stock_threshold ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    )}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      product.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    )}>
                      {product.is_published ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function ProductForm({ product, categories, brands, onSave, onCancel }: {
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  onSave: (data: Partial<Product>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [description, setDescription] = useState(product?.description || '');
  const [shortDescription, setShortDescription] = useState(product?.short_description || '');
  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [brandId, setBrandId] = useState(product?.brand_id || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price?.toString() || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [primaryImage, setPrimaryImage] = useState(product?.primary_image || '');
  const [images, setImages] = useState((product?.images || []).join(', '));
  const [isPublished, setIsPublished] = useState(product?.is_published ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isBestseller, setIsBestseller] = useState(product?.is_bestseller ?? false);
  const [isNewArrival, setIsNewArrival] = useState(product?.is_new_arrival ?? false);
  const [tags, setTags] = useState((product?.tags || []).join(', '));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<Product> = {
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      short_description: shortDescription,
      category_id: categoryId || null,
      brand_id: brandId || null,
      sku,
      price: parseFloat(price) || 0,
      compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
      stock: parseInt(stock) || 0,
      primary_image: primaryImage,
      images: images.split(',').map((s) => s.trim()).filter(Boolean),
      is_published: isPublished,
      is_featured: isFeatured,
      is_bestseller: isBestseller,
      is_new_arrival: isNewArrival,
      tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      specifications: product?.specifications || {},
      features: product?.features || [],
      whats_included: product?.whats_included || [],
      compatibility: product?.compatibility || [],
    };
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1" placeholder="auto-generated if empty" />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" rows={3} />
      </div>
      <div>
        <Label htmlFor="shortDescription">Short Description</Label>
        <Input id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Brand</Label>
          <Select value={brandId} onValueChange={setBrandId}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select brand" /></SelectTrigger>
            <SelectContent>
              {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="price">Price (Rs)</Label>
          <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="compareAtPrice">Compare at Price</Label>
          <Input id="compareAtPrice" type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="primaryImage">Primary Image URL</Label>
        <Input id="primaryImage" value={primaryImage} onChange={(e) => setPrimaryImage(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="images">Image URLs (comma separated)</Label>
        <Input id="images" value={images} onChange={(e) => setImages(e.target.value)} className="mt-1" />
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2"><Switch checked={isPublished} onCheckedChange={setIsPublished} /> <span className="text-sm">Published</span></label>
        <label className="flex items-center gap-2"><Switch checked={isFeatured} onCheckedChange={setIsFeatured} /> <span className="text-sm">Featured</span></label>
        <label className="flex items-center gap-2"><Switch checked={isBestseller} onCheckedChange={setIsBestseller} /> <span className="text-sm">Bestseller</span></label>
        <label className="flex items-center gap-2"><Switch checked={isNewArrival} onCheckedChange={setIsNewArrival} /> <span className="text-sm">New Arrival</span></label>
      </div>
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{product ? 'Update' : 'Create'} Product</Button>
      </div>
    </form>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, X, Search, PackageSearch, Columns3, Columns4 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];

const PAGE_SIZE = 24;

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
];

function getPaginationItems(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 25000]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [columns, setColumns] = useState<3 | 4>(4);

  useEffect(() => {
    const loadFilters = async () => {
      const [catRes, brandRes] = await Promise.all([
        dataClient.from('categories').select('*').order('sort_order'),
        dataClient.from('brands').select('*').order('name'),
      ]);
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    let query = dataClient
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_published', true);

    if (searchQuery.trim()) {
      query = query.search(searchQuery.trim());
    }

    if (selectedCategory) {
      const { data: cat } = await dataClient
        .from('categories')
        .select('id')
        .eq('slug', selectedCategory)
        .maybeSingle();
      if (cat) query = query.eq('category_id', cat.id);
    }

    if (selectedBrands.length > 0) {
      const { data: brandData } = await dataClient
        .from('brands')
        .select('id')
        .in('slug', selectedBrands);
      if (brandData && brandData.length > 0) {
        query = query.in('brand_id', (brandData as { id: string }[]).map((b) => b.id));
      }
    }

    query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);

    if (minRating > 0) {
      query = query.gte('rating', minRating);
    }

    if (inStockOnly) {
      query = query.gt('stock', 0);
    }

    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'popularity':
        query = query.order('review_count', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      default:
        query = query.order('is_featured', { ascending: false });
    }

    query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    const { data, count } = await query;
    setProducts(data || []);
    setTotalProducts(count || 0);
    setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
    setIsLoading(false);
  }, [searchQuery, selectedCategory, selectedBrands, priceRange, minRating, inStockOnly, sortBy, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const toggleBrand = (brandSlug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandSlug)
        ? prev.filter((b) => b !== brandSlug)
        : [...prev, brandSlug]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrands([]);
    setPriceRange([0, 25000]);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('relevance');
    setPage(1);
  };

  const activeFilterCount = [
    searchQuery.trim() ? 1 : 0,
    selectedCategory ? 1 : 0,
    selectedBrands.length,
    priceRange[0] > 0 || priceRange[1] < 25000 ? 1 : 0,
    minRating > 0 ? 1 : 0,
    inStockOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-1.5 tracking-tight">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Shop'
              : 'All Products'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products by name, code or specifications..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-10 bg-white"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden bg-white"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        <div className="flex gap-6 items-start">
          {/* Filters Sidebar */}
          <aside className={cn(
            'w-64 shrink-0 space-y-6',
            showFilters ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto lg:relative lg:bg-transparent lg:p-0' : 'hidden lg:block'
          )}>
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-lg font-bold">Filters</h2>
            <button onClick={() => setShowFilters(false)}><X className="w-5 h-5" /></button>
          </div>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full justify-start text-primary">
              <X className="w-4 h-4 mr-2" />
              Clear all filters ({activeFilterCount})
            </Button>
          )}

          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-navy">Categories ({categories.length})</h3>
              {selectedCategory && (
                <button
                  onClick={() => { setSelectedCategory(''); setPage(1); }}
                  className="text-xs text-primary hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <Input
              type="text"
              placeholder="Search 51 categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="h-8 text-xs mb-2"
            />
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={cn(
                  'block w-full text-left text-sm px-2 py-1 rounded transition-colors',
                  !selectedCategory ? 'text-primary font-medium bg-blue-50' : 'text-muted-foreground hover:text-navy'
                )}
              >
                All Categories
              </button>
              {categories
                .filter((cat) => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                    className={cn(
                      'block w-full text-left text-sm px-2 py-1 rounded transition-colors truncate',
                      selectedCategory === cat.slug ? 'text-primary font-medium bg-blue-50' : 'text-muted-foreground hover:text-navy'
                    )}
                    title={cat.name}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-sm font-semibold text-navy mb-3">Brands</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map((brand) => (
                <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedBrands.includes(brand.slug)}
                    onCheckedChange={() => toggleBrand(brand.slug)}
                  />
                  <span className="text-sm text-muted-foreground hover:text-navy">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-semibold text-navy mb-3">Price Range</h3>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => { setPriceRange([Number(e.target.value), priceRange[1]]); setPage(1); }}
                className="h-9 text-sm"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => { setPriceRange([priceRange[0], Number(e.target.value)]); setPage(1); }}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-sm font-semibold text-navy mb-3">Minimum Rating</h3>
            <div className="space-y-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={minRating === rating}
                    onCheckedChange={() => { setMinRating(rating); setPage(1); }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {rating === 0 ? 'All ratings' : `${rating}+ stars`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-sm font-semibold text-navy mb-3">Availability</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={inStockOnly}
                onCheckedChange={(checked) => { setInStockOnly(checked === true); setPage(1); }}
              />
              <span className="text-sm text-muted-foreground">In stock only</span>
            </label>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Showing <span className="font-semibold text-navy">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalProducts)}</span> of <span className="font-semibold text-navy">{totalProducts}</span>
            </p>
            <div className="flex items-center gap-2">
              {/* Column toggle */}
              <div className="hidden sm:inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setColumns(3)}
                  aria-label="3 columns per row"
                  title="3 columns per row"
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    columns === 3 ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-navy hover:bg-gray-50"
                  )}
                >
                  <Columns3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setColumns(4)}
                  aria-label="4 columns per row"
                  title="4 columns per row"
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    columns === 4 ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-navy hover:bg-gray-50"
                  )}
                >
                  <Columns4 className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
              <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
                <SelectTrigger className="w-[170px] h-9 text-xs sm:text-sm bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className={cn(
              "grid gap-3.5 sm:gap-4",
              columns === 4
                ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
                : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
            )}>
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <PackageSearch className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-navy mb-2">No products found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </div>
          ) : (
            <>
              <div className={cn(
                "grid gap-3.5 sm:gap-4",
                columns === 4
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
                  : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3"
              )}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page === 1}
                    className="text-xs sm:text-sm h-9 px-3 bg-white"
                  >
                    Previous
                  </Button>
                  {getPaginationItems(page, totalPages).map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`dots-${idx}`} className="w-8 text-center text-xs text-muted-foreground font-bold select-none">
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(item);
                    return (
                      <button
                        key={pageNum}
                        onClick={() => { setPage(pageNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={cn(
                          'w-8 h-8 sm:w-9 sm:h-9 rounded-md text-xs sm:text-sm font-semibold transition-colors',
                          page === pageNum
                            ? 'bg-primary text-white shadow-sm'
                            : 'border border-gray-200 bg-white text-navy hover:bg-gray-50'
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={page === totalPages}
                    className="text-xs sm:text-sm h-9 px-3 bg-white"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}

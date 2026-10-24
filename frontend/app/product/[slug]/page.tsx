'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useAuth } from '@/lib/auth-context';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Heart, ShoppingCart, Minus, Plus, Check, Truck, RotateCcw, Shield, ChevronRight } from 'lucide-react';
import { formatPrice, calculateDiscountPercentage, getStockStatus } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

type Product = Database['public']['Tables']['products']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const { data } = await dataClient
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (data) {
        setProduct(data);
        // Load related products
        if (data.category_id) {
          const { data: related } = await dataClient
            .from('products')
            .select('*')
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .eq('is_published', true)
            .limit(5);
          setRelatedProducts(related || []);
        }
        // Load reviews
        const { data: reviewData } = await dataClient
          .from('reviews')
          .select('*')
          .eq('product_id', data.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
        setReviews(reviewData || []);
      }
      setIsLoading(false);
    };
    load();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy mb-4">Product not found</h1>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/shop"><Button>Back to Shop</Button></Link>
      </div>
    );
  }

  const discount = product.compare_at_price
    ? calculateDiscountPercentage(product.compare_at_price, product.price)
    : 0;
  const stockStatus = getStockStatus(product.stock, product.low_stock_threshold);
  const isWishlisted = has(product.id);
  const images = product.images?.length > 0 ? product.images : [product.primary_image].filter(Boolean) as string[];

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    await addItem(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = async () => {
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    await addItem(product, quantity);
    router.push('/checkout');
  };

  const handleWishlist = async () => {
    await toggle(product.id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-navy">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/shop" className="hover:text-navy">Shop</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-navy font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-4">
            {images[selectedImage] && (
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                    i === selectedImage ? 'border-primary' : 'border-gray-200'
                  )}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-4 h-4',
                    star <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating} ({product.review_count} reviews)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-2">{product.name}</h1>
          <p className="text-sm text-muted-foreground mb-4">SKU: {product.sku}</p>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-navy">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.compare_at_price)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-md">
                  Save {discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            <span className={cn('w-2 h-2 rounded-full', stockStatus.status === 'in-stock' ? 'bg-green-500' : stockStatus.status === 'low-stock' ? 'bg-amber-500' : 'bg-red-500')} />
            <span className={cn('text-sm font-medium', stockStatus.color)}>{stockStatus.label}</span>
          </div>

          {/* Short description */}
          <p className="text-sm text-muted-foreground mb-6">{product.short_description}</p>

          {/* Quantity & Actions */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 hover:bg-gray-100 rounded-l-lg"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-base font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="p-2.5 hover:bg-gray-100 rounded-r-lg"
                disabled={quantity >= product.stock}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Button onClick={handleAddToCart} size="lg" className="flex-1" disabled={product.stock <= 0}>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
            <Button
              onClick={handleWishlist}
              variant="outline"
              size="lg"
              className="px-3"
            >
              <Heart className={cn('w-5 h-5', isWishlisted ? 'fill-red-500 text-red-500' : '')} />
            </Button>
          </div>
          <Button onClick={handleBuyNow} size="lg" className="w-full mb-6" disabled={product.stock <= 0}>
            Buy Now
          </Button>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-navy mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t">
            <div className="flex flex-col items-center text-center gap-1">
              <Truck className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">Free shipping over Rs 999</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <RotateCcw className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">7-day returns</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground">Secure checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
          <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Description</TabsTrigger>
          <TabsTrigger value="specifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Specifications</TabsTrigger>
          <TabsTrigger value="features" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Features</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="pt-6">
          <div className="prose max-w-none">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
            {Object.entries(product.specifications || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-navy">{key}</span>
                <span className="text-sm text-muted-foreground text-right">{value}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="pt-6">
          <div className="space-y-6 max-w-3xl">
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-navy mb-3">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.whats_included && product.whats_included.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-navy mb-3">What's Included</h3>
                <ul className="space-y-2">
                  {product.whats_included.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.compatibility && product.compatibility.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-navy mb-3">Compatibility</h3>
                <div className="flex flex-wrap gap-2">
                  {product.compatibility.map((c, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-primary px-3 py-1 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="pt-6">
          <div className="max-w-3xl">
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={cn('w-4 h-4', s <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200')} />
                        ))}
                      </div>
                      {review.is_verified_purchase && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    {review.title && <h4 className="text-sm font-semibold text-navy mb-1">{review.title}</h4>}
                    {review.body && <p className="text-sm text-muted-foreground">{review.body}</p>}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-navy mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

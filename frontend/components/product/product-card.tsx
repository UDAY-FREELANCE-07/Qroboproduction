'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import type { Database } from '@/lib/data-client';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { formatPrice, calculateDiscountPercentage, getStockStatus } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const isWishlisted = has(product.id);
  const discount = product.compare_at_price
    ? calculateDiscountPercentage(product.compare_at_price, product.price)
    : 0;
  const stockStatus = getStockStatus(product.stock, product.low_stock_threshold);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    await addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggle(product.id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {product.primary_image && (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              -{discount}%
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              NEW
            </span>
          )}
          {product.is_bestseller && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
              BESTSELLER
            </span>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:shadow-md transition-all"
        >
          <Heart
            className={cn('w-4 h-4', isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600')}
          />
        </button>
        {/* Quick actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-2">
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="flex-1"
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            {/* Already inside the card's product <Link>; a nested <a> is invalid HTML (hydration error). */}
            <Button size="sm" variant="secondary" className="px-2" aria-label={`View ${product.name}`}>
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center gap-1 mb-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-3 h-3',
                  star <= Math.round(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.review_count})</span>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-navy line-clamp-2 mb-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground mb-2">{product.short_description}</p>

        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-navy">{formatPrice(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>

        <p className={cn('text-xs mt-1', stockStatus.color)}>{stockStatus.label}</p>
      </div>
    </div>
  );
}

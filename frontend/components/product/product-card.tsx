'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Eye, Cpu, ArrowRight } from 'lucide-react';
import type { Database } from '@/lib/data-client';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { calculateDiscountPercentage } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const isWishlisted = has(product.id);
  const [imageFailed, setImageFailed] = useState(false);

  const discount = product.compare_at_price
    ? calculateDiscountPercentage(product.compare_at_price, product.price)
    : 0;

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

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200/90 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:border-sky-400 w-full h-full">
      {/* Top Image Frame - 1:1 Square Frame matching reference */}
      <div className="relative aspect-square w-full bg-[#f8f9fa] rounded-t-2xl flex items-center justify-center p-3.5 sm:p-4 overflow-hidden select-none">
        <Link href={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
          {product.primary_image && !imageFailed ? (
            <img
              src={product.primary_image}
              alt={product.name}
              onError={() => setImageFailed(true)}
              className={cn(
                "max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105",
                isOutOfStock && "opacity-70 grayscale-[25%]"
              )}
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-1.5 p-4 text-center">
              <Cpu className="h-10 w-10 text-gray-300 stroke-[1.5]" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Component
              </span>
            </div>
          )}
        </Link>

        {/* Top-Left Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {discount > 0 && !isOutOfStock && (
            <span className="bg-[#FF4D00] text-white text-[11px] font-bold h-7 w-7 rounded-full flex items-center justify-center shadow-sm">
              -{discount}%
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Sold out
            </span>
          )}
          {product.is_new_arrival && !isOutOfStock && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
              NEW
            </span>
          )}
        </div>

        {/* Top-Right Action Badges (Wishlist & Quick View) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleWishlist}
            className="w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm"
            aria-label="Wishlist"
          >
            <Heart
              className={cn('w-4 h-4', isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400')}
            />
          </button>
          <Link
            href={`/product/${product.slug}`}
            className="w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-400 hover:text-primary transition-colors shadow-sm"
            aria-label={`View ${product.name}`}
          >
            <Eye className="w-3.5 h-3.5 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Bottom Information */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <Link href={`/product/${product.slug}`}>
            <h3
              className="text-xs sm:text-sm font-semibold text-[#1E293B] line-clamp-2 min-h-[36px] hover:text-primary transition-colors leading-snug"
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>

          {/* Pricing Row */}
          <div className="flex items-center gap-1.5 mt-2">
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-gray-400 line-through">
                Rs. {product.compare_at_price.toFixed(2)}
              </span>
            )}
            <span className="text-sm sm:text-base font-bold text-red-600">
              Rs. {product.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Bottom Button (matches Image 1 reference!) */}
        {!isOutOfStock ? (
          <button
            onClick={handleAddToCart}
            className="w-full mt-3 rounded-full border border-gray-200 bg-white hover:border-primary hover:bg-blue-50/50 py-1.5 px-4 text-xs font-semibold text-navy flex items-center justify-between transition-all group/btn"
          >
            <span>Add To Cart</span>
            <ShoppingCart className="h-3.5 w-3.5 text-gray-700 group-hover/btn:text-primary transition-colors" />
          </button>
        ) : (
          <Link
            href={`/product/${product.slug}`}
            className="w-full mt-3 rounded-full border border-gray-200 bg-gray-50/70 hover:border-gray-400 hover:bg-gray-100 py-1.5 px-4 text-xs font-semibold text-gray-600 flex items-center justify-between transition-all"
          >
            <span>Read More</span>
            <ArrowRight className="h-3.5 w-3.5 text-gray-500" />
          </Link>
        )}
      </div>
    </div>
  );
}

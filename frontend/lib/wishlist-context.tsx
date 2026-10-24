'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { dataClient } from '@/lib/data-client';
import { useAuth } from '@/lib/auth-context';

interface WishlistContextType {
  wishlistIds: string[];
  isLoading: boolean;
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const GUEST_WISHLIST_KEY = 'qrobo_guest_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGuestWishlist = (): string[] => {
    try {
      const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        const { data } = await dataClient
          .from('wishlists')
          .select('product_id')
          .eq('user_id', user.id);
        setWishlistIds((data as { product_id: string }[] | null)?.map((w) => w.product_id) ?? []);
      } else {
        setWishlistIds(loadGuestWishlist());
      }
    } catch {
      setWishlistIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (productId: string) => {
    const isWishlisted = wishlistIds.includes(productId);

    if (user) {
      if (isWishlisted) {
        await dataClient
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } else {
        await dataClient
          .from('wishlists')
          .insert({ user_id: user.id, product_id: productId });
      }
    } else {
      const guest = loadGuestWishlist();
      if (isWishlisted) {
        const filtered = guest.filter((id) => id !== productId);
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(filtered));
      } else {
        guest.push(productId);
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(guest));
      }
    }

    setWishlistIds((prev) =>
      isWishlisted ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const has = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isLoading, toggle, has, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}

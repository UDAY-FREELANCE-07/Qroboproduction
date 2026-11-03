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
        // Merge any guest wishlist items saved before signing in
        const guest = loadGuestWishlist();
        if (guest.length > 0) {
          for (const pid of guest) {
            try {
              await dataClient.from('wishlists').insert({ user_id: user.id, product_id: pid });
            } catch {}
          }
          try {
            localStorage.removeItem(GUEST_WISHLIST_KEY);
          } catch {}
        }

        const { data } = await dataClient
          .from('wishlists')
          .select('product_id')
          .eq('user_id', user.id);
        const serverIds = (data as { product_id: string }[] | null)?.map((w) => w.product_id) ?? [];

        if (serverIds.length > 0) {
          setWishlistIds(serverIds);
          try {
            localStorage.setItem(`qrobo_user_wishlist_${user.id}`, JSON.stringify(serverIds));
          } catch {}
        } else {
          // Fallback to local storage cache if server returned empty (e.g. mock session reload)
          let cachedIds: string[] = [];
          try {
            const raw = localStorage.getItem(`qrobo_user_wishlist_${user.id}`);
            if (raw) cachedIds = JSON.parse(raw);
          } catch {}

          if (cachedIds.length > 0) {
            setWishlistIds(cachedIds);
            for (const pid of cachedIds) {
              try {
                await dataClient.from('wishlists').insert({ user_id: user.id, product_id: pid });
              } catch {}
            }
          } else {
            setWishlistIds([]);
          }
        }
      } else {
        setWishlistIds(loadGuestWishlist());
      }
    } catch {
      setWishlistIds(loadGuestWishlist());
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (productId: string) => {
    const isWishlisted = wishlistIds.includes(productId);
    const nextWishlist = isWishlisted
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];

    // Optimistically update React state immediately
    setWishlistIds(nextWishlist);

    if (user) {
      try {
        localStorage.setItem(`qrobo_user_wishlist_${user.id}`, JSON.stringify(nextWishlist));
      } catch {}

      try {
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
      } catch (err) {
        console.error('Error toggling wishlist:', err);
      }
    } else {
      try {
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(nextWishlist));
      } catch {}
    }
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

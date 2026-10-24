'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';

type Product = Database['public']['Tables']['products']['Row'];

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  total: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'qrobo_guest_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data: { session } } = await dataClient.auth.getSession();
      if (mounted) setUser(session?.user ? { id: session.user.id } : null);
    };
    initAuth();

    const { data: { subscription } } = dataClient.auth.onAuthStateChange((_event, session) => {
      (async () => {
        const newUser = session?.user ? { id: session.user.id } : null;
        if (mounted) {
          const oldUser = user;
          setUser(newUser);
          if (newUser && !oldUser) {
            await mergeGuestCart(newUser.id);
          }
          await loadCart(newUser);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadGuestCart = (): CartItem[] => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveGuestCart = (cart: CartItem[]) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  };

  const loadCart = async (currentUser: { id: string } | null) => {
    setIsLoading(true);
    try {
      if (currentUser) {
        const { data: cart } = await dataClient
          .from('carts')
          .select('id')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (!cart) {
          const { data: newCart } = await dataClient
            .from('carts')
            .insert({ user_id: currentUser.id })
            .select('id')
            .single();
          if (newCart) {
            setItems([]);
          }
          return;
        }

        const { data: cartItems } = await dataClient
          .from('cart_items')
          .select('quantity, product:products(*)')
          .eq('cart_id', cart.id);

        if (cartItems) {
          const validItems = (cartItems as any[])
            .filter((item) => item.product !== null)
            .map((item) => ({ product: item.product as Product, quantity: item.quantity as number }));
          setItems(validItems);
        }
      } else {
        setItems(loadGuestCart());
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mergeGuestCart = async (userId: string) => {
    const guestCart = loadGuestCart();
    if (guestCart.length === 0) return;

    const { data: cart } = await dataClient
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let cartId = cart?.id;
    if (!cartId) {
      const { data: newCart } = await dataClient
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();
      cartId = newCart?.id;
    }

    if (!cartId) return;

    for (const item of guestCart) {
      const { data: existing } = await dataClient
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', item.product.id)
        .maybeSingle();

      if (existing) {
        await dataClient
          .from('cart_items')
          .update({ quantity: existing.quantity + item.quantity })
          .eq('id', existing.id);
      } else {
        await dataClient
          .from('cart_items')
          .insert({ cart_id: cartId, product_id: item.product.id, quantity: item.quantity });
      }
    }

    localStorage.removeItem(GUEST_CART_KEY);
  };

  useEffect(() => {
    loadCart(user);
  }, []);

  const addItem = async (product: Product, quantity: number = 1) => {
    const existingItem = items.find((i) => i.product.id === product.id);
    const newQuantity = (existingItem?.quantity || 0) + quantity;

    if (product.stock > 0 && newQuantity > product.stock) {
      return;
    }

    if (user) {
      const { data: cart } = await dataClient
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cart) {
        const { data: existing } = await dataClient
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', cart.id)
          .eq('product_id', product.id)
          .maybeSingle();

        if (existing) {
          await dataClient
            .from('cart_items')
            .update({ quantity: existing.quantity + quantity })
            .eq('id', existing.id);
        } else {
          await dataClient
            .from('cart_items')
            .insert({ cart_id: cart.id, product_id: product.id, quantity });
        }
      }
    } else {
      const guestCart = loadGuestCart();
      const existing = guestCart.find((i) => i.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        guestCart.push({ product, quantity });
      }
      saveGuestCart(guestCart);
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsOpen(true);
  };

  const removeItem = async (productId: string) => {
    if (user) {
      const { data: cart } = await dataClient
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cart) {
        await dataClient
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.id)
          .eq('product_id', productId);
      }
    } else {
      const guestCart = loadGuestCart().filter((i) => i.product.id !== productId);
      saveGuestCart(guestCart);
    }
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    const product = items.find((i) => i.product.id === productId)?.product;
    if (product && quantity > product.stock) return;

    if (user) {
      const { data: cart } = await dataClient
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cart) {
        await dataClient
          .from('cart_items')
          .update({ quantity })
          .eq('cart_id', cart.id)
          .eq('product_id', productId);
      }
    } else {
      const guestCart = loadGuestCart();
      const item = guestCart.find((i) => i.product.id === productId);
      if (item) {
        item.quantity = quantity;
        saveGuestCart(guestCart);
      }
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = async () => {
    if (user) {
      const { data: cart } = await dataClient
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cart) {
        await dataClient.from('cart_items').delete().eq('cart_id', cart.id);
      }
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        total: subtotal,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

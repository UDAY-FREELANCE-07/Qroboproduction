'use client';

import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatPrice } from '@/lib/format';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-navy">
            <ShoppingBag className="w-5 h-5" />
            Shopping Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground text-center">Your cart is empty</p>
            <p className="text-sm text-muted-foreground text-center">Add some products to get started</p>
            <Link href="/shop" onClick={() => setIsOpen(false)}>
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 pb-4 border-b last:border-0">
                    {item.product.primary_image && (
                      <Link href={`/product/${item.product.slug}`} onClick={() => setIsOpen(false)}>
                        <img
                          src={item.product.primary_image}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                        />
                      </Link>
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-medium text-navy hover:text-primary line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-100 rounded-l-md"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-100 rounded-r-md"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-navy">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-navy">Subtotal</span>
                <span className="text-lg font-bold text-navy">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/checkout" onClick={() => setIsOpen(false)}>
                  <Button className="w-full" size="lg">
                    Checkout
                  </Button>
                </Link>
                <Link href="/cart" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

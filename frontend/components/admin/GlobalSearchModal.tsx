'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ShoppingCart, User, ArrowRight, ExternalLink, Command } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { adminService } from '@/lib/admin/admin-service';
import { formatPrice } from '@/lib/format';
import { StatusBadge } from './StatusBadge';

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    products: any[];
    orders: any[];
    customers: any[];
  }>({ products: [], orders: [], customers: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], orders: [], customers: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await adminService.globalSearch(query);
      setResults(res);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleNavigate = (url: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(url);
  };

  const quickNav = [
    { label: 'Add New Product', href: '/admin/products/new', icon: Package },
    { label: 'Manage Inventory', href: '/admin/inventory', icon: Package },
    { label: 'Orders List', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Analytics & Revenue', href: '/admin/analytics', icon: Command },
    { label: 'Store Settings', href: '/admin/settings', icon: Command },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        <div className="flex items-center border-b border-slate-200 px-4 py-3 bg-slate-50/50">
          <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
          <Input
            placeholder="Search products, orders, customers, SKUs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 text-base bg-transparent p-0 h-9"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-200/60 px-2 py-0.5 text-xs text-slate-500 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {!query.trim() ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">
                Quick Shortcuts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigate(item.href)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 text-left transition-colors"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-200/70 text-slate-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 ml-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {isSearching && (
                <div className="py-6 text-center text-sm text-slate-500">Searching...</div>
              )}

              {!isSearching &&
                results.products.length === 0 &&
                results.orders.length === 0 &&
                results.customers.length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-500">
                    No matching records found for "{query}".
                  </div>
                )}

              {results.products.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    Products ({results.products.length})
                  </p>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleNavigate(`/admin/products/${p.id}`)}
                        className="w-full flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-100 text-left transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={p.primaryImage}
                            alt=""
                            className="h-10 w-10 rounded-md object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                            <p className="text-xs text-slate-500 font-mono">SKU: {p.sku}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-sm font-bold text-slate-900">{formatPrice(p.price)}</p>
                          <span className="text-xs text-slate-400">Stock: {p.stock}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.orders.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    Orders ({results.orders.length})
                  </p>
                  <div className="space-y-1">
                    {results.orders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => handleNavigate(`/admin/orders/${o.id}`)}
                        className="w-full flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-100 text-left transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold font-mono text-primary">
                              {o.orderNumber}
                            </span>
                            <StatusBadge status={o.orderStatus} size="sm" />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{o.customerName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-900">
                            {formatPrice(o.grandTotal)}
                          </p>
                          <span className="text-xs text-slate-400">{o.paymentMethod}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.customers.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">
                    Customers ({results.customers.length})
                  </p>
                  <div className="space-y-1">
                    {results.customers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleNavigate(`/admin/customers/${c.id}`)}
                        className="w-full flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-100 text-left transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                            <p className="text-xs text-slate-500 truncate">{c.email}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <span className="text-xs font-medium text-slate-600">
                            {c.totalOrders} orders
                          </span>
                          <p className="text-xs text-slate-400">{formatPrice(c.totalSpent)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: [] as { id: string; name: string; stock: number }[],
    pendingOrders: 0,
    recentOrders: [] as any[],
    topProducts: [] as any[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [ordersRes, productsRes, profilesRes, lowStockRes, pendingRes, recentRes, topRes] = await Promise.all([
        dataClient.from('orders').select('total, status').eq('payment_status', 'paid'),
        dataClient.from('products').select('id', { count: 'exact' }),
        dataClient.from('profiles').select('id', { count: 'exact' }),
        dataClient.from('products').select('id, name, stock').lt('stock', 10).limit(5),
        dataClient.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
        dataClient.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(5),
        dataClient.from('products').select('name, review_count, rating, primary_image').order('review_count', { ascending: false }).limit(5),
      ]);

      const revenue = ((ordersRes.data || []) as { total: number | null }[]).reduce((sum, o) => sum + (o.total || 0), 0);
      setStats({
        totalRevenue: revenue,
        totalOrders: ordersRes.data?.length || 0,
        totalCustomers: profilesRes.count || 0,
        totalProducts: productsRes.count || 0,
        lowStockProducts: lowStockRes.data || [],
        pendingOrders: pendingRes.count || 0,
        recentOrders: recentRes.data || [],
        topProducts: topRes.data || [],
      });
      setIsLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'bg-amber-500' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-purple-500' },
  ];

  if (isLoading) {
    return <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Dashboard Overview</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white', card.color)}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-bold text-navy mt-1">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-navy">#{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-navy">{formatPrice(order.total)}</p>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    )}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Products
            </h2>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">All products well stocked</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <p className="text-sm font-medium text-navy">{product.name}</p>
                  <span className={cn(
                    'text-xs font-bold px-2 py-1 rounded-full',
                    product.stock <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top Selling Products
            </h2>
          </div>
          <div className="space-y-3">
            {stats.topProducts.map((product: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                {product.primary_image && (
                  <img src={product.primary_image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy line-clamp-1">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.review_count} reviews</p>
                </div>
                <span className="text-sm font-bold text-navy">{product.rating}/5</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-navy flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Pending Orders
            </h2>
          </div>
          <div className="text-center py-8">
            <p className="text-3xl font-bold text-navy">{stats.pendingOrders}</p>
            <p className="text-sm text-muted-foreground mt-1">orders awaiting processing</p>
            <Link href="/admin/orders" className="inline-block mt-4">
              <span className="text-sm text-primary hover:underline">View all orders</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

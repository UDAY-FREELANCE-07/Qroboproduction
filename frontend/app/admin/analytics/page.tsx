'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Percent,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/admin/KpiCard';
import { adminService } from '@/lib/admin/admin-service';
import { formatPrice } from '@/lib/format';

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'Today' | '7 Days' | '30 Days' | '90 Days' | '1 Year'>('30 Days');
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [a, p] = await Promise.all([
        adminService.getAnalytics(period),
        adminService.getProducts(),
      ]);
      setAnalytics(a || {});
      setProducts(Array.isArray(p) ? p.slice(0, 5) : []);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setAnalytics({});
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  if (!mounted || isLoading || !analytics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const summary = analytics?.summary || {
    totalRevenue: analytics?.revenue || 0,
    totalOrders: analytics?.orders || 0,
    averageOrderValue: analytics?.averageOrderValue || 0,
    conversionRate: 2.8,
    customerGrowthRate: 14.2,
    refundRate: 0.4,
  };
  const timeSeries = analytics?.timeSeries || [];
  const categoryDistribution = analytics?.categoryDistribution || [];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Store Analytics & Growth</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sales volume, gross margin performance, customer conversion metrics, and category trends.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1 bg-slate-50">
            {(['Today', '7 Days', '30 Days', '90 Days', '1 Year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  period === p
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="h-9 gap-1.5 text-xs text-slate-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 6 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          label="Total Revenue"
          value={formatPrice(summary.totalRevenue)}
          change={18.4}
          icon={DollarSign}
          iconColor="bg-emerald-600"
        />
        <KpiCard
          label="Orders Captured"
          value={summary.totalOrders}
          change={12.1}
          icon={ShoppingCart}
          iconColor="bg-blue-600"
        />
        <KpiCard
          label="Average Order Value"
          value={formatPrice(summary.averageOrderValue)}
          change={5.3}
          icon={TrendingUp}
          iconColor="bg-indigo-600"
        />
        <KpiCard
          label="Store Conversion"
          value={`${summary.conversionRate}%`}
          change={0.8}
          icon={Percent}
          iconColor="bg-amber-600"
        />
        <KpiCard
          label="Customer Growth"
          value={`+${summary.customerGrowthRate}%`}
          change={14.2}
          icon={Users}
          iconColor="bg-purple-600"
        />
        <KpiCard
          label="Return / Refund"
          value={`${summary.refundRate}%`}
          change={-0.2}
          icon={RotateCcw}
          iconColor="bg-slate-600"
        />
      </div>

      {/* Two Column Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Over Time (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue Trajectory</h3>
              <p className="text-xs text-slate-500">Gross electronic sales in INR over {period}</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="anaRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg text-xs">
                          <p className="font-bold text-slate-900 mb-1">{label}</p>
                          <p className="text-emerald-600 font-bold">
                            Revenue: {formatPrice(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#anaRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Distribution (1 col) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Category Share</h3>
            <p className="text-xs text-slate-500">Sales breakdown by department</p>
          </div>
          <div className="flex-1 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value}% share`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {categoryDistribution.map((item: any) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-bold text-slate-900 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Volume Bar Chart & Top Products Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Order Volume Velocity</h3>
            <p className="text-xs text-slate-500">Daily transaction counts processed</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs">
                          <p className="font-bold text-slate-900">{label}</p>
                          <p className="text-primary font-bold">{payload[0].value} Orders</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Highest Velocity SKUs */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">Highest Converting Hardware</h3>
              <p className="text-xs text-slate-500">Top revenue generating product lines</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-y border-slate-100">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.primaryImage || '/images/placeholder.png'}
                            alt=""
                            className="h-8 w-8 rounded object-cover border border-slate-200"
                          />
                          <span className="font-bold text-slate-900 line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{formatPrice(p.price)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{p.stock} units</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-500">
                        ★ {p.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { ProductCard } from '@/components/product/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Flame, Zap, AlertCircle, TrendingDown, Sparkles } from 'lucide-react';
import { formatPrice, timeLeftUntil } from '@/lib/format';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Deal = Database['public']['Tables']['deals']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

export default function DealsPage() {
  const [deals, setDeals] = useState<(Deal & { product: Product })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dataClient
      .from('deals')
      .select('*, product:products(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDeals((data as any) || []);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-6">
      {/* Hero banner with fire theme */}
      <div className="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-red-600 via-orange-600 to-amber-500">
        {/* Animated fire particles overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
          <div className="absolute top-4 left-1/2 w-1.5 h-1.5 bg-orange-200 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
          <div className="absolute top-8 left-3/4 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '1.8s', animationDelay: '0.6s' }} />
          <div className="absolute top-2 left-1/3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '2.2s', animationDelay: '0.1s' }} />
          <div className="absolute top-6 left-2/3 w-1.5 h-1.5 bg-orange-200 rounded-full animate-ping" style={{ animationDuration: '1.3s', animationDelay: '0.8s' }} />
        </div>

        {/* Sparkle decorations */}
        <Sparkles className="absolute top-6 right-10 w-6 h-6 text-yellow-200 animate-pulse" />
        <Sparkles className="absolute bottom-8 left-10 w-4 h-4 text-yellow-200 animate-pulse" style={{ animationDelay: '0.5s' }} />

        <div className="relative px-6 py-10 sm:px-10 sm:py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold mb-4 animate-pulse">
            <Flame className="w-4 h-4" />
            MEGA SALE LIVE NOW
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            DEALS ON FIRE
          </h1>
          <p className="text-white/90 text-lg font-medium mb-6">
            Hurry up! These deals are ending soon
          </p>

          {/* Big countdown */}
          {deals.length > 0 && (
            <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4">
              <Clock className="w-6 h-6 text-white" />
              <span className="text-white font-medium text-sm">Ends in</span>
              <BigCountdownTimer endsAt={deals[0].ends_at} />
            </div>
          )}
        </div>
      </div>

      {/* Sale poster banners */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/shop" className="group relative min-h-[170px] overflow-hidden rounded-2xl bg-gradient-to-br from-red-800 via-red-600 to-orange-500 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 campaign-grid opacity-20" />
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full border-[14px] border-yellow-300/20 campaign-float" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-200">Special offer</span>
                <h2 className="mt-2 text-4xl font-black leading-none text-white">55%<span className="text-2xl"> OFF</span></h2>
                <p className="mt-2 text-sm font-bold text-red-100">Selected maker essentials</p>
              </div>
              <Flame className="h-10 w-10 text-yellow-300 campaign-float" />
            </div>
            <span className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-yellow-200">Shop now <Zap className="h-3.5 w-3.5" /></span>
          </div>
        </Link>
        <Link href="/shop?sort=newest" className="group relative min-h-[170px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-600 to-cyan-500 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
          <div className="absolute inset-0 campaign-grid opacity-25" />
          <div className="absolute -bottom-10 -right-8 h-44 w-44 rounded-full border-[18px] border-cyan-100/15" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">Qrobo exclusive</span>
                <h2 className="mt-2 text-4xl font-black leading-none text-white">SUPER<br /><span className="text-yellow-300">DEAL</span></h2>
              </div>
              <Sparkles className="h-10 w-10 text-yellow-200 campaign-float" />
            </div>
            <span className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-white">Explore the drop <Zap className="h-3.5 w-3.5 text-yellow-300" /></span>
          </div>
        </Link>
      </div>

      {/* Hurry banner */}
      <div className="flex items-center justify-center gap-2 mb-8 bg-red-50 border-2 border-dashed border-red-300 rounded-xl py-3 px-4">
        <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
        <span className="text-red-700 font-bold text-sm sm:text-base">
          HURRY! Limited stock available at these prices. Don't miss out!
        </span>
        <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20">
          <Flame className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No active deals at the moment. Check back soon!</p>
        </div>
      ) : (
        <>
          {/* Savings summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <TrendingDown className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-navy">{deals.length}</p>
              <p className="text-xs text-muted-foreground">Active Deals</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <Flame className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-navy">
                {Math.max(...deals.map((d) => d.discount_percentage ?? 0))}%
              </p>
              <p className="text-xs text-muted-foreground">Biggest Discount</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-navy">
                {formatPrice(Math.max(...deals.map((d) => d.original_price - d.sale_price)))}
              </p>
              <p className="text-xs text-muted-foreground">Max Savings</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-navy">
                {Math.min(...deals.map((d) => Math.ceil((new Date(d.ends_at).getTime() - Date.now()) / 86400000)))}
              </p>
              <p className="text-xs text-muted-foreground">Days Left</p>
            </div>
          </div>

          {/* Deal products with fire badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {deals.map((deal) => (
              <div key={deal.id} className="space-y-2">
                <div className="relative">
                  <ProductCard product={deal.product} />
                  {/* Fire discount badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-50 animate-pulse" />
                      <div className="relative bg-gradient-to-br from-red-500 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        -{deal.discount_percentage ?? 0}%
                      </div>
                    </div>
                  </div>
                </div>
                {/* Per-deal countdown */}
                <div className="flex items-center justify-center gap-1.5 text-xs bg-red-50 rounded-lg py-1.5 px-2">
                  <Clock className="w-3 h-3 text-red-500" />
                  <DealCountdown endsAt={deal.ends_at} />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-3 bg-gradient-to-br from-navy to-gray-900 rounded-2xl px-8 py-6">
              <p className="text-white font-bold text-lg">More deals coming soon!</p>
              <p className="text-gray-400 text-sm">We add new deals every week. Subscribe to never miss out.</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BigCountdownTimer({ endsAt }: { endsAt: string }) {
  const [time, setTime] = useState(timeLeftUntil(endsAt));

  useEffect(() => {
    const timer = setInterval(() => setTime(timeLeftUntil(endsAt)), 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (time.expired) return <span className="text-white font-bold text-lg">Deal ended!</span>;

  return (
    <div className="flex items-center gap-2">
      <TimeBlock value={time.days} label="Days" />
      <span className="text-white/50 text-2xl font-bold">:</span>
      <TimeBlock value={time.hours} label="Hrs" />
      <span className="text-white/50 text-2xl font-bold">:</span>
      <TimeBlock value={time.minutes} label="Min" />
      <span className="text-white/50 text-2xl font-bold">:</span>
      <TimeBlock value={time.seconds} label="Sec" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center min-w-[48px]">
      <div className="text-2xl font-black tabular-nums text-white bg-white/10 rounded-lg px-2 py-1">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-[10px] text-white/60 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function DealCountdown({ endsAt }: { endsAt: string }) {
  const [time, setTime] = useState(timeLeftUntil(endsAt));

  useEffect(() => {
    const timer = setInterval(() => setTime(timeLeftUntil(endsAt)), 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (time.expired) return <span className="text-red-500 font-bold">Ended!</span>;
  return <span className="text-red-600 font-medium">{time.days}d {time.hours}h {time.minutes}m {time.seconds}s</span>;
}

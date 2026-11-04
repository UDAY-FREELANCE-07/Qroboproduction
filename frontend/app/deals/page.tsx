'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { ProductCard } from '@/components/product/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Flame, Zap, AlertCircle, TrendingDown, Sparkles, ArrowRight, ShieldCheck, Tag, Bot, Cpu } from 'lucide-react';
import { formatPrice, timeLeftUntil } from '@/lib/format';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Deal = Database['public']['Tables']['deals']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

export default function DealsPage() {
  const [deals, setDeals] = useState<(Deal & { product: Product })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'boards' | 'sensors' | 'robotics' | 'top'>('all');

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

  const filteredDeals = deals.filter((d) => {
    if (!d.product) return false;
    const name = (d.product.name || '').toLowerCase();
    if (selectedFilter === 'boards') {
      return name.includes('arduino') || name.includes('esp32') || name.includes('board') || name.includes('ic');
    }
    if (selectedFilter === 'sensors') {
      return name.includes('sensor') || name.includes('oled') || name.includes('display') || name.includes('sr04');
    }
    if (selectedFilter === 'robotics') {
      return name.includes('servo') || name.includes('robot') || name.includes('motor') || name.includes('chassis');
    }
    if (selectedFilter === 'top') {
      return (d.discount_percentage ?? 0) >= 20;
    }
    return true;
  });

  const featuredDeal = deals.find((d) => (d.discount_percentage ?? 0) >= 25) || deals[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner: Modern Qrobo Tech Blue & Sapphire Split Layout */}
      <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-blue-700 via-indigo-700 to-navy text-white shadow-lg border border-blue-600/30">
        {/* Ambient background glows & tech grid */}
        <div className="absolute inset-0 campaign-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 sm:p-8 lg:p-10">
          {/* Left Column: Heading, Subtitle & Countdown */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-cyan-200 border border-white/20 mb-3 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              MEGA SALE LIVE NOW
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              FLASH DEALS &<br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-200 bg-clip-text text-transparent">
                SPECIAL OFFERS
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 font-medium mt-2 max-w-xl leading-relaxed">
              Limited-time discounts on genuine microcontrollers, sensors, motors, and robotics essentials.
            </p>

            {/* Countdown timer */}
            {deals.length > 0 && (
              <div className="mt-5 inline-flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 sm:px-5 py-3 shadow-inner">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
                  <Clock className="w-4 h-4 text-cyan-300" />
                  <span>Sale ends in:</span>
                </div>
                <BigCountdownTimer endsAt={deals[0].ends_at} />
              </div>
            )}
          </div>

          {/* Right Column: Featured Deal Spotlight Card (Desktop) */}
          {featuredDeal && featuredDeal.product && (
            <div className="lg:col-span-5 xl:col-span-4 hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/25 p-4 shadow-xl hover:border-cyan-300/50 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-navy px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> DEAL OF THE DAY
                  </span>
                  <span className="text-xs font-black text-white bg-red-600 px-2.5 py-0.5 rounded-full shadow-sm">
                    -{featuredDeal.discount_percentage ?? 0}%
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-20 h-20 rounded-xl bg-white p-2 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    {featuredDeal.product.primary_image ? (
                      <img
                        src={featuredDeal.product.primary_image}
                        alt={featuredDeal.product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Cpu className="w-8 h-8 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-snug" title={featuredDeal.product.name}>
                      {featuredDeal.product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-base font-black text-amber-300">
                        Rs. {featuredDeal.sale_price.toFixed(2)}
                      </span>
                      <span className="text-xs text-white/60 line-through">
                        Rs. {featuredDeal.original_price.toFixed(2)}
                      </span>
                    </div>
                    <Link
                      href={`/product/${featuredDeal.product.slug}`}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-200 hover:text-white transition-colors"
                    >
                      View deal <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sale Poster Banners with Real Hardware Photos & Decent Vibes */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Card 1: Maker Essentials (White & Blue Glass) */}
        <Link
          href="/shop"
          className="group relative min-h-[170px] overflow-hidden rounded-2xl bg-gradient-to-br from-white via-sky-50/60 to-blue-50/80 p-5 sm:p-6 border border-blue-200/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl flex flex-col justify-between"
        >
          <div className="absolute inset-0 campaign-grid-blue opacity-30 pointer-events-none" />

          {/* Angled Hardware Photo */}
          <div className="absolute -right-3 -bottom-3 w-36 sm:w-40 h-32 sm:h-36 rounded-2xl overflow-hidden shadow-lg border-2 border-white/90 transform rotate-[-4deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-500 select-none">
            <img
              src="/images/products/development-boards-and-shields/arduino-uno-r3.png"
              alt="Maker Essentials"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
              <Zap className="w-3 h-3 text-amber-300" /> Special Offer
            </span>
            <h3 className="mt-2 text-3xl sm:text-4xl font-black text-navy leading-none">
              55% <span className="text-xl text-blue-600 font-bold">OFF</span>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground font-semibold max-w-[170px]">
              Selected maker essentials & ICs
            </p>
          </div>

          <span className="relative z-10 mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-800 transition-colors">
            Shop maker deals <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        {/* Card 2: Robotics & Hardware Exclusives (Deep Blue) */}
        <Link
          href="/shop?category=robot-chassis-and-platform-kits"
          className="group relative min-h-[170px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-5 sm:p-6 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
        >
          <div className="absolute inset-0 campaign-grid opacity-20 pointer-events-none" />

          {/* Angled Hardware Photo */}
          <div className="absolute -right-3 -bottom-3 w-36 sm:w-40 h-32 sm:h-36 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 transform rotate-[4deg] group-hover:rotate-0 group-hover:scale-105 transition-all duration-500 select-none">
            <img
              src="/images/products/robot-chassis-and-platform-kits/2wd-robot-car-chassis-kit.png"
              alt="Robotics Exclusives"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-200 border border-white/20 shadow-sm">
              <Bot className="w-3 h-3" /> Qrobo Exclusive
            </span>
            <h3 className="mt-2 text-3xl sm:text-4xl font-black text-white leading-none">
              SUPER <span className="text-cyan-300">DEALS</span>
            </h3>
            <p className="mt-1 text-xs text-blue-100 font-semibold max-w-[170px]">
              Robotics kits, smart chassis & motors
            </p>
          </div>

          <span className="relative z-10 mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
            Explore robotics drops <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      </div>

      {/* Stock Notice & Free Shipping Ribbon */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 border border-blue-200/80 rounded-xl py-3 px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-2.5 text-navy">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          </div>
          <span className="text-xs sm:text-sm font-semibold">
            Limited promotional stock available at these prices. Prices valid until timer runs out!
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-primary shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>100% Genuine · Free Shipping on orders &gt; Rs 999</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8">
          <Flame className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-navy mb-1">No active deals found</h3>
          <p className="text-sm text-muted-foreground mb-4">Check back soon for new flash sales and discounts.</p>
          <Link href="/shop" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-full">
            Browse All Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <>
          {/* Savings Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200/90 p-3.5 text-center shadow-sm hover:border-primary/40 transition-all">
              <TrendingDown className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-black text-navy">{deals.length}</p>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Deals</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200/90 p-3.5 text-center shadow-sm hover:border-primary/40 transition-all">
              <Flame className="w-4 h-4 text-red-500 mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-black text-navy">
                {Math.max(...deals.map((d) => d.discount_percentage ?? 0))}%
              </p>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Biggest Discount</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200/90 p-3.5 text-center shadow-sm hover:border-primary/40 transition-all">
              <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-black text-navy">
                {formatPrice(Math.max(...deals.map((d) => d.original_price - d.sale_price)))}
              </p>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Max Savings</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200/90 p-3.5 text-center shadow-sm hover:border-primary/40 transition-all">
              <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-black text-navy">
                {Math.min(...deals.map((d) => Math.ceil((new Date(d.ends_at).getTime() - Date.now()) / 86400000)))}d
              </p>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Days Remaining</p>
            </div>
          </div>

          {/* Interactive Deal Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
            {[
              { key: 'all', label: `All Deals (${deals.length})`, icon: Flame },
              { key: 'boards', label: 'Dev Boards & ICs', icon: Cpu },
              { key: 'sensors', label: 'Sensors & Displays', icon: Zap },
              { key: 'robotics', label: 'Robotics & Motors', icon: Bot },
              { key: 'top', label: '20%+ Off', icon: Tag },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key as any)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm',
                  selectedFilter === key
                    ? 'bg-primary text-white shadow-blue-500/25'
                    : 'bg-white text-navy border border-gray-200/80 hover:bg-gray-50 hover:border-gray-300'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Deal Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 sm:gap-4">
            {filteredDeals.map((deal) => (
              <div key={deal.id} className="space-y-2 flex flex-col justify-between">
                <div className="relative">
                  <ProductCard product={deal.product} />
                </div>
                {/* Per-deal countdown */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold bg-blue-50 text-blue-700 rounded-full py-1 px-2.5 border border-blue-100">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <DealCountdown endsAt={deal.ends_at} />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-3 bg-gradient-to-br from-navy via-slate-900 to-blue-950 rounded-2xl px-8 py-7 shadow-md border border-slate-800">
              <p className="text-white font-black text-lg sm:text-xl">More deals coming every week!</p>
              <p className="text-gray-300 text-xs sm:text-sm max-w-md">
                We update our flash sales regularly with new electronics components and robotics kits.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm mt-1"
              >
                Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
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

  if (time.expired) return <span className="text-white font-bold text-sm">Sale Ended</span>;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <TimeBlock value={time.days} label="Days" />
      <span className="text-white/60 text-lg font-bold">:</span>
      <TimeBlock value={time.hours} label="Hrs" />
      <span className="text-white/60 text-lg font-bold">:</span>
      <TimeBlock value={time.minutes} label="Min" />
      <span className="text-white/60 text-lg font-bold">:</span>
      <TimeBlock value={time.seconds} label="Sec" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center min-w-[38px] sm:min-w-[44px]">
      <div className="text-base sm:text-lg font-mono font-black tabular-nums text-white bg-navy/60 backdrop-blur-sm rounded-lg px-1.5 py-1 shadow-inner border border-white/10">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-[9px] sm:text-[10px] text-cyan-200/80 font-bold uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function DealCountdown({ endsAt }: { endsAt: string }) {
  const [time, setTime] = useState(timeLeftUntil(endsAt));

  useEffect(() => {
    const timer = setInterval(() => setTime(timeLeftUntil(endsAt)), 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (time.expired) return <span className="text-red-500 font-bold">Ended</span>;
  return <span>{time.days}d {time.hours}h {time.minutes}m {time.seconds}s remaining</span>;
}

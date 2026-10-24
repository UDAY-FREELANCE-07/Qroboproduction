'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame, Sparkles, Zap } from 'lucide-react';

const announcements = [
  'New products added weekly — check out our latest arrivals!',
  'Free shipping on all orders above Rs 999',
  'Special deal: 40% off on selected sensors and motors',
  'Student discount: Use code WELCOME10 for 10% off your first order',
  'New 3D printing collection now available',
];

export function AnnouncementBar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = [...announcements, ...announcements];

  return (
    <div className="relative h-10 overflow-hidden bg-gradient-to-r from-red-700 via-orange-600 to-red-700 text-white shadow-sm">
      <div className="absolute inset-0 opacity-20 campaign-grid" />
      <div className="relative flex h-full items-center">
        <Link
          href="/deals"
          className="campaign-pulse z-10 ml-3 hidden shrink-0 items-center gap-1.5 rounded-full bg-yellow-300 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-red-900 shadow-lg sm:flex"
        >
          <Flame className="h-3.5 w-3.5" />
          Hot deals
        </Link>
        <div className={`flex whitespace-nowrap ${mounted ? 'animate-marquee' : ''}`}>
          {items.map((text, i) => (
            <div key={i} className="flex items-center gap-2 px-8 text-xs font-bold tracking-wide">
              {i % 3 === 0 ? <Sparkles className="h-3.5 w-3.5 text-yellow-200" /> : <Zap className="h-3.5 w-3.5 text-yellow-200" />}
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

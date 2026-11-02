'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isAdmin = (pathname && pathname.startsWith('/admin')) ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

  if (isAdmin) {
    return null;
  }

  const items = [...announcements, ...announcements];

  return (
    <div className="store-announcement relative h-10 overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-sm border-b border-blue-500/20">
      <div className="absolute inset-0 opacity-20 campaign-grid" />
      <div className="relative flex h-full items-center">
        <Link
          href="/deals"
          className="campaign-pulse z-10 ml-3 hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-700 shadow-md sm:flex hover:bg-blue-50 transition-colors"
        >
          <Flame className="h-3.5 w-3.5 text-blue-600 fill-blue-100" />
          Hot deals
        </Link>
        <div className={`flex whitespace-nowrap ${mounted ? 'animate-marquee' : ''}`}>
          {items.map((text, i) => (
            <div key={i} className="flex items-center gap-2 px-8 text-xs font-bold tracking-wide text-white">
              {i % 3 === 0 ? <Sparkles className="h-3.5 w-3.5 text-cyan-200" /> : <Zap className="h-3.5 w-3.5 text-sky-200" />}
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

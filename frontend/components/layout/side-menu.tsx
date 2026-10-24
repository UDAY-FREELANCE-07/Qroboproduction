'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, ChevronUp, UserCircle2, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

type Item = { label: string; href: string };
type Group = { label: string; href: string; children: Item[] };

const cat = (slug: string) => `/shop?category=${slug}`;

// Real category slugs from the catalog (lib/mock-data.ts / seed SQL).
const categoryGroups: Group[] = [
  {
    label: 'Development Boards',
    href: cat('development-boards'),
    children: [
      { label: 'All Development Boards', href: cat('development-boards') },
      { label: 'Arduino', href: cat('arduino') },
      { label: 'ESP32 / ESP8266', href: cat('esp32-esp8266') },
      { label: 'Raspberry Pi', href: cat('raspberry-pi') },
      { label: 'Microcontrollers', href: cat('microcontrollers') },
    ],
  },
  {
    label: 'Robotics',
    href: cat('robotics'),
    children: [
      { label: 'All Robotics', href: cat('robotics') },
      { label: 'Robotics Kits', href: cat('robotics-kits') },
      { label: 'Motors', href: cat('motors') },
      { label: 'Motor Drivers', href: cat('motor-drivers') },
    ],
  },
  {
    label: 'Sensors & Modules',
    href: cat('sensors'),
    children: [
      { label: 'Sensors', href: cat('sensors') },
      { label: 'Displays', href: cat('displays') },
      { label: 'Communication Modules', href: cat('communication-modules') },
      { label: 'IoT', href: cat('iot') },
    ],
  },
  {
    label: '3D Printing',
    href: cat('3d-printing'),
    children: [
      { label: '3D Printers & Filament', href: cat('3d-printing') },
      { label: '3D Printer Parts', href: cat('3d-printer-parts') },
    ],
  },
  {
    label: 'Kits & Learning',
    href: cat('diy-kits'),
    children: [
      { label: 'DIY Kits', href: cat('diy-kits') },
      { label: 'Student Project Kits', href: cat('student-project-kits') },
      { label: 'AI / ML Hardware', href: cat('ai-ml-hardware') },
    ],
  },
  {
    label: 'Components & Tools',
    href: cat('electronics-components'),
    children: [
      { label: 'Electronics Components', href: cat('electronics-components') },
      { label: 'Tools', href: cat('tools') },
      { label: 'Accessories', href: cat('accessories') },
    ],
  },
];

const VISIBLE_CATEGORIES = 4;

const trending: Item[] = [
  { label: 'Bestsellers', href: '/shop?sort=popularity' },
  { label: 'New Releases', href: '/shop?sort=newest' },
  { label: "Today's Deals", href: '/deals' },
];

const explore: Item[] = [
  { label: 'DIY Projects', href: '/projects' },
  { label: 'Knowledge Hub', href: '/learn' },
  { label: 'All Products', href: '/shop' },
];

const rowClass = 'flex w-full items-center justify-between px-8 py-3 text-left text-[15px] text-navy transition-colors hover:bg-gray-100';
const headingClass = 'px-8 pb-1 pt-5 text-lg font-bold text-navy';

export function SideMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, profile, signOut } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [submenu, setSubmenu] = useState<Group | null>(null);

  const name = (profile?.full_name || user?.email || '').split(/[\s@]/)[0];
  const close = () => onOpenChange(false);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setSubmenu(null);
      setShowAll(false);
    }
  };

  const linkRow = (item: Item) => (
    <Link key={item.href + item.label} href={item.href} onClick={close} className={rowClass}>
      {item.label}
    </Link>
  );

  const groupRow = (group: Group) => (
    <button key={group.label} type="button" onClick={() => setSubmenu(group)} className={rowClass}>
      {group.label}
      <ChevronRight className="h-5 w-5 text-gray-500" />
    </button>
  );

  const visibleGroups = showAll ? categoryGroups : categoryGroups.slice(0, VISIBLE_CATEGORIES);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="left" className="flex w-[85vw] max-w-[365px] flex-col gap-0 overflow-visible border-r-0 p-0 sm:max-w-[365px] [&>button:last-child]:hidden">
        <SheetTitle className="sr-only">Browse Qrobo</SheetTitle>

        {/* Close button sits outside the panel, like the reference */}
        <button
          type="button"
          onClick={close}
          aria-label="Close menu"
          className="absolute -right-14 top-3 hidden h-10 w-10 items-center justify-center rounded-sm border-2 border-white text-white hover:bg-white/10 sm:flex"
        >
          <X className="h-7 w-7" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between bg-navy-light px-8 py-3 text-white">
          <Link href={user ? '/account' : '/login'} onClick={close} className="flex items-center gap-3 text-lg font-bold">
            <UserCircle2 className="h-8 w-8" />
            {user ? `Hello, ${name}` : 'Hello, sign in'}
          </Link>
          <button type="button" onClick={close} aria-label="Close menu" className="p-1 sm:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body: main list and slide-in submenu */}
        <div className="relative flex-1 overflow-hidden">
          <div
            className={cn(
              'absolute inset-0 overflow-y-auto pb-6 transition-transform duration-300 ease-out',
              submenu ? '-translate-x-full' : 'translate-x-0'
            )}
            aria-hidden={!!submenu}
          >
            <p className={headingClass}>Trending</p>
            {trending.map(linkRow)}

            <hr className="my-2 border-gray-300" />
            <p className={headingClass}>Shop by Category</p>
            {visibleGroups.map(groupRow)}
            {categoryGroups.length > VISIBLE_CATEGORIES && (
              <button type="button" onClick={() => setShowAll((v) => !v)} className={cn(rowClass, 'justify-start gap-2')}>
                {showAll ? 'See less' : 'See all'}
                {showAll ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>
            )}

            <hr className="my-2 border-gray-300" />
            <p className={headingClass}>Explore</p>
            {explore.map(linkRow)}

            <hr className="my-2 border-gray-300" />
            <p className={headingClass}>Help & Settings</p>
            {linkRow({ label: 'Your Account', href: user ? '/account' : '/login' })}
            {linkRow({ label: 'Your Orders', href: '/account?tab=orders' })}
            {linkRow({ label: 'Wishlist', href: '/account?tab=wishlist' })}
            {user ? (
              <button type="button" onClick={async () => { await signOut(); close(); }} className={rowClass}>
                Sign Out
              </button>
            ) : (
              <>
                {linkRow({ label: 'Sign In', href: '/login' })}
                {linkRow({ label: 'Create Account', href: '/register' })}
              </>
            )}
          </div>

          {/* Submenu */}
          <div
            className={cn(
              'absolute inset-0 overflow-y-auto bg-white pb-6 transition-transform duration-300 ease-out',
              submenu ? 'translate-x-0' : 'translate-x-full'
            )}
            aria-hidden={!submenu}
          >
            {submenu && (
              <>
                <button type="button" onClick={() => setSubmenu(null)} className={cn(rowClass, 'justify-start gap-3 py-4 font-bold')}>
                  <ArrowLeft className="h-5 w-5" /> MAIN MENU
                </button>
                <hr className="border-gray-300" />
                <p className={headingClass}>{submenu.label}</p>
                {submenu.children.map((item) => linkRow(item))}
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, Heart, User, ShoppingCart, Menu, X, Cpu, ChevronRight, ChevronDown, Flame, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useAuth } from '@/lib/auth-context';
import { getStoredAdminUser } from '@/lib/admin/admin-auth';
import type { AdminUser } from '@/lib/admin/admin-types';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { cn } from '@/lib/utils';
import { SideMenu } from '@/components/layout/side-menu';
import { BrandLogo } from '@/components/brand/brand-logo';

type Product = Database['public']['Tables']['products']['Row'];

// Category slugs that exist in the catalog (lib/mock-data.ts / seed SQL).
const categories = [
  { label: 'Development Boards & Shields', value: 'development-boards-and-shields' },
  { label: 'Sensors (Temp, Humidity & Pressure)', value: 'sensors-temperature-humidity-and-pressure' },
  { label: 'Sensors (Motion & Orientation)', value: 'sensors-motion-and-orientation' },
  { label: 'Sensors (Distance & Ultrasonic)', value: 'sensors-distance' },
  { label: 'Resistors & Variable Resistors', value: 'resistors-and-variable-resistors' },
  { label: 'Capacitors', value: 'capacitors' },
  { label: 'Diodes & Rectifiers', value: 'diodes-and-rectifiers' },
  { label: 'LEDs & Optoelectronics', value: 'leds-and-optoelectronics' },
  { label: 'Transistors', value: 'transistors' },
  { label: 'MOSFETs, IGBT & JFET', value: 'mosfets-igbt-jfet-and-ujt' },
  { label: 'Voltage Regulators', value: 'voltage-regulators' },
  { label: 'Op-Amps & Timers', value: 'op-amps-comparators-timers-and-audio-amplifiers' },
  { label: 'Digital Logic ICs (74xx)', value: 'digital-logic-ics-74xx' },
  { label: 'CMOS ICs (CD4000)', value: 'cmos-ics-cd4000' },
  { label: 'Motor Drivers & Special ICs', value: 'motor-drivers-and-special-purpose-ics' },
  { label: 'Microcontroller Chips', value: 'microcontroller-chips' },
  { label: 'Displays (LCD, OLED, TFT)', value: 'displays' },
  { label: 'Communication & Wireless', value: 'communication-modules' },
  { label: 'Motors, Actuators & Servos', value: 'motors-actuators-and-sound' },
  { label: 'Relays & Switches', value: 'relays-switches-and-input-devices' },
  { label: 'Power Modules & Converters', value: 'power-modules' },
  { label: 'Batteries & Cells', value: 'batteries' },
  { label: 'IoT Boards & Gateways', value: 'iot-boards-and-gateways' },
  { label: 'Robot Chassis & Kits', value: 'robot-chassis-and-platform-kits' },
  { label: 'DIY Project Kits', value: 'diy-and-educational-project-kits' },
  { label: 'Tools & Consumables', value: 'tools-and-consumables' },
];

const brands = [
  { label: 'Arduino', value: 'arduino' },
  { label: 'Raspberry Pi', value: 'raspberry-pi' },
  { label: 'Espressif', value: 'espressif' },
  { label: 'Adafruit', value: 'adafruit' },
  { label: 'Creality', value: 'creality' },
  { label: 'Waveshare', value: 'waveshare' },
  { label: 'Elegoo', value: 'elegoo' },
  { label: 'YantraX', value: 'yantrax' },
];

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Deals', href: '/deals' },
  { label: 'Projects', href: '/projects' },
  { label: 'Learn', href: '/learn' },
];

function Dropdown({ label, items, hrefFor }: { label: string; items: { label: string; value: string }[]; hrefFor: (v: string) => string }) {
  return (
    <div className="group relative">
      <button type="button" className="flex items-center gap-1 py-3 text-sm font-semibold text-navy hover:text-primary">
        {label} <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
      </button>
      <div className="invisible absolute left-0 top-full z-50 w-60 rounded-lg border border-gray-100 bg-white py-2 opacity-0 shadow-xl transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        {items.map((it) => (
          <Link key={it.value} href={hrefFor(it.value)} className="block px-4 py-2 text-sm text-navy hover:bg-blue-50 hover:text-primary">
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = (pathname && pathname.startsWith('/admin')) ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

  const router = useRouter();
  const { totalItems, setIsOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { user } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (isAdmin) return;
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { data } = await dataClient
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
        .eq('is_published', true)
        .limit(5);
      setSearchResults(data || []);
      setShowSearch(true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAdmin]);

  useEffect(() => {
    setAdminUser(getStoredAdminUser());
    const handleAuthChange = () => setAdminUser(getStoredAdminUser());
    window.addEventListener('admin-auth-change', handleAuthChange);
    return () => window.removeEventListener('admin-auth-change', handleAuthChange);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  if (isAdmin) {
    return null;
  }

  const searchForm = (
    <form onSubmit={handleSearch} className="flex h-10 w-full overflow-hidden rounded-md border border-gray-200 bg-gray-100 focus-within:border-primary focus-within:bg-white">
      <input
        type="text"
        placeholder="Search Arduino, Raspberry Pi, sensors..."
        aria-label="Search products"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => searchResults.length > 0 && setShowSearch(true)}
        className="min-w-0 flex-1 bg-transparent px-4 text-sm text-navy placeholder:text-gray-500 focus:outline-none"
      />
      <button type="submit" aria-label="Search" className="flex w-11 shrink-0 items-center justify-center bg-primary text-white transition-colors hover:bg-blue-700">
        <Search className="h-5 w-5" />
      </button>
    </form>
  );

  return (
    <header className="store-navbar sticky top-0 z-50 bg-white shadow-sm">
      <div className="h-1 w-full bg-primary" />

      {/* Main row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-md p-1.5 text-navy hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <BrandLogo size="md" priority className="shrink-0" />
          </div>

          {/* Search Form - responsive & fluid */}
          <div ref={searchRef} className="relative hidden md:flex flex-1 min-w-[200px] max-w-xl mx-3 lg:mx-8 xl:max-w-2xl">
            {searchForm}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl animate-scale-in">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                    className="flex items-center gap-3 p-3 transition-colors hover:bg-gray-50"
                  >
                    {product.primary_image && (
                      <img src={product.primary_image} alt={product.name} className="h-12 w-12 rounded-md object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-navy">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Rs {product.price.toFixed(0)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
                <button
                  onClick={() => { router.push(`/shop?q=${encodeURIComponent(searchQuery)}`); setShowSearch(false); }}
                  className="w-full p-3 text-sm font-medium text-primary transition-colors hover:bg-blue-50"
                >
                  View all results
                </button>
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto md:ml-0">
            <button onClick={() => setIsOpen(true)} className="relative rounded-full p-2 text-navy hover:bg-gray-100 transition-colors" title="Cart" aria-label="Cart">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            </button>
            <Link href="/account?tab=wishlist" className="relative rounded-full p-2 text-navy hover:bg-gray-100 transition-colors" title="Wishlist" aria-label="Wishlist">
              <Heart className="h-6 w-6" />
              {wishlistIds.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            <Link href={adminUser ? '/admin' : user ? '/account' : '/login'} className="rounded-full p-2 text-navy hover:bg-gray-100 transition-colors" title={adminUser ? `Admin: ${adminUser.name}` : user ? 'Account' : 'Sign In'} aria-label="Account">
              <User className="h-6 w-6" />
            </Link>

            {adminUser && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm ml-1"
                title={`Admin Workspace: ${adminUser.name} (${adminUser.role})`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
        <div className="pb-3 md:hidden">{searchForm}</div>
      </div>

      {/* Category nav */}
      <nav className="hidden w-full border-t border-blue-100 bg-blue-50/70 lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8">
            <Dropdown label="Shop By Category" items={categories} hrefFor={(v) => `/shop?category=${v}`} />
            <Dropdown label="Shop By Brand" items={brands} hrefFor={() => '/shop'} />
            {navLinks.slice(1).filter((l) => l.href !== '/deals').map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn('py-3 text-sm font-medium hover:text-primary', pathname === link.href ? 'text-primary' : 'text-navy')}
              >
                {link.label === 'Learn' ? 'Knowledge Hub' : link.label}
              </Link>
            ))}
            <Link href="/deals" className="campaign-pulse flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-sm font-bold text-white hover:bg-red-700">
              <Flame className="h-4 w-4 text-amber-300" /> Top Deals
            </Link>
          </div>
        </div>
      </nav>

      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}

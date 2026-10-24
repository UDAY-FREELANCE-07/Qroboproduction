'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search, Heart, User, ShoppingCart, Menu, X, Cpu, ChevronRight, ChevronDown, Flame } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useWishlist } from '@/lib/wishlist-context';
import { useAuth } from '@/lib/auth-context';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { cn } from '@/lib/utils';
import { SideMenu } from '@/components/layout/side-menu';

type Product = Database['public']['Tables']['products']['Row'];

// Category slugs that exist in the catalog (lib/mock-data.ts / seed SQL).
const categories = [
  { label: 'Robotics', value: 'robotics' },
  { label: 'Development Boards', value: 'development-boards' },
  { label: 'Arduino', value: 'arduino' },
  { label: 'ESP32 / ESP8266', value: 'esp32-esp8266' },
  { label: 'Raspberry Pi', value: 'raspberry-pi' },
  { label: 'Sensors', value: 'sensors' },
  { label: 'Motors & Drivers', value: 'motors' },
  { label: 'Displays', value: 'displays' },
  { label: '3D Printing', value: '3d-printing' },
  { label: 'DIY Kits', value: 'diy-kits' },
  { label: 'Student Project Kits', value: 'student-project-kits' },
  { label: 'Electronics Components', value: 'electronics-components' },
  { label: 'Tools', value: 'tools' },
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
  const router = useRouter();
  const { totalItems, setIsOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
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
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

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
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="h-1 w-full bg-primary" />

      {/* Main row */}
      <div className="w-full px-4 sm:px-8 lg:px-16 xl:px-24">
        <div className="flex h-16 items-center gap-3 sm:gap-6">
          <button onClick={() => setMenuOpen(true)} className="rounded-md p-1.5 text-navy hover:bg-gray-100" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-navy">
              Q<span className="text-primary">robo</span>
            </span>
          </Link>

          <div ref={searchRef} className="relative mx-auto hidden w-full max-w-2xl md:block">
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

          <div className="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
            <button onClick={() => setIsOpen(true)} className="relative rounded-full p-2 text-navy hover:bg-gray-100" title="Cart" aria-label="Cart">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            </button>
            <Link href="/account?tab=wishlist" className="relative rounded-full p-2 text-navy hover:bg-gray-100" title="Wishlist" aria-label="Wishlist">
              <Heart className="h-6 w-6" />
              {wishlistIds.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            <Link href={user ? '/account' : '/login'} className="rounded-full p-2 text-navy hover:bg-gray-100" title="Account" aria-label="Account">
              <User className="h-6 w-6" />
            </Link>
          </div>
        </div>
        <div className="pb-3 md:hidden">{searchForm}</div>
      </div>

      {/* Category nav */}
      <nav className="hidden w-full border-t border-blue-100 bg-blue-50/70 lg:block">
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
      </nav>

      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { dataClient } from '@/lib/data-client';
import { LayoutDashboard, Package, FolderTree, Tag, Boxes, ShoppingCart, Users, Ticket, Star, Image, Settings, Cpu, Menu, X, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const adminNav = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Brands', href: '/admin/brands', icon: Tag },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Banners', href: '/admin/banners', icon: Image },
  { label: 'Deals', href: '/admin/deals', icon: Boxes },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'My Profile', href: '/admin/profile', icon: UserCircle2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (profile?.role === 'admin') {
        setIsAdmin(true);
        setChecking(false);
      } else {
        dataClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.role === 'admin') {
              setIsAdmin(true);
            } else {
              router.push('/');
            }
            setChecking(false);
          });
      }
    }
  }, [user, profile, isLoading, router]);

  if (isLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-navy text-white shrink-0 hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold">Qrobo</span>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <Link href="/admin/profile" className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold">
              {(profile?.full_name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{profile?.full_name || 'Admin'}</p>
              <p className="truncate text-xs text-gray-400">{user?.email}</p>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-full justify-start text-gray-400 hover:text-white">
              <X className="w-4 h-4 mr-2" /> Exit Admin
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md">
            <Menu className="w-5 h-5 text-navy" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-navy">
          <div className="p-6 border-b border-gray-800">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">Qrobo</span>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-x-auto">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}

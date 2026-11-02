'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Boxes,
  ShoppingCart,
  Users,
  CreditCard,
  Ticket,
  Megaphone,
  Wrench,
  BookOpen,
  LayoutTemplate,
  Star,
  BarChart3,
  LifeBuoy,
  UserCog,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Cpu,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminSignOut, getStoredAdminUser } from '@/lib/admin/admin-auth';
import type { AdminUser } from '@/lib/admin/admin-types';
import { BrandLogo } from '@/components/brand/brand-logo';

interface AdminSidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

interface NavGroup {
  groupTitle?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    groupTitle: 'Catalog',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: FolderTree },
      { label: 'Brands', href: '/admin/brands', icon: Tag },
    ],
  },
  {
    groupTitle: 'Operations',
    items: [
      { label: 'Inventory', href: '/admin/inventory', icon: Boxes, badge: '5 Low', badgeColor: 'bg-amber-500/20 text-amber-300' },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, badge: '1 New', badgeColor: 'bg-blue-500/20 text-blue-300' },
      { label: 'Customers', href: '/admin/customers', icon: Users },
      { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    ],
  },
  {
    groupTitle: 'Marketing',
    items: [
      { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
      { label: 'Promotions', href: '/admin/promotions', icon: Megaphone },
    ],
  },
  {
    groupTitle: 'Content & Community',
    items: [
      { label: 'Projects & Kits', href: '/admin/projects', icon: Wrench },
      { label: 'Tutorials', href: '/admin/tutorials', icon: BookOpen },
      { label: 'Homepage Config', href: '/admin/homepage', icon: LayoutTemplate },
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
    ],
  },
  {
    groupTitle: 'Analytics & Support',
    items: [
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'Support Tickets', href: '/admin/support', icon: LifeBuoy, badge: '3', badgeColor: 'bg-rose-500/20 text-rose-300' },
    ],
  },
  {
    groupTitle: 'Administration',
    items: [
      { label: 'Staff Users', href: '/admin/users', icon: UserCog },
      { label: 'Roles & Permissions', href: '/admin/roles', icon: ShieldCheck },
      { label: 'Store Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

const roleAccessMap: Record<string, string[]> = {
  'Order Manager': [
    '/admin',
    '/admin/orders',
    '/admin/payments',
    '/admin/customers',
    '/admin/inventory',
    '/admin/products',
    '/admin/analytics',
  ],
  'Product Manager': [
    '/admin',
    '/admin/products',
    '/admin/categories',
    '/admin/brands',
    '/admin/inventory',
    '/admin/coupons',
    '/admin/promotions',
    '/admin/reviews',
    '/admin/analytics',
  ],
  'Inventory Manager': [
    '/admin',
    '/admin/inventory',
    '/admin/products',
    '/admin/orders',
    '/admin/analytics',
  ],
  'Support Agent': [
    '/admin',
    '/admin/support',
    '/admin/reviews',
    '/admin/customers',
    '/admin/orders',
  ],
  'Content Manager': [
    '/admin',
    '/admin/projects',
    '/admin/tutorials',
    '/admin/homepage',
    '/admin/reviews',
    '/admin/promotions',
  ],
};

export function AdminSidebar({ collapsed = false, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    setAdminUser(getStoredAdminUser());
    const handleAuthChange = () => setAdminUser(getStoredAdminUser());
    window.addEventListener('admin-auth-change', handleAuthChange);
    return () => window.removeEventListener('admin-auth-change', handleAuthChange);
  }, []);

  const handleLogout = async () => {
    await adminSignOut();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  const allowedUrls =
    adminUser?.role && roleAccessMap[adminUser.role] ? roleAccessMap[adminUser.role] : null;

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !allowedUrls || allowedUrls.includes(item.href)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        'flex flex-col bg-[#0B132B] text-slate-300 transition-all duration-300 select-none border-r border-slate-800/80',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-4 border-b border-slate-800/80">
        <BrandLogo
          href="/admin"
          size="sm"
          variant="admin"
          theme="dark"
          collapsed={collapsed}
          showSubtitle
          subtitleText="Robotics & IoT Platform"
        />
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {visibleGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && group.groupTitle && (
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {group.groupTitle}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all',
                    active
                      ? 'bg-primary text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-white',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      active ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    )}
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0',
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Store Link & Logout */}
      <div className="p-3 border-t border-slate-800/80 space-y-1">
        {!collapsed && adminUser && (
          <div className="px-3 py-2 bg-slate-900/90 rounded-lg border border-slate-800 mb-2">
            <p className="text-[11px] font-bold text-white truncate">{adminUser.name}</p>
            <p className="text-[10px] text-sky-400 font-semibold tracking-wide uppercase truncate mt-0.5">
              {adminUser.role}
            </p>
          </div>
        )}

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800/70 hover:text-white transition-colors',
            collapsed && 'justify-center px-2'
          )}
          title="Open Public Storefront"
        >
          <Store className="h-4 w-4 text-slate-400 shrink-0" />
          {!collapsed && <span>Open Live Store</span>}
        </a>

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors',
            collapsed && 'justify-center px-2'
          )}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

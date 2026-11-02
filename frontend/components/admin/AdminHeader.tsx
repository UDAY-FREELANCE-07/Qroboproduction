'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  ExternalLink,
  ChevronRight,
  LogOut,
  Settings,
  User,
  Shield,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { NotificationDropdown } from './NotificationDropdown';
import { GlobalSearchModal } from './GlobalSearchModal';
import { getStoredAdminUser, adminSignOut } from '@/lib/admin/admin-auth';
import { AdminUser } from '@/lib/admin/admin-types';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  onMobileMenuToggle?: () => void;
}

export function AdminHeader({ onToggleSidebar, onMobileMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    setAdminUser(getStoredAdminUser());
    const handleAuthChange = () => setAdminUser(getStoredAdminUser());
    window.addEventListener('admin-auth-change', handleAuthChange);
    return () => window.removeEventListener('admin-auth-change', handleAuthChange);
  }, []);

  // Listen for Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await adminSignOut();
    router.push('/login');
  };

  // Generate dynamic breadcrumb segments
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    return { href, label, isLast: index === pathParts.length - 1 };
  });

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 lg:px-8 backdrop-blur transition-all">
        {/* Left: Toggles & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={onToggleSidebar}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:flex"
            aria-label="Toggle sidebar collapse"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 ml-2">
            <Link href="/admin" className="font-semibold text-slate-700 hover:text-primary">
              Admin
            </Link>
            {breadcrumbs.slice(1).map((b) => (
              <React.Fragment key={b.href}>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                {b.isLast ? (
                  <span className="font-medium text-slate-900">{b.label}</span>
                ) : (
                  <Link href={b.href} className="hover:text-primary">
                    {b.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Right: Search, Store Link, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Global Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-500 hover:bg-slate-100 transition-colors w-36 sm:w-60 justify-between"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Search className="h-3.5 w-3.5" />
              <span>Search dashboard...</span>
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* View Store front link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Live Store</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Admin User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 p-1 pl-2 hover:bg-slate-50 transition-colors">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {adminUser?.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] font-semibold text-primary">
                    {adminUser?.role || 'Super Admin'}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-white shadow-sm">
                  {(adminUser?.name || 'Admin').charAt(0).toUpperCase()}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-xs font-bold text-slate-900">{adminUser?.name || 'Admin'}</p>
                <p className="text-[11px] text-slate-500 font-normal truncate">
                  {adminUser?.email || 'chirrauday02@gmail.com'}
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <Shield className="h-3 w-3" />
                  {adminUser?.role || 'Super Admin'}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Store Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/users" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Staff & Roles</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-rose-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

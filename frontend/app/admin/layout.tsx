'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { getStoredAdminUser } from '@/lib/admin/admin-auth';
import { AdminUser } from '@/lib/admin/admin-types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    if (pathname === '/admin/login') {
      router.replace('/login?redirect=/admin');
      return;
    }

    const user = getStoredAdminUser();
    if (!user) {
      router.replace('/login?redirect=' + encodeURIComponent(pathname));
    } else {
      setAdminUser(user);
    }
    setIsChecking(false);

    const handleAuthChange = () => {
      const u = getStoredAdminUser();
      if (!u && pathname !== '/admin/login') {
        router.replace('/login?redirect=' + encodeURIComponent(pathname));
      } else {
        setAdminUser(u);
      }
    };

    window.addEventListener('admin-auth-change', handleAuthChange);
    return () => window.removeEventListener('admin-auth-change', handleAuthChange);
  }, [pathname, router]);

  // If login page, don't show admin header/sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading QROBO Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-admin-layout="true" className="flex min-h-screen bg-slate-50/70 font-sans antialiased text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0 sticky top-0 h-screen z-40">
        <AdminSidebar collapsed={collapsed} />
      </div>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 border-0 bg-[#0B132B]">
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader
          onToggleSidebar={() => setCollapsed(!collapsed)}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

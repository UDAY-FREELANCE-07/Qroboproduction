'use client';

import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ChangePasswordCard, EmailVerificationCard, NotificationsCard, ProfileCard } from '@/components/account/settings-panels';

export default function AdminProfilePage() {
  const { user, profile } = useAuth();
  const initial = (profile?.full_name || user?.email || 'A').charAt(0).toUpperCase();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-navy">My Profile</h1>

      <div className="mb-6 flex items-center gap-4 rounded-xl bg-gradient-to-r from-navy to-indigo-800 p-6 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-2xl font-black">{initial}</div>
        <div className="min-w-0">
          <p className="truncate text-xl font-bold">{profile?.full_name || 'Admin'}</p>
          <p className="truncate text-sm text-white/80">{user?.email}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold uppercase text-navy">
            <ShieldCheck className="h-3.5 w-3.5" /> Administrator
          </span>
        </div>
      </div>

      <div className="grid max-w-5xl grid-cols-1 gap-6 xl:grid-cols-2">
        <ProfileCard showRole />
        <div className="space-y-6">
          <EmailVerificationCard />
          <NotificationsCard admin />
        </div>
        <div className="xl:col-span-2">
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}

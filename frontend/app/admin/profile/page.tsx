'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Mail, Shield, KeyRound, Calendar } from 'lucide-react';
import { getStoredAdminUser } from '@/lib/admin/admin-auth';
import { AdminUser } from '@/lib/admin/admin-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateTime } from '@/lib/format';

export default function AdminProfilePage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    setAdminUser(getStoredAdminUser());
  }, []);

  const initial = (adminUser?.name || 'A').charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Staff Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Your active staff credentials, role permissions, and session authorization.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-slate-900 p-6 text-white shadow-lg">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-white shadow-md">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xl font-bold">{adminUser?.name || 'Chirra Uday'}</p>
          <p className="truncate text-xs text-slate-400">{adminUser?.email || 'chirrauday02@gmail.com'}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-0.5 text-xs font-bold text-primary-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{adminUser?.role || 'Super Admin'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            Personal Information
          </h3>

          <div className="space-y-1.5">
            <Label htmlFor="prof-name">Full Name</Label>
            <Input id="prof-name" value={adminUser?.name || ''} readOnly className="bg-slate-50 text-xs" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof-email">Staff Email</Label>
            <Input id="prof-email" value={adminUser?.email || ''} readOnly className="bg-slate-50 text-xs" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prof-role">Assigned Role</Label>
            <Input id="prof-role" value={adminUser?.role || ''} readOnly className="bg-slate-50 text-xs" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            Security & Session Audit
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Account Status</span>
              <span className="font-semibold text-emerald-600">Active & Permitted</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Account ID</span>
              <span className="font-mono text-slate-700">{adminUser?.id || 'user-admin-1'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Last Authentication</span>
              <span className="text-slate-700">
                {adminUser?.lastLogin ? formatDateTime(adminUser.lastLogin) : 'Current Session'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Session Policy</span>
              <span className="text-slate-700">120 Minutes Idle Timeout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { BrandLogo } from '@/components/brand/brand-logo';

/** Centered card layout shared by login-adjacent pages (forgot/reset password, verify email). */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 text-center flex flex-col items-center">
        <BrandLogo size="lg" className="mb-6" />
        <h1 className="mb-1 text-2xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

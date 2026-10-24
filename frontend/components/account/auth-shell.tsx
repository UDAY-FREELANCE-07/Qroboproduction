import Link from 'next/link';
import { Cpu } from 'lucide-react';

/** Centered card layout shared by login-adjacent pages (forgot/reset password, verify email). */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-navy">Qrobo</span>
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

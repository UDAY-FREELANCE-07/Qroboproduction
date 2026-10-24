'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MailCheck } from 'lucide-react';
import { accountApi, isMockModeError } from '@/lib/api-client';
import { AuthShell } from '@/components/account/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = await accountApi.forgotPassword(email);
    setLoading(false);
    if (r.error) return toast.error(isMockModeError(r) ? 'Password reset needs the PostgreSQL data source.' : r.error.message);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell title="Check your inbox">
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
          <MailCheck className="mx-auto mb-3 h-12 w-12 text-green-600" />
          <p className="text-sm text-muted-foreground">
            If an account exists for <span className="font-medium text-navy">{email}</span>, we&apos;ve sent a link to reset your password. It expires in 1 hour.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">Back to sign in</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
          </div>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}

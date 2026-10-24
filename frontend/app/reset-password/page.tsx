'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { accountApi, isMockModeError } from '@/lib/api-client';
import { AuthShell } from '@/components/account/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <AuthShell title="Invalid reset link">
        <p className="text-center text-sm text-muted-foreground">
          This link is incomplete. <Link href="/forgot-password" className="font-medium text-primary hover:underline">Request a new one</Link>.
        </p>
      </AuthShell>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    const r = await accountApi.resetPassword(token, password);
    setLoading(false);
    if (r.error) return toast.error(isMockModeError(r) ? 'Password reset needs the PostgreSQL data source.' : r.error.message);
    toast.success('Password updated. Please sign in with your new password.');
    router.push('/login');
  };

  return (
    <AuthShell title="Choose a new password" subtitle="You'll be signed out on all devices">
      <form onSubmit={submit} className="space-y-4">
        {[['password', 'New password', password, setPassword], ['confirm', 'Confirm new password', confirm, setConfirm]].map(([id, label, value, set]) => (
          <div key={id as string}>
            <Label htmlFor={id as string}>{label as string}</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={id as string}
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={value as string}
                onChange={(e) => (set as (v: string) => void)(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
        ))}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? 'Saving...' : 'Update password'}</Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

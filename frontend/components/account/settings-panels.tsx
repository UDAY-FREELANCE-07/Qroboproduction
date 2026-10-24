'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BellRing, CheckCircle2, KeyRound, MailWarning, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { dataClient } from '@/lib/data-client';
import { accountApi, isMockModeError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const card = 'bg-white rounded-xl border border-gray-200 p-6';

function CardTitle({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-navy">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Name / phone editor. Email and role are shown read-only. */
export function ProfileCard({ showRole = false }: { showRole?: boolean }) {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  // Re-sync the form when the loaded profile changes (e.g. after refreshProfile()).
  const [syncedFor, setSyncedFor] = useState(profile);
  if (profile !== syncedFor) {
    setSyncedFor(profile);
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
  }

  if (!user) return null;

  const save = async () => {
    setSaving(true);
    const { error } = await dataClient
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq('id', user.id);
    setSaving(false);
    if (error) toast.error('Failed to update profile');
    else {
      toast.success('Profile updated');
      refreshProfile();
    }
  };

  return (
    <div className={card}>
      <CardTitle icon={UserIcon} title="Profile information" subtitle="Your name and contact details" />
      <div className="max-w-md space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" value={fullName} maxLength={120} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email || ''} disabled className="mt-1 bg-gray-50" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} maxLength={20} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
        </div>
        {showRole && (
          <div>
            <Label>Role</Label>
            <p className="mt-1">
              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold uppercase text-indigo-700">{profile?.role || 'customer'}</span>
              <span className="ml-2 text-xs text-muted-foreground">Roles can only be changed by an operator.</span>
            </p>
          </div>
        )}
        <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
      </div>
    </div>
  );
}

/** Email verification status with a "resend link" action. */
export function EmailVerificationCard() {
  const { user } = useAuth();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    accountApi.me().then((r) => {
      if (!active) return;
      if (r.error) setUnavailable(true);
      else setVerified(Boolean(r.data?.user?.email_verified));
    });
    return () => {
      active = false;
    };
  }, []);

  const resend = async () => {
    setSending(true);
    const r = await accountApi.resendVerification();
    setSending(false);
    if (r.error) toast.error(isMockModeError(r) ? 'Email needs the PostgreSQL data source.' : r.error.message);
    else if (r.data?.alreadyVerified) {
      setVerified(true);
      toast.success('Your email is already verified');
    } else toast.success(`Verification link sent to ${user?.email}`);
  };

  return (
    <div className={card}>
      <CardTitle icon={verified ? CheckCircle2 : MailWarning} title="Email address" subtitle={user?.email || undefined} />
      {unavailable ? (
        <p className="text-sm text-muted-foreground">Email features are available when the site runs on the PostgreSQL data source.</p>
      ) : verified === null ? (
        <p className="text-sm text-muted-foreground">Checking...</p>
      ) : verified ? (
        <p className="flex items-center gap-2 text-sm font-medium text-green-700">
          <CheckCircle2 className="h-4 w-4" /> Verified
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-amber-700">Not verified yet. Check your inbox for the verification link.</p>
          <Button variant="outline" onClick={resend} disabled={sending}>{sending ? 'Sending...' : 'Resend verification email'}</Button>
        </div>
      )}
    </div>
  );
}

type Prefs = { notify_order_updates: boolean; notify_marketing: boolean; notify_admin_new_orders: boolean };

/** Email notification preferences (stored on the profile). */
export function NotificationsCard({ admin = false }: { admin?: boolean }) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    dataClient
      .from('profiles')
      .select('notify_order_updates, notify_marketing, notify_admin_new_orders')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setPrefs((data as Prefs | null) ?? { notify_order_updates: true, notify_marketing: false, notify_admin_new_orders: true });
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (!user || !prefs) return null;

  const save = async () => {
    setSaving(true);
    const values: Partial<Prefs> = { notify_order_updates: prefs.notify_order_updates, notify_marketing: prefs.notify_marketing };
    if (admin) values.notify_admin_new_orders = prefs.notify_admin_new_orders;
    const { error } = await dataClient.from('profiles').update(values as never).eq('id', user.id);
    setSaving(false);
    if (error) toast.error('Failed to save notification settings');
    else toast.success('Notification settings saved');
  };

  const row = (key: keyof Prefs, label: string, help: string) => (
    <label className="flex items-start justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium text-navy">{label}</span>
        <span className="block text-xs text-muted-foreground">{help}</span>
      </span>
      <Switch checked={prefs[key]} onCheckedChange={(v) => setPrefs({ ...prefs, [key]: v })} aria-label={label} />
    </label>
  );

  return (
    <div className={card}>
      <CardTitle icon={BellRing} title="Email notifications" subtitle="Choose which emails you receive" />
      <div className="max-w-xl divide-y divide-gray-100">
        {row('notify_order_updates', 'Order updates', 'Shipping and delivery status changes for your orders')}
        {row('notify_marketing', 'Offers & new arrivals', 'Occasional deals and product news')}
        {admin && row('notify_admin_new_orders', 'New order alerts', 'Email me whenever a customer places an order')}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Order confirmations and security emails (password changes, resets) are always sent.</p>
      <Button className="mt-4" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save notifications'}</Button>
    </div>
  );
}

/** Change password; requires the current password. */
export function ChangePasswordCard() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) return toast.error('Passwords do not match');
    if (next.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    const r = await accountApi.changePassword(current, next);
    setLoading(false);
    if (r.error) toast.error(isMockModeError(r) ? 'Password change needs the PostgreSQL data source.' : r.error.message);
    else {
      toast.success('Password updated. Other devices were signed out.');
      setCurrent('');
      setNext('');
      setConfirm('');
    }
  };

  return (
    <div className={card}>
      <CardTitle icon={KeyRound} title="Change password" subtitle="Other devices are signed out after a change" />
      <form onSubmit={submit} className="max-w-md space-y-4">
        <div>
          <Label htmlFor="currentPassword">Current password</Label>
          <Input id="currentPassword" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="newPassword">New password</Label>
          <Input id="newPassword" type="password" autoComplete="new-password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="confirmNewPassword">Confirm new password</Label>
          <Input id="confirmNewPassword" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="mt-1" />
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update password'}</Button>
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">Forgot your password?</Link>
        </div>
      </form>
    </div>
  );
}

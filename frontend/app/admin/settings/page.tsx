'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, RefreshCw, Send, Store, CreditCard, UserCircle2 } from 'lucide-react';
import { accountApi, isMockModeError, type EmailStatus } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const card = 'bg-white rounded-xl border border-gray-200 p-6';

const STATUS_STYLE: Record<string, string> = {
  sent: 'bg-green-100 text-green-700',
  pending: 'bg-blue-100 text-blue-700',
  sending: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
};

const PROVIDER_LABEL: Record<string, string> = {
  log: 'Log only (development) — emails are printed to the server log, nothing is delivered',
  smtp: 'SMTP',
  resend: 'Resend API',
};

export default function AdminSettingsPage() {
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  const load = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let active = true;
    accountApi.emailStatus().then((r) => {
      if (!active) return;
      if (r.error) setError(isMockModeError(r) ? 'Email requires the PostgreSQL data source (DATA_SOURCE=postgres).' : r.error.message);
      else {
        setError(null);
        setStatus(r.data);
      }
    });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const sendTest = async () => {
    setSending(true);
    const r = await accountApi.sendTestEmail();
    setSending(false);
    if (r.error) return toast.error(r.error.message);
    toast.success(`Test email queued to ${r.data?.to}`);
    setTimeout(load, 2500);
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-navy">Settings</h1>
      <div className="max-w-4xl space-y-6">
        {/* Email delivery */}
        <div className={card}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-navy">Email delivery</h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={load}><RefreshCw className="mr-1 h-4 w-4" /> Refresh</Button>
              <Button size="sm" onClick={sendTest} disabled={sending || !status}><Send className="mr-1 h-4 w-4" /> {sending ? 'Sending...' : 'Send test email to me'}</Button>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-muted-foreground">{error}</p>
          ) : !status ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Provider</dt><dd className="font-medium text-navy">{PROVIDER_LABEL[status.provider]}</dd></div>
                <div><dt className="text-muted-foreground">From address</dt><dd className="font-medium text-navy">{status.from}</dd></div>
                <div><dt className="text-muted-foreground">Links point to</dt><dd className="font-medium text-navy">{status.appUrl}</dd></div>
                <div><dt className="text-muted-foreground">Bootstrap admin emails</dt><dd className="font-medium text-navy">{status.adminEmails.join(', ') || 'none'}</dd></div>
                <div className="sm:col-span-2"><dt className="text-muted-foreground">Last 7 days</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {['sent', 'pending', 'failed'].map((k) => (
                      <span key={k} className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_STYLE[k])}>{k}: {status.last7Days[k] ?? 0}</span>
                    ))}
                  </dd>
                </div>
              </dl>
              {status.provider === 'log' && (
                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  To deliver real emails set <code>EMAIL_PROVIDER=smtp</code> (e.g. Gmail with an App Password) or <code>resend</code>, plus <code>EMAIL_FROM</code> and <code>APP_URL</code>, on the server. See docs/email.md.
                </p>
              )}

              <h3 className="mb-2 mt-6 text-sm font-bold text-navy">Recent emails</h3>
              {status.recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No emails yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs text-muted-foreground">
                      <tr><th className="py-2 pr-3">To</th><th className="pr-3">Subject</th><th className="pr-3">Status</th><th>Created</th></tr>
                    </thead>
                    <tbody>
                      {status.recent.map((m) => (
                        <tr key={m.id} className="border-t border-gray-100 align-top">
                          <td className="py-2 pr-3 text-navy">{m.to_email}</td>
                          <td className="pr-3 text-navy">{m.subject}{m.last_error && <span className="block text-xs text-red-600">{m.last_error}</span>}</td>
                          <td className="pr-3"><span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', STATUS_STYLE[m.status])}>{m.status}</span></td>
                          <td className="whitespace-nowrap text-muted-foreground">{formatDate(m.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Store information (display only) */}
        <div className={card}>
          <div className="mb-4 flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-navy">Store information</h2>
          </div>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div><dt className="text-muted-foreground">Store name</dt><dd className="font-medium text-navy">Qrobo</dd></div>
            <div><dt className="text-muted-foreground">Support email</dt><dd className="font-medium text-navy">support@qrobo.in</dd></div>
            <div><dt className="text-muted-foreground">Phone</dt><dd className="font-medium text-navy">+91 98765 43210</dd></div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">These are shown in the site footer. Editing them from the dashboard is not available yet.</p>
        </div>

        <div className={card}>
          <div className="mb-2 flex items-center gap-2">
            <UserCircle2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-navy">Your profile, notifications & password</h2>
          </div>
          <p className="text-sm text-muted-foreground">Managed on <Link href="/admin/profile" className="font-medium text-primary hover:underline">My Profile</Link>.</p>
        </div>

        <div className="rounded-xl bg-blue-50 p-6">
          <div className="mb-2 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-navy">Payments</h3>
          </div>
          <p className="text-sm text-muted-foreground">Cash on Delivery is active. Online payment (Razorpay) is not implemented yet.</p>
        </div>
      </div>
    </div>
  );
}

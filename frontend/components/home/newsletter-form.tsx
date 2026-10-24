'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { isMockModeError, newsletterApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

/** Home-page newsletter signup (double opt-in: a confirmation email is sent first). */
export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);
    const r = await newsletterApi.subscribe(email.trim());
    setBusy(false);
    if (r.error) {
      setMessage({ ok: false, text: isMockModeError(r) ? 'Newsletter signup is not available on the demo site.' : r.error.message });
    } else {
      setMessage({ ok: true, text: r.data?.message ?? 'Check your inbox to confirm.' });
      setEmail('');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form className="flex flex-col sm:flex-row gap-3" onSubmit={onSubmit} noValidate={false}>
        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-300"
        />
        <Button type="submit" size="lg" disabled={busy} className="campaign-pulse bg-yellow-300 font-black text-red-900 hover:bg-yellow-200">
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}Subscribe
        </Button>
      </form>
      <p role="status" aria-live="polite" className={`mt-3 min-h-[1.25rem] text-sm ${message?.ok ? 'text-green-300' : 'text-red-300'}`}>
        {message && (
          <span className="inline-flex items-center gap-1.5">
            {message.ok && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            {message.text}
          </span>
        )}
      </p>
      <p className="text-xs text-gray-500">No spam. Unsubscribe with one click from any email.</p>
    </div>
  );
}

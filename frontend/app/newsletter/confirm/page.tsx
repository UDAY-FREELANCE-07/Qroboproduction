'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, MailCheck, XCircle } from 'lucide-react';
import { isMockModeError, newsletterApi } from '@/lib/api-client';
import { AuthShell } from '@/components/account/auth-shell';
import { Button } from '@/components/ui/button';

type State = { kind: 'working' } | { kind: 'ok' } | { kind: 'error'; message: string };

function ConfirmSubscription() {
  const token = useSearchParams().get('token') || '';
  const [state, setState] = useState<State>(token ? { kind: 'working' } : { kind: 'error', message: 'This confirmation link is incomplete.' });
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true; // single-use token: avoid React dev double-invocation
    newsletterApi.confirm(token).then((r) => {
      if (r.error) setState({ kind: 'error', message: isMockModeError(r) ? 'Newsletter needs the PostgreSQL data source.' : r.error.message });
      else setState({ kind: 'ok' });
    });
  }, [token]);

  return (
    <AuthShell title="Newsletter">
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center" aria-live="polite">
        {state.kind === 'working' && (
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Confirming your subscription...</p>
        )}
        {state.kind === 'ok' && (
          <>
            <MailCheck className="mx-auto mb-3 h-12 w-12 text-green-600" aria-hidden="true" />
            <p className="font-semibold text-navy">You&apos;re subscribed!</p>
            <p className="mt-2 text-sm text-muted-foreground">New arrivals, weekly deals and build guides are on their way. Every email has a one-click unsubscribe link.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/deals"><Button>See this week&apos;s deals</Button></Link>
              <Link href="/shop"><Button variant="outline">Browse the shop</Button></Link>
            </div>
          </>
        )}
        {state.kind === 'error' && (
          <>
            <XCircle className="mx-auto mb-3 h-12 w-12 text-red-500" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{state.message}</p>
            <Link href="/#newsletter" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">Subscribe again</Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export default function NewsletterConfirmPage() {
  return (
    <Suspense>
      <ConfirmSubscription />
    </Suspense>
  );
}

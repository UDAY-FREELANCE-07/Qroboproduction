'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, MailX, XCircle } from 'lucide-react';
import { isMockModeError, newsletterApi } from '@/lib/api-client';
import { AuthShell } from '@/components/account/auth-shell';
import { Button } from '@/components/ui/button';

type State = { kind: 'idle' } | { kind: 'working' } | { kind: 'ok' } | { kind: 'error'; message: string };

function Unsubscribe() {
  const token = useSearchParams().get('token') || '';
  const [state, setState] = useState<State>(token ? { kind: 'idle' } : { kind: 'error', message: 'This unsubscribe link is incomplete.' });

  // An explicit click (not automatic on page load) so mail scanners that open links cannot unsubscribe people.
  const submit = async () => {
    setState({ kind: 'working' });
    const r = await newsletterApi.unsubscribe(token);
    if (r.error) setState({ kind: 'error', message: isMockModeError(r) ? 'Newsletter needs the PostgreSQL data source.' : r.error.message });
    else setState({ kind: 'ok' });
  };

  return (
    <AuthShell title="Newsletter">
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center" aria-live="polite">
        {(state.kind === 'idle' || state.kind === 'working') && (
          <>
            <MailX className="mx-auto mb-3 h-12 w-12 text-navy" aria-hidden="true" />
            <p className="font-semibold text-navy">Unsubscribe from Qrobo newsletters?</p>
            <p className="mt-2 text-sm text-muted-foreground">You will still receive emails about your orders and account.</p>
            <Button className="mt-6" onClick={submit} disabled={state.kind === 'working'}>
              {state.kind === 'working' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Unsubscribe
            </Button>
          </>
        )}
        {state.kind === 'ok' && (
          <>
            <MailX className="mx-auto mb-3 h-12 w-12 text-green-600" aria-hidden="true" />
            <p className="font-semibold text-navy">You have been unsubscribed.</p>
            <p className="mt-2 text-sm text-muted-foreground">Sorry to see you go. You can subscribe again any time from the home page.</p>
            <Link href="/" className="mt-6 inline-block"><Button variant="outline">Back to Qrobo</Button></Link>
          </>
        )}
        {state.kind === 'error' && (
          <>
            <XCircle className="mx-auto mb-3 h-12 w-12 text-red-500" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{state.message}</p>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense>
      <Unsubscribe />
    </Suspense>
  );
}

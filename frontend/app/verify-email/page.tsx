'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { accountApi, isMockModeError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { AuthShell } from '@/components/account/auth-shell';
import { Button } from '@/components/ui/button';

type State = { kind: 'working' } | { kind: 'ok'; admin: boolean } | { kind: 'error'; message: string };

function VerifyEmail() {
  const token = useSearchParams().get('token') || '';
  const { refreshProfile } = useAuth();
  const [state, setState] = useState<State>(token ? { kind: 'working' } : { kind: 'error', message: 'This verification link is incomplete.' });
  const started = useRef(false);

  useEffect(() => {
    // Tokens are single-use: make sure React's dev double-invocation doesn't submit twice.
    if (!token || started.current) return;
    started.current = true;
    accountApi.verifyEmail(token).then((r) => {
      if (r.error) {
        setState({ kind: 'error', message: isMockModeError(r) ? 'Email verification needs the PostgreSQL data source.' : r.error.message });
      } else {
        setState({ kind: 'ok', admin: r.data?.role === 'admin' });
        refreshProfile();
      }
    });
  }, [token, refreshProfile]);

  return (
    <AuthShell title="Email verification">
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        {state.kind === 'working' && (
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Verifying your email...</p>
        )}
        {state.kind === 'ok' && (
          <>
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
            <p className="font-semibold text-navy">Your email is verified.</p>
            {state.admin && (
              <p className="mt-2 flex items-center justify-center gap-1 text-sm text-indigo-700"><ShieldCheck className="h-4 w-4" /> Administrator access is enabled for this account.</p>
            )}
            <div className="mt-6 flex justify-center gap-3">
              {state.admin && <Link href="/admin"><Button>Open admin dashboard</Button></Link>}
              <Link href="/account"><Button variant={state.admin ? 'outline' : 'default'}>Go to my account</Button></Link>
            </div>
          </>
        )}
        {state.kind === 'error' && (
          <>
            <XCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
            <p className="text-sm text-muted-foreground">{state.message}</p>
            <Link href="/account?tab=settings" className="mt-6 inline-block text-sm font-medium text-primary hover:underline">Request a new link from Account settings</Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}

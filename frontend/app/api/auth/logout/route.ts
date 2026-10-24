import { assertSameOriginJson, handler, ok } from '@/lib/server/http';
import { clearSessionCookie, destroySession } from '@/lib/server/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Deletes the server-side session row, so the cookie value is useless even if copied. */
export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  await destroySession(req);
  const res = ok({ signedOut: true });
  clearSessionCookie(res);
  return res;
});

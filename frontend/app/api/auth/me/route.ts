import { handler, ok } from '@/lib/server/http';
import { getSessionUser, publicUser } from '@/lib/server/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = handler(async (req: Request) => {
  const user = await getSessionUser(req);
  return ok(user ? publicUser(user) : { user: null, profile: null });
});

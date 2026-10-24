import { z } from 'zod';
import { query } from '@/lib/server/db';
import { ApiError, assertSameOriginJson, clientIp, fail, handler, ok, readJson } from '@/lib/server/http';
import { verifyAgainstDummy, verifyPassword } from '@/lib/server/auth/password';
import { limits } from '@/lib/server/auth/rate-limit';
import { createSession, publicUser, purgeExpiredSessions, setSessionCookie } from '@/lib/server/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  email: z.string().trim().toLowerCase().max(254),
  password: z.string().max(1024),
});

const INVALID = 'Invalid email or password.';

export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const body = Body.parse(await readJson(req));
  const ip = clientIp(req);
  const retry = limits.loginPerIp.hit(ip) || limits.loginPerAccount.hit(`${ip}|${body.email}`);
  if (retry) return fail(429, 'rate_limited', 'Too many sign-in attempts. Please try again later.', { retryAfter: retry });

  const { rows } = await query<{ id: string; email: string; password_hash: string; role: 'customer' | 'admin'; full_name: string | null; phone: string | null; email_verified: boolean }>(
    `SELECT u.id, u.email, u.password_hash, p.role, p.full_name, p.phone, u.email_verified_at IS NOT NULL AS email_verified
       FROM users u JOIN profiles p ON p.id = u.id WHERE u.email = $1`,
    [body.email],
  );
  const user = rows[0];
  const valid = user ? await verifyPassword(body.password, user.password_hash) : await verifyAgainstDummy(body.password);
  if (!user || !valid) throw new ApiError(401, 'invalid_credentials', INVALID);

  limits.loginPerAccount.reset(`${ip}|${body.email}`);
  const token = await createSession(null, user.id);
  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);
  purgeExpiredSessions().catch(() => undefined);

  const res = ok(publicUser(user));
  setSessionCookie(res, token);
  return res;
});

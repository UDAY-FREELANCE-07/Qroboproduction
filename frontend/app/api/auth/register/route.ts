import { z } from 'zod';
import { withTransaction } from '@/lib/server/db';
import { ApiError, assertSameOriginJson, clientIp, fail, handler, ok, readJson } from '@/lib/server/http';
import { hashPassword, passwordProblem } from '@/lib/server/auth/password';
import { limits } from '@/lib/server/auth/rate-limit';
import { createSession, publicUser, setSessionCookie } from '@/lib/server/auth/session';
import { createEmailToken } from '@/lib/server/auth/email-tokens';
import { appUrl, enqueueEmail, kickOutbox, templates } from '@/lib/server/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Only these fields are accepted. Any `role`, `options.data.role`, etc. is ignored.
const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().max(1024),
  full_name: z.string().trim().max(120).optional().default(''),
});

export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const retry = limits.registerPerIp.hit(clientIp(req));
  if (retry) return fail(429, 'rate_limited', 'Too many attempts. Please try again later.', { retryAfter: retry });

  const body = Body.parse(await readJson(req));
  const problem = passwordProblem(body.password);
  if (problem) throw new ApiError(400, 'weak_password', problem);
  const passwordHash = await hashPassword(body.password);
  const baseUrl = appUrl();

  const result = await withTransaction(async (db) => {
    const inserted = await db.query<{ id: string }>(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING id`,
      [body.email, passwordHash],
    );
    if (!inserted.rowCount) return null;
    const id = inserted.rows[0].id;
    // Role is hard-coded: registration can never create an administrator. Bootstrap admins
    // (ADMIN_EMAILS) are promoted only after proving they own the inbox (/api/auth/verify-email).
    await db.query(`INSERT INTO profiles (id, full_name, role) VALUES ($1, $2, 'customer')`, [id, body.full_name || null]);
    const verifyToken = await createEmailToken(db, id, 'verify_email');
    await enqueueEmail(db, body.email, templates.verifyEmail(body.full_name || null, `${baseUrl}/verify-email?token=${encodeURIComponent(verifyToken)}`));
    const token = await createSession(db, id);
    return { id, token };
  });

  if (!result) {
    // Generic message; see docs/auth.md for the residual enumeration risk on sign-up.
    throw new ApiError(409, 'registration_failed', 'Unable to create an account with these details. If you already have an account, please sign in.');
  }
  kickOutbox();

  const res = ok(
    publicUser({ id: result.id, email: body.email, role: 'customer', full_name: body.full_name || null, phone: null, email_verified: false }),
    { status: 201 },
  );
  setSessionCookie(res, result.token);
  return res;
});

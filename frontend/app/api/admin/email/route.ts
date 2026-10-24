import { query } from '@/lib/server/db';
import { assertSameOriginJson, fail, handler, ok } from '@/lib/server/http';
import { requireAdmin } from '@/lib/server/auth/session';
import { limits } from '@/lib/server/auth/rate-limit';
import { adminEmails } from '@/lib/server/email/config';
import { emailRuntime, enqueueEmail, kickOutbox, templates } from '@/lib/server/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/email — delivery status for the admin settings page (no secrets). */
export const GET = handler(async (req: Request) => {
  await requireAdmin(req);
  const { cfg } = emailRuntime();
  const counts = await query<{ status: string; n: number }>(
    `SELECT status, count(*)::int AS n FROM email_outbox WHERE created_at > now() - interval '7 days' GROUP BY status`,
  );
  const recent = await query(
    `SELECT id, to_email, template, subject, status, attempts, last_error, created_at, sent_at
       FROM email_outbox ORDER BY created_at DESC LIMIT 20`,
  );
  return ok({
    provider: cfg.provider,
    from: cfg.from,
    appUrl: cfg.appUrl,
    adminEmails: adminEmails(),
    last7Days: Object.fromEntries(counts.rows.map((r) => [r.status, r.n])),
    recent: recent.rows,
  });
});

/** POST /api/admin/email — send a test email to the signed-in admin's own address only. */
export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);
  const admin = await requireAdmin(req);
  const retry = limits.testEmailPerUser.hit(admin.id);
  if (retry) return fail(429, 'rate_limited', 'Too many test emails. Please try again later.', { retryAfter: retry });
  const { cfg } = emailRuntime();
  await enqueueEmail({ query }, admin.email, templates.testEmail(cfg.appUrl));
  kickOutbox();
  return ok({ queued: true, to: admin.email, provider: cfg.provider });
});

import { z } from 'zod';
import { ApiError, assertSameOriginJson, clientIp, fail, handler, ok, readJson } from '@/lib/server/http';
import { getPool } from '@/lib/server/db';
import { appUrl, enqueueEmail, kickOutbox, templates } from '@/lib/server/email';
import { adminEmails } from '@/lib/server/email/config';
import { RateLimiter } from '@/lib/server/auth/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const contactLimiter = new RateLimiter({ windowMs: 10 * 60 * 1000, max: 6 });

const ContactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Invalid email address').max(254),
  phone: z.string().trim().max(30).optional().default(''),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),
});

export const POST = handler(async (req: Request) => {
  assertSameOriginJson(req);

  const ip = clientIp(req);
  const retry = contactLimiter.hit(ip);
  if (retry) {
    return fail(429, 'rate_limited', 'Too many messages sent. Please wait a few minutes before trying again.', { retryAfter: retry });
  }

  const body = ContactSchema.parse(await readJson(req));
  const pool = getPool();
  const baseUrl = appUrl();

  // Find recipients: primary super admin chirrauday02@gmail.com and any env admin emails
  const recipients = new Set<string>(['chirrauday02@gmail.com']);
  for (const a of adminEmails()) recipients.add(a);

  // Enqueue notification email to admins
  for (const admin of recipients) {
    await enqueueEmail(pool, admin, templates.contactInquiryAdmin(body, baseUrl));
  }

  // Enqueue confirmation acknowledgment to the customer
  await enqueueEmail(pool, body.email, templates.contactInquiryAcknowledgment(body.name, baseUrl));

  // Trigger immediate dispatch
  kickOutbox();

  return ok({ message: 'Thank you! Your message has been sent successfully. We will contact you soon.' });
});


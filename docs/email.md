# Email, admin bootstrap, profile & settings

Works in `DATA_SOURCE=postgres` mode (mock mode has no accounts; the pages show a notice instead).

## What is sent

| Email | When | Can the user turn it off? |
|---|---|---|
| Verify your email | Registration, or "Resend verification email" in Settings | No (security) |
| Admin access granted | An `ADMIN_EMAILS` address is verified | No |
| Reset your password | `/forgot-password` | No |
| Password changed | Password change or reset | No |
| Welcome (with `WELCOME10` while that coupon is active) | First email verification of a customer | No (sent once) |
| Order confirmed (items + images, totals, address, payment, delivery) | Checkout | No (transactional) |
| Order status update (progress tracker; courier/tracking on shipped; COD amount reminder; review links on delivered) | Admin changes an order's status | Yes — "Order updates" |
| New order alert (customer, address, items) | Checkout, to every **verified** admin | Yes — "New order alerts" (admins) |
| Low stock / out of stock alert | Checkout makes a product cross `low_stock_threshold` or reach 0 (once per crossing) | Same setting as new order alerts |
| Newsletter confirm → welcome (with unsubscribe link) | Home page "Stay Updated" form, double opt-in | Yes — one-click unsubscribe |
| Test email | Admin → Settings → "Send test email to me" (only to the admin's own address) | — |

### Shipping an order
Admin → Orders → set status to **shipped**: a dialog asks for courier, tracking number and tracking
link (`https://` only, optional). Saving emails the customer; "Tracking" edits later do not send
another email. The details appear on Account → Orders.

### Newsletter (`newsletter_subscribers`, migration 0003)
`pending` (confirmation sent, nothing else) → `subscribed` (link clicked within 48 h) →
`unsubscribed`. Same response for every address (no enumeration), 3 confirmations per address per
day, 10 signups per IP per hour. Confirming/unsubscribing also updates a matching account's
"Offers & new arrivals" setting. Sending bulk newsletters is not built yet; when it is, only send
to `status = 'subscribed'` and include the per-address unsubscribe link.

## How it works
* **Outbox.** Every email is inserted into `email_outbox` inside the same transaction as the event.
  If the order/registration fails, no email exists; if the mail provider is down, the order still
  succeeds and the email is retried (1, 2, 4, 8 min backoff, then `failed` after 5 attempts).
* Delivery runs in the background after each request (`kickOutbox`). In production also run
  `npm run email:flush` every minute (systemd timer below) so retries happen without traffic.
* **Tokens.** Verification (24 h) and reset (1 h) links carry 32 random bytes; only a SHA-256 hash is
  stored (`email_tokens`). Tokens are single-use, and issuing a new one invalidates older ones.
* **No account enumeration.** `/api/auth/forgot-password` gives the same answer for unknown emails.
* Templates HTML-escape all user values; links are built only from `APP_URL`.
* `email_outbox` and `email_tokens` are not reachable through the data gateway. The admin status
  endpoint returns subjects and statuses only, never bodies (they contain one-time links).

## Admin: chirrauday02@gmail.com ("Uday")
There is no hard-coded admin and no default password. Two supported ways:

1. **Automatic (recommended).** `ADMIN_EMAILS=chirrauday02@gmail.com` is already set in
   `frontend/.env.local` (set the same in production via SSM). Then:
   1. Go to `/register`, enter name **Uday**, the email, and a password of your choice.
   2. Click the link in the verification email (with `EMAIL_PROVIDER=log` the link is printed in the
      dev-server terminal).
   3. The account is promoted to admin on verification; the sidebar shows **Admin dashboard**.
   Registering the address alone grants nothing, so nobody can grab admin by signing up first.
2. **Operator script** (database access):
   `npx tsx --env-file=.env.migrate scripts/db/bootstrap-admin.ts chirrauday02@gmail.com --name "Uday"`

## Pages
* `/account` → **Profile** (name, phone) and **Settings** (email verification, notifications, change password with current password).
* `/admin/profile` → **My Profile** for admins: same panels plus "New order alerts" and the role badge.
* `/admin/settings` → email delivery status, recent emails, "Send test email to me".
* `/forgot-password`, `/reset-password?token=…`, `/verify-email?token=…`; "Forgot password?" on `/login`.

## Configuration (server-only)
| Variable | Purpose |
|---|---|
| `EMAIL_PROVIDER` | `log` (default; prints to the server log, sends nothing), `smtp`, `resend` |
| `EMAIL_FROM` | e.g. `Qrobo <no-reply@your-domain>` (required for smtp/resend) |
| `APP_URL` | base URL for links; must be `https://` in production |
| `ADMIN_EMAILS` | comma-separated admin bootstrap addresses |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | smtp provider (465 = TLS, 587 = STARTTLS) |
| `RESEND_API_KEY` | resend provider |

Invalid or placeholder values stop the server at startup (`[qrobo] configuration error`).

### Gmail (free, good for low volume)
1. Turn on 2-Step Verification on the Google account, then create an **App Password**
   (Google Account → Security → App passwords).
2. `EMAIL_PROVIDER=smtp`, `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`,
   `SMTP_USER=chirrauday02@gmail.com`, `SMTP_PASS=<16-character app password>`,
   `EMAIL_FROM="Qrobo <chirrauday02@gmail.com>"`.
3. Gmail limits sending (about 500/day) and From must be the Gmail address. For a real store use a
   domain with Amazon SES (SMTP credentials work with `EMAIL_PROVIDER=smtp`) or Resend, and set up
   SPF/DKIM/DMARC on the domain.

Never commit `SMTP_PASS`/`RESEND_API_KEY`; keep them in `frontend/.env.local` (gitignored) or SSM.

### Production retry timer (EC2)
```ini
# /etc/systemd/system/qrobo-email.service
[Service]
Type=oneshot
User=qrobo
WorkingDirectory=/srv/qrobo/app/frontend
EnvironmentFile=/etc/qrobo/app.env
ExecStart=/usr/bin/node node_modules/tsx/dist/cli.mjs scripts/email/flush.ts

# /etc/systemd/system/qrobo-email.timer
[Timer]
OnCalendar=*-*-* *:*:00
[Install]
WantedBy=timers.target
```
`systemctl enable --now qrobo-email.timer`

## Migration
`backend/postgres/migrations/0002_email_profile_settings.sql` (additive): `users.email_verified_at`,
notification columns on `profiles`, `email_tokens`, `email_outbox`. Apply with `npm run db:migrate`.
Existing users are unverified until they use a verification or reset link.
`0003_ecommerce_email.sql` (additive): `orders.courier/tracking_number/tracking_url`, `newsletter_subscribers`.

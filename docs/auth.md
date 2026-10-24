# Authentication and authorization

Applies to `DATA_SOURCE=postgres`. (Mock mode has no accounts: sign-in returns a clear "not available on the demo site" message.)

## Design

| Concern | Implementation |
|---|---|
| Passwords | bcrypt (`bcryptjs`, cost 12), 8–72 bytes enforced (no silent truncation); only the hash is stored |
| Sessions | 32 random bytes in an HttpOnly cookie; DB stores SHA-256(token) in `sessions`; 7-day absolute expiry; `last_seen_at` refreshed hourly |
| Cookie | `__Host-qrobo_session` + `Secure` in production (`qrobo_session` over http in dev); `SameSite=Lax`; `Path=/` |
| CSRF | SameSite=Lax + every state-changing endpoint requires JSON and a same-origin `Origin` header (`APP_ORIGINS` for extra origins) |
| Logout | deletes the session row (a copied cookie stops working) |
| Password change | revokes all of the user's sessions, issues a new one |
| Rate limits | login 20/15 min per IP and 5/15 min per IP+email; register 5/h per IP; password change 5/15 min; checkout 10/min per user. In-process (single instance) |
| Enumeration | login returns the same message/status for unknown email and wrong password, and runs a dummy bcrypt compare for unknown accounts. Registration of an existing email returns a generic `409` (see limitations) |
| Validation | zod schemas on every body; unknown fields ignored (auth) or rejected (data gateway) |
| Identity | user id and role are read from the database on every request via the session; nothing from the browser is trusted (role, user id, price, discount, total, payment status) |

## Authorization rules (enforced server-side)

* Registration always creates `role = 'customer'`; there is no way to pass a role.
* `profiles.role` is not writable through any API. Admins are created only by
  `scripts/db/promote-admin.ts` (operator with database access).
* Catalog/content writes (products, categories, brands, banners, promo cards, deals, coupons,
  projects, tutorials, project components) require `admin`.
* Customers cannot create or modify orders except through `/api/checkout`; admins can change only
  `orders.status`. Nobody can set `payment_status` through the API; only a signature-verified
  payment webhook can mark an order paid.
* Carts, cart items, wishlists and addresses are always scoped to the session user (even admins).
  Orders, order items and profiles are scoped to the owner for customers.
* `users`, `sessions`, `inventory_transactions`, `payment_events` are not reachable.
* `/admin/*` pages are client-rendered shells; the role check in `app/admin/layout.tsx` is only UX.
  Every admin data read/write is rejected by the API for non-admins (`403`), including direct
  requests that bypass the UI.

These rules are covered by `tests/unit/gateway.test.ts` and `tests/integration/api.test.ts`.

## Creating the first administrator

1. The administrator registers on `/register` with their own password.
2. An operator runs, with the migration role credentials:
   ```bash
   cd frontend
   npx tsx --env-file=.env.migrate scripts/db/promote-admin.ts admin@your-domain.example
   ```
3. Revoke with `--demote`. There is no default admin and no hard-coded password.

## Known limitations
* Email verification and password reset exist (docs/email.md) but need a configured provider to
  reach real inboxes. Registration still reveals whether an email already has an account (generic
  `409`); rate limiting reduces bulk probing. Unverified accounts can shop; only admin promotion
  requires verification.
* Password change requires the current password; reset by email revokes all sessions.
* Admin bootstrap: `ADMIN_EMAILS` addresses are promoted only after email verification, or via
  `scripts/db/bootstrap-admin.ts` (operator).
* The rate limiter is per process; use a shared store if more than one app instance runs.

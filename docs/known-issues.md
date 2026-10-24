# Unresolved security and implementation issues

Ordered roughly by severity. "Blocker" = fix before taking real customers.

| # | Severity | Issue | Notes / next step |
|---|---|---|---|
| 1 | ~~Blocker~~ Resolved (Phase 8) | Next.js 13.5.1 security advisories | Upgraded to Next.js 16.4.2 (Active LTS) + React 19.3.1. `npm audit`: 29 (3 critical) → 9 (0 critical, 7 high, 2 moderate). See docs/nextjs-16-upgrade.md |
| 1a | High | **Remaining `npm audit` findings (7 high, 2 moderate)** in build/lint tooling: `braces` (no patched version exists) via Tailwind CSS 3.3.3 and `eslint-config-next` 16; `postcss-selector-parser`/`postcss-nested` via Tailwind 3 | Not in the server runtime. Fix requires migrating to Tailwind CSS 4 (CSS rewrite → needs visual review). Re-check `npm audit` after each eslint-config-next release |
| 1b | High | **Node.js 20 is end-of-life (30 Apr 2026).** The workstation runs 20.20.1 | Use Node 24 LTS (or 22 LTS) on EC2 (docs/aws-deployment.md) and upgrade local Node; re-run tests |
| 1c | Medium | 18 new lint errors from React Compiler rules (`react-hooks/set-state-in-effect` 15, `immutability` 2, `purity` 1) in existing pages/contexts | Existing patterns, not regressions; refactor gradually with UI re-verification |
| 2 | Blocker | **Online payment is not implemented.** Only Cash on Delivery works; Razorpay order creation and checkout-callback verification are missing (webhook signature verification exists and is tested) | Implement server-side Razorpay order creation in `lib/server/payments/`, store `razorpay_order_id` on the order, verify callback + webhook before marking paid |
| 3 | Medium (was High) | Email verification, password reset and order emails are implemented (docs/email.md), but **no real provider is configured** (`EMAIL_PROVIDER=log` only prints). Sign-up still returns a generic `409` for existing emails (reveals account existence); unverified users can still shop | Configure SMTP/SES/Resend + SPF/DKIM; optionally require verification before checkout and make sign-up respond identically |
| 4 | High | No admin UI to record COD payment receipt; COD orders stay `payment_status = pending`, so the admin dashboard "Total Revenue" (paid orders only) shows 0 | Add a dedicated, audited admin endpoint for COD settlement |
| 5 | Medium | Rate limiting is in-process memory | Fine for one EC2 instance; move to a shared store before scaling out |
| 6 | Medium | No Content-Security-Policy header (other security headers are set) | Needs nonce/hash work for Next.js inline scripts |
| 7 | ~~Medium~~ Resolved | Password change now requires the current password (`/api/auth/password` + Settings UI) | — |
| 7a | Low | Admin → Settings "Store information" is display-only; marketing emails are a stored preference only | Add store settings table / campaign sending later |
| 8 | Medium | Mock mode is unchanged legacy code: its query builder breaks on `insert().select()` / `update().eq()` chains, so admin edits and checkout do not work in mock mode | Expected to be retired once PostgreSQL mode is accepted |
| 9 | Medium | The cart page coupon is display-only and is not carried to checkout; the checkout page (and therefore the server order) has no coupon. `/api/checkout` supports `coupon_code` | Pass the applied coupon from the cart to checkout in the UI |
| 10 | Low | Products that appear in orders cannot be hard-deleted (FK `RESTRICT`); the admin UI shows "Failed to delete product" | Unpublish instead; optionally show a clearer message |
| 11 | Low | Guest carts saved in the browser during mock mode contain mock ids (`prod-…`) and are dropped when merged in PostgreSQL mode | One-time effect after the switch |
| 12 | Low | Seeded deals expire 3–10 days after the seed runs; coupons after 90–365 days | Adjust in Admin before launch |
| 13 | Low | Product images are hot-linked generic Pexels stock photos (not photos of the actual products); seeded prices/stock are demo values | Business decision; image migration to own storage is a separate approved phase |
| 15 | Low | A misconfigured server exits (code 1) shortly after it starts listening (still true on Next.js 16.4.2) | `scripts/check-config.ts` runs as systemd `ExecStartPre` so it never starts at all |
| 16 | Info | Pre-existing lint errors (8 × `react/no-unescaped-entities`) and 25 warnings are unchanged | Cosmetic; `next build` (16) does not run lint |
| 16a | Info | Netlify config (`netlify.toml`, `@netlify/plugin-nextjs` 5.15.1) was not tested with Next.js 16 | AWS EC2 is the documented target; remove or update if Netlify is not used |
| 17 | Info | Integration tests download PostgreSQL binaries via the `embedded-postgres` dev dependency (beta tag) | CI needs npm registry access; set `QROBO_SKIP_DB_TESTS=1` to skip (reported as skipped) |
| 18 | Info | Customer review submission does not exist in the UI; review moderation does | — |

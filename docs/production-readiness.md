# Production readiness checklist

Status legend: ✅ done and verified locally · ⬜ not done / requires AWS or a decision.
"Verified locally" means automated tests against a disposable PostgreSQL 17 server and a
`next start` smoke run on Windows; nothing has been verified on AWS.

## Application
- ✅ Existing UI unchanged in mock mode (pre-rendered markup 23/23 pages and CSS byte-identical to the pre-change build)
- ✅ All pages return 200 in PostgreSQL mode (smoke run); product/banner image URLs identical to `mock-data.ts`
- ✅ Mock mode remains the default; PostgreSQL mode fails closed (no silent mock fallback)
- ✅ Server-only DB module; no DB driver, bcrypt, server modules or secret names in client bundles
- ✅ Parameterized SQL everywhere; allowlisted identifiers
- ✅ Next.js 16.4.2 (Active LTS) + React 19.3.1; 0 critical advisories (docs/nextjs-16-upgrade.md)
- ✅ Typecheck passes; production build (Turbopack) passes in both modes
- ✅ 76 automated tests pass on Next 16 (47 unit + 29 integration on real PostgreSQL)
- ⬜ `npm audit` not clean: 7 high + 2 moderate in build/lint tooling (Tailwind 3, eslint-config-next) — docs/known-issues.md #1a
- ⬜ Node 24/22 LTS on the server (Node 20 is EOL) — #1b
- ⬜ 18 new React-Compiler lint errors in existing pages — #1c
- ⬜ Manual browser walkthrough of every page in PostgreSQL mode (only HTTP status + API behaviour were automated)
- ⬜ Content-Security-Policy

## Data
- ✅ Versioned, checksummed, transactional migrations; seeds idempotent
- ✅ Demo catalog preserved (42 products, image galleries in order, 16 project components)
- ⬜ Decide which catalog data is real; replace demo prices/stock
- ⬜ Update deal/coupon expiry dates

## Auth & security
- ✅ bcrypt hashing, DB sessions, `__Host-` HttpOnly Secure SameSite=Lax cookie, logout revocation
- ✅ Role/user id/prices/totals/payment status never trusted from the browser
- ✅ Rate limits on login/register/password/checkout
- ✅ Admin provisioning by operator script only
- ⬜ Email verification + password reset
- ⬜ Shared rate-limit store if scaling beyond one instance

## Checkout & payments
- ✅ Server-side pricing, coupon validation, stock locking, transactional order creation, rollback, idempotency, concurrency (tested)
- ✅ COD orders never marked paid automatically; online payment returns explicit `payment_unavailable`
- ✅ Webhook HMAC verification, replay protection, amount check (tested)
- ⬜ Razorpay order creation + callback verification — **blocker for online payment**
- ⬜ COD settlement flow for admins

## AWS (docs/aws-deployment.md) — none provisioned
- ⬜ VPC/private subnets, security groups (`5432` only from the app SG)
- ⬜ RDS: encrypted, not public, backups ≥ 7 days, deletion protection, `rds.force_ssl`
- ⬜ DB roles `qrobo_migrator` / `qrobo_app` (roles.example.sql)
- ⬜ RDS CA bundle installed and verified with `openssl s_client`
- ⬜ Secrets in SSM Parameter Store/Secrets Manager; EC2 IAM role (no access keys)
- ⬜ EC2 + systemd (with `check-config` preflight) + nginx + Let's Encrypt + DNS
- ⬜ CloudWatch logs/alarms; uptime check on `/api/health`
- ⬜ Restore drill from an RDS snapshot / point-in-time recovery

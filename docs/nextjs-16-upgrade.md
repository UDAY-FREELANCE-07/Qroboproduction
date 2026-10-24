# Phase 8: Next.js 16 security upgrade (23 Oct 2026)

## Why 16.4.2
* Official support policy (nextjs.org/support-policy, checked 23 Oct 2026): 16.x is **Active LTS**;
  15.x was Maintenance LTS until 21 Oct 2026 (two years after its release), 14.x and 13.x are unsupported.
* 16.4.1 / 15.5.28 (14 Oct 2026) are the patched releases for the latest out-of-band advisories
  (two critical unauthenticated RCEs and a high-severity DoS). 16.4.2 (15 Oct 2026) is the current `latest`.
* `npm audit` on 13.5.1 reported a **critical** advisory set against `next` itself.

Recovery copy taken before any dependency change: `backups/pre-phase8-nextjs-upgrade-20261023-141140.zip`
(includes `package.json` and `package-lock.json`). The lockfile was updated in place, never deleted;
no `--force` / `--legacy-peer-deps` was used.

## Dependency changes (`frontend/package.json`, all pinned exactly)

| Package | Before | After | Reason |
|---|---|---|---|
| next | 13.5.1 | 16.4.2 | security / supported LTS |
| @next/swc-wasm-nodejs | 13.5.1 | 16.4.2 | must match `next` |
| eslint-config-next | 13.5.1 | 16.4.2 | must match `next` |
| eslint | 8.49.0 | 9.39.5 | required by eslint-config-next 16 |
| react, react-dom | 18.2.0 | 19.3.1 | App Router in Next 16 runs React 19 |
| @types/react, @types/react-dom | 18.2.22 / 18.2.7 | 19.3.0 | React 19 types |
| @types/node | 20.6.2 | 20.19.43 | vite 7 (vitest 4) peer requires ≥ 20.19 |
| cmdk | ^1.0.0 | 1.1.1 | React 19 peer support |
| embla-carousel-react | ^8.3.0 | 8.6.0 | React 19 peer support |
| input-otp | ^1.2.4 | 1.5.0 | React 19 peer support |
| next-themes | ^0.3.0 | 0.4.6 | React 19 peer support |
| react-day-picker | ^8.10.1 | 9.14.0 | **major**; v8 has no React 19 support |
| react-resizable-panels | ^2.1.3 | 2.1.9 | React 19 peer support |
| recharts | ^2.12.7 | 2.15.4 | React 19 peer support |
| sonner | ^1.5.0 | 1.7.4 | React 19 peer support |
| vaul | ^0.9.9 | 1.1.2 | React 19 peer support |
| postcss | 8.4.30 | 8.5.31 | high-severity advisory |
| vitest (dev) | 3.2.4 | 4.1.12 | critical advisories in vitest/tinypool, fixed only in 4.x |
| @radix-ui/* (27 packages) | — | lockfile only | updated within existing `^` ranges (`npm update`) for React 19 peers |
| tailwindcss | 3.3.3 | **3.3.3 (unchanged)** | see "Not changed" |

## Code / config changes required by the upgrade
| File | Change |
|---|---|
| `next.config.js` | `experimental.serverComponentsExternalPackages` → `serverExternalPackages`; removed `experimental.instrumentationHook` (stable) and the removed `eslint` key |
| `eslint.config.mjs` (new), `.eslintrc.json` (removed) | ESLint 9 flat config using `eslint-config-next/core-web-vitals` (same rule set name as before) |
| `package.json` `lint` script | `next lint` (removed in 16) → `eslint app components lib` (same directories `next lint` checked) |
| `app/shop/layout.tsx`, `app/account/layout.tsx`, `app/order-success/layout.tsx` (new) | `<Suspense>` boundary required for `useSearchParams()`; renders no markup |
| `components/ui/calendar.tsx` | ported to the react-day-picker v9 API (component is not used by any page) |
| `app/checkout/page.tsx` | idempotency key now `useState(newIdempotencyKey)` instead of a ref read during render (flagged by the new React Compiler lint rules) — same behaviour |
| `tsconfig.json` | rewritten by Next: `jsx: react-jsx`, `.next/dev/types/**/*.ts` added to `include` |

No changes were needed in API routes, auth, gateway policies, checkout transactions, payment
verification, migrations, seeds or `lib/mock-data.ts` (checksums unchanged).

## Not changed (deliberately)
* **Tailwind CSS stays 3.3.3.** 3.4.19 was tried; it generated different CSS rules (e.g. removed
  `.left-1/.right-1/.pl-2`, changed placeholder selectors), so it was reverted to keep the UI byte-for-byte
  equivalent. The only audit "fix" for Tailwind's dependency chain is Tailwind 4 (a rewrite), which needs a
  separate, visually reviewed migration.
* No `npm audit fix --force`.

## Behaviour notes
* `next build` now uses **Turbopack** and no longer runs ESLint.
* 13.5 rendered `/shop`, `/account`, `/order-success` with an empty static shell (client bailout).
  16 prerenders the layout (header/footer) for those routes; page content still renders on the client,
  exactly as before.
* Next 16 adds an empty `<div hidden>` metadata container and the toaster's empty `<section aria-label="Notifications">`
  is now server-rendered. Neither is visible.
* Node.js ≥ 20.9 is required by Next 16; vitest 4/vite 7 need ≥ 20.19. **Node 20 reached end-of-life on
  30 Apr 2026** — use Node 24 LTS (or 22 LTS) on EC2. This workstation still runs 20.20.1.

## Verification results (local, Windows, 23 Oct 2026)

| Check | Result |
|---|---|
| `npm ls --all` | exit 0 (no invalid/missing/extraneous packages) |
| `tsc --noEmit` | pass, 0 errors |
| `next build` mock mode | pass; 24 static + 9 API routes + 3 dynamic pages |
| `next build` postgres mode | pass |
| Vitest | **76/76 passed** — 47 unit, 29 integration; integration tests executed against a real disposable PostgreSQL 17.6 server (each listed with timing in verbose output, none skipped) |
| Lint | see below |
| Client bundles (both modes) | no `pg`, bcrypt, `lib/server`, password/token hashes, or secret variable names |
| Mock data + 7 original SQL files | SHA-256 unchanged |

### UI comparison
Baseline = Next 13.5 build/dev before any change; after = Next 16.4.2.
* **Static HTML (`next build` output)**: 20/23 pages identical after removing framework-generated
  ids (Radix `aria-controls`, `useId`), the two invisible containers above, scripts and `<link>` tags.
  The other 3 are the routes that 13.5 left empty (see above).
* **Rendered DOM (headless Edge, 18 routes incl. products, deals, projects, tutorials, 404)**: every page
  has the **same image URLs in the same order, the same visible text, and the same elements/classes**,
  apart from the single `<div hidden>` container.
* **Screenshots (1366 px)**: login / shop / product / deals differ in 0.2–0.4 % of pixels, all in the
  scrolling announcement marquee (animation position) and live deal countdowns. Home differs 7.8 %
  only because the hero carousel was on a different slide (auto-rotates every 5 s); the dev-vs-dev
  comparison of the same page differs 0.8 % (marquee/countdown/carousel timing).
* **CSS**: not byte-identical because Turbopack minifies with Lightning CSS instead of cssnano:
  equivalent rewrites (`rgba(0,0,0,.1)` → `#0000001a`, `transparent` → `#0000`, `33.333333%` → `33.3333%`,
  merged/split selectors, explicit `transform`/`filter` per utility). The set of utility classes is the same
  except unused `.left-1`/`.right-1` (only used by the old calendar) and new `.inset-x-1`/`.top-1` (new calendar).
* Pre-existing (not caused by the upgrade): on this Windows machine, 13.5 production builds referenced no
  stylesheet in prerendered HTML (verified on both older backups). 16.4.2 production pages include the
  stylesheet correctly.

### PostgreSQL-mode smoke test (real `next start`, disposable TLS PostgreSQL, no AWS)
* TLS verify-full: connects with the CA bundle; rejects an unknown CA (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`)
  and a hostname mismatch (`ERR_TLS_CERT_ALTNAME_INVALID`).
* Migrations and seeds idempotent; demo seed refused with `NODE_ENV=production`; `check-config` preflight refuses missing config.
* Fail-closed start (exit 1 with a clear message): missing `DATABASE_URL`, placeholder URL,
  build/runtime `DATA_SOURCE` mismatch, `DATABASE_SSL=disable` in production.
* All 15 pages 200; health `{"status":"ok","dataSource":"postgres","database":"ok"}`.
* Session cookie `__Host-qrobo_session`, HttpOnly, Secure, SameSite=Lax, Path=/; logout invalidates the session server-side.
* Registration with `role: "admin"` → `customer`; cross-origin POST 403; form-encoded POST 415;
  customer catalog write 403; role self-update 400; anonymous order read 401; admin write 200 after
  `promote-admin`.
* Checkout: 3 concurrent requests + 1 retry with the same idempotency key → statuses 201/200/200/200,
  **one** order, stock decremented once (150 → 148), `payment_status = pending`; online payment →
  `payment_unavailable`.
* DB password never appears in server logs.

### Lint (ESLint 9 + eslint-config-next 16, same directories)
| | Before (13.5) | After (16.4.2) |
|---|---|---|
| `react/no-unescaped-entities` (error) | 8 | 8 |
| `@next/next/no-img-element` (warning) | 23 | 23 |
| `react-hooks/exhaustive-deps` (warning) | 2 | 2 |
| **New React Compiler rules** (error) | – | 18: `set-state-in-effect` 15, `immutability` 2, `purity` 1 |
| Total | 8 errors / 25 warnings | 26 errors / 25 warnings |

The 18 new errors come from rules added in eslint-plugin-react-hooks 7 (bundled with
eslint-config-next 16). They flag existing data-loading patterns (`setState` inside `useEffect`) in
pages/contexts; they are not regressions and the build/runtime are unaffected. They were left unchanged to
avoid behavioural edits to working pages; see docs/known-issues.md.

## npm audit
| Severity | Before (13.5.1) | After |
|---|---|---|
| critical | 3 | **0** |
| high | 20 | 7 |
| moderate | 6 | 2 |
| low | 0 | 0 |
| **total** | **29** | **9** |

Remaining 9 (all build/lint tooling; none is the Next.js runtime, React, pg or bcrypt):
* `braces` ≤ 3.0.3 (no patched release exists) → `micromatch` → `chokidar`/`fast-glob` → `tailwindcss` 3.3.3 and
  `@next/eslint-plugin-next` → `eslint-config-next`. Audit's only fixes are Tailwind 4 or *downgrading*
  eslint-config-next to 14 — both rejected.
* `postcss-selector-parser` < 7.1.6 and `postcss-nested` via Tailwind 3 (moderate).
These run only at build/lint time on our own source globs (no untrusted input). `npm audit --omit=dev`
also reports 9 because the original project template placed build tools in `dependencies`. **The audit is not clean.**

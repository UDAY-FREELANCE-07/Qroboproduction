# Database architecture

## Request path

```
Browser (existing pages/components, unchanged UI)
  └─ lib/data-client.ts → DATA_SOURCE=mock     : in-memory demo data, lib/mock-data.ts (default)
                        → DATA_SOURCE=postgres : lib/api-client.ts (same call shapes)
        └─ fetch /api/*  (Next.js Route Handlers, Node runtime)
              ├─ /api/auth/*        sessions (lib/server/auth)
              ├─ /api/data          policy-enforced data gateway (lib/server/gateway)
              ├─ /api/checkout      transactional order creation (lib/server/checkout.ts)
              └─ /api/payments/...  webhook verification (lib/server/payments)
                    └─ lib/server/db.ts (server-only pg Pool)  ── TLS (verify-full) ──▶ Amazon RDS for PostgreSQL
```

* The browser never talks to PostgreSQL. `lib/server/**` is server-only (`import 'server-only'` on
  modules that touch the pool/session); the production build was checked to contain no `pg`,
  bcrypt, server-module or secret-variable references in client chunks.
* Mock mode and PostgreSQL mode are never mixed in one response: the mode is a build-time flag
  (`NEXT_PUBLIC_QROBO_DATA_SOURCE`, derived from `DATA_SOURCE`) and the server refuses to run when
  the runtime value differs.

## Why a data gateway instead of ~40 bespoke endpoints

About 25 existing pages call `dataClient.from(table).select(...).eq(...)`. To keep the UI untouched,
`lib/api-client.ts` keeps that interface and sends a declarative description of the query to
`POST /api/data`. The server treats it as untrusted input:

* tables, columns, operators and relations are checked against static allowlists
  (`gateway/schema.ts`, `gateway/policies.ts`) and quoted; all values are bind parameters;
* the session determines identity and role; owner scoping is added to every statement;
* catalog writes are admin-only, `profiles.role` and order payment fields are never writable,
  internal tables (`users`, `sessions`, `inventory_transactions`, `payment_events`) are unreachable;
* page sizes are capped (200 for non-admins, 1000 for admins).

Operations that need business logic (auth, checkout, payments) have dedicated endpoints.

## Schema

Migration `backend/postgres/migrations/0001_init_schema.sql` (standard PostgreSQL ≥ 13).
Table/column names match the UI row types in `lib/data-client.ts`. Later additive migrations:
`0002_email_profile_settings.sql` (docs/email.md).

| Area | Tables | Notes |
|---|---|---|
| Identity | `users`, `sessions`, `profiles` | bcrypt hash only; session token stored as SHA-256; `profiles.role` ∈ customer/admin |
| Catalog | `categories`, `brands`, `products` | `products.images text[]` keeps gallery order; prices `numeric(10,2)` with `>= 0` checks; category/brand deletes `RESTRICT` |
| Content | `banners`, `promo_cards`, `deals`, `projects`, `project_components`, `tutorials` | image references are URLs only; no binaries in the DB |
| Promotions | `coupons` | `used_count` maintained by checkout only |
| Shopping | `carts` (one per user), `cart_items` (unique per product), `wishlists`, `addresses` | |
| Orders | `orders`, `order_items` | `UNIQUE (user_id, idempotency_key)`; item snapshots (name, image, price); products in orders cannot be hard-deleted |
| Payments | `payment_events` | provider event ids for idempotent webhooks; no card data, no provider secrets |
| Operations | `inventory_transactions` | written by checkout (`sale`), never exposed |
| Bookkeeping | `schema_migrations`, `seed_history` | created by the migration runner |

Money: the pool parses `NUMERIC` to JS numbers (the UI expects numbers); server-side totals are
computed in integer paise (`lib/server/pricing.ts`).

## Connection pool and RDS sizing

* One `pg.Pool` per Node process (`DATABASE_POOL_MAX`, default 10), idle timeout 30 s, connect
  timeout 5 s, `statement_timeout` 15 s. Not serverless; EC2 runs a long-lived process.
* Connections needed ≈ `instances × DATABASE_POOL_MAX` + migration run (1) + operator sessions.
  One EC2 instance: ~10–15.
* RDS `max_connections` depends on instance memory (default formula
  `LEAST(DBInstanceClassMemory/9531392, 5000)`; small burstable classes allow roughly 80–100+).
  Check with `SHOW max_connections;` and keep usage under ~70 %.
* Monitor `DatabaseConnections` in CloudWatch and
  `SELECT state, count(*) FROM pg_stat_activity WHERE datname = current_database() GROUP BY 1;`.

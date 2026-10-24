# Migrations and seed data

## Files

| Path | Purpose |
|---|---|
| `backend/postgres/migrations/NNNN_*.sql` | Versioned schema migrations for standard PostgreSQL / RDS |
| `backend/postgres/seeds/2026091806*_seed_*.sql` (6 files) | Demo seed data. **Source of truth for the demo catalog**, executed unmodified |
| `backend/postgres/roles.example.sql` | Template for the `qrobo_migrator` / `qrobo_app` roles (run manually) |
| `frontend/lib/mock-data.ts` | Mock-mode data, generated earlier from the same seed files. Not modified |

### Source of truth for the catalog

The seed SQL and `mock-data.ts` contain the same 42 products, 21 categories, 15 brands,
3 banners, 2 promo cards, 10 deals, 4 coupons, 6 projects and 8 tutorials, with identical image
URLs and gallery order (verified by `tests/integration/migrations.test.ts`). The seed SQL also has
**16 `project_components` rows** that the mock data lacks; PostgreSQL mode therefore shows the
components list on project pages, mock mode does not. The seed SQL is the source of truth.

All of this is **demo content**: prices, stock levels and SKUs are not verified inventory.
Tables with no seed data: `users`, `profiles`, `sessions`, `orders`, `order_items`, `reviews`,
`carts`, `cart_items`, `wishlists`, `addresses`, `inventory_transactions`, `payment_events`.

## Commands (run from `frontend/`)

Credentials come from the environment only. Use the migration role:

```bash
# local file with MIGRATION_DATABASE_URL, DATABASE_SSL, DATABASE_SSL_CA_FILE (gitignored: .env.*)
npx tsx --env-file=.env.migrate scripts/db/status.ts
npx tsx --env-file=.env.migrate scripts/db/migrate.ts
npx tsx --env-file=.env.migrate scripts/db/seed.ts          # demo catalog
npx tsx --env-file=.env.migrate scripts/db/promote-admin.ts person@example.com
```

`npm run db:migrate|db:seed|db:status|db:promote-admin` run the same scripts with the current
environment.

## Safety properties

* Each file runs in its own transaction; a failure rolls that file back and stops.
* A transaction-scoped advisory lock serializes concurrent runs.
* Applied files are recorded with a SHA-256 checksum. Re-running is a no-op. An **edited**
  applied migration aborts with an error — add `0002_*.sql` instead of editing `0001`.
* Seeds are recorded per file in `seed_history`, so tables without natural keys (banners,
  promo_cards, deals, project_components) are never duplicated.
* `seed.ts` refuses to run with `NODE_ENV=production` unless `ALLOW_DEMO_SEED=yes`, so demo data
  is never loaded into production by accident.
* Deal/coupon expiry dates in the seeds are relative to the time the seed runs
  (`now() + interval ...`); re-seed or edit them in the admin UI before launch.

## Rollback

There are no automatic down-migrations. Before every production migration take an RDS snapshot
(see docs/aws-deployment.md); to roll back, restore the snapshot or ship a corrective migration.

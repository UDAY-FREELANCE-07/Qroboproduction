# QROBO frontend (Next.js app + API)

Next.js 16.4.2 App Router app (React 19.3.1, Turbopack builds; Node.js ≥ 20.19, Node 24 LTS recommended).
It serves the existing UI **and** the server API (`app/api/**`). Upgrade notes: `../docs/nextjs-16-upgrade.md`.
There is no separate backend server.

## Data sources

| `DATA_SOURCE` | Behaviour |
|---|---|
| `mock` (default) | Unchanged original behaviour: pages read `lib/mock-data.ts` through the legacy client. API routes return 503. |
| `postgres` | Pages call the Next.js API (`lib/api-client.ts`); the API talks to PostgreSQL (Amazon RDS in production). |

`DATA_SOURCE` is used at **build time** (browser bundle) and at **run time**; the server refuses to
start (production) if they differ or if the database configuration is missing/placeholder.

## Commands

```bash
npm ci
npm run dev                  # mock mode
npm run build && npm start   # production build (mock unless DATA_SOURCE=postgres)
npm run typecheck
npm run lint                 # ESLint 9 flat config; 26 known errors (8 pre-existing + 18 React Compiler rules), see docs/known-issues.md
npm test                     # unit + integration (starts a throwaway local PostgreSQL)
npm run test:unit            # no database needed
npm run check-config         # preflight: validates env without connecting
npm run db:status|db:migrate|db:seed|db:promote-admin   # see docs/migrations-and-seeds.md
```

### Local PostgreSQL mode
1. Create a local database and put in `frontend/.env.local` (gitignored):
   ```
   DATA_SOURCE=postgres
   DATABASE_URL=postgres://<user>:<password>@localhost:5432/qrobo_dev
   DATABASE_SSL=disable
   ```
2. `npx tsx --env-file=.env.local scripts/db/migrate.ts` and `... scripts/db/seed.ts`
   (the scripts use `MIGRATION_DATABASE_URL` if set, else `DATABASE_URL`).
3. `npm run dev`, register on `/register`, then
   `npx tsx --env-file=.env.local scripts/db/promote-admin.ts you@example.com` for admin access.

## Layout of server code

```
app/api/            route handlers (auth, data gateway, checkout, payments webhook, health)
lib/server/         server-only: config, db pool, http helpers, auth, gateway, pricing, checkout, payments, migrations
lib/api-client.ts   browser client for postgres mode (calls the Next.js API)
lib/data-client.ts  picks the mock client or the API client by DATA_SOURCE; row types
scripts/db/         migration / seed / admin CLI (tsx)
tests/              vitest unit + integration tests
```

Docs: `../docs/` (architecture, API reference, auth, migrations, AWS deployment, readiness, known issues).

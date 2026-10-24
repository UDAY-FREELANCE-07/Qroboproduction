# QROBO backend assets

The server code runs inside the Next.js app (`frontend/app/api`, `frontend/lib/server`); there is no
separate backend process. This folder holds the database assets and server environment template.

| Path | What it is | Status |
|---|---|---|
| `postgres/migrations/0001_init_schema.sql` | Schema for standard PostgreSQL / Amazon RDS (users, sessions, catalog, cart, orders, payments, inventory) | **Active** — applied by `npm run db:migrate` |
| `postgres/seeds/2026091806*_seed_*.sql` (6) | Demo catalog seed data (INSERT only) | **Active** ? applied by `npm run db:seed` |
| `postgres/roles.example.sql` | Least-privilege roles template (`qrobo_migrator`, `qrobo_app`) | Template, run manually |
| `scripts/extract_seed.py` | Regenerates `frontend/lib/mock-data.ts` from the seeds | Do not run unless you intend to overwrite mock data |
| `scripts/parse-sql.js` | Unfinished stub | Unused |
| `.env.example` | Server-only variables (placeholders that are rejected at startup) | Template |

The original seven SQL files are unchanged (verified by checksum).

Docs: `../docs/database-architecture.md`, `../docs/migrations-and-seeds.md`,
`../docs/auth.md`, `../docs/aws-deployment.md`, `../docs/known-issues.md`.

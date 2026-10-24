# Qrobo.com

Electronics, robotics, IoT and STEM e-commerce store (Next.js 16 App Router + React 19 + Tailwind 3 + shadcn/ui),
with a Next.js server API prepared for Amazon RDS for PostgreSQL.

## Repository layout

```text
frontend/   Next.js app: UI (app/, components/), API routes (app/api), server code (lib/server),
            DB scripts (scripts/db), tests (tests/), configs, package.json
backend/    PostgreSQL migrations, demo seeds and role template (postgres/), seed tools,
            server env template
docs/       architecture, API, auth, migrations, AWS deployment, readiness checklist, known issues
netlify.toml  legacy Netlify config (base = frontend); AWS EC2 is the documented target
package.json  root convenience scripts forwarding to frontend/
```

## Quick start

```bash
cd frontend
npm ci
npm run dev        # http://localhost:3000, mock data (default)
npm test           # unit + integration tests (throwaway local PostgreSQL, no Docker/AWS)
```

PostgreSQL mode: set `DATA_SOURCE=postgres` plus the database variables from
`backend/.env.example` (see `frontend/README.md`). Deployment: `docs/aws-deployment.md` (nothing
is provisioned yet). Open issues: `docs/known-issues.md`.

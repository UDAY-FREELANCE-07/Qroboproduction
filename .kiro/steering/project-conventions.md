# QROBO project conventions

QROBO is an electronics / robotics e-commerce store. The app lives in `frontend/` (Next.js 16 App Router,
React 19, Tailwind 3, shadcn/ui, lucide-react). Database files live in `backend/postgres/`.

## UI and design
- Designs must look polished and production-ready, not generic templates. Pages should be fully featured.
- Stack for UI: JSX + Tailwind CSS classes, shadcn/ui components, React hooks, and `lucide-react` for icons
  and logos. Do not add other UI theme or icon packages unless really needed or the user asks for them.
- Keep existing product data, image URLs and gallery order unless the user asks for a visual change.

## Next.js rules
- Any component that uses client hooks (`useState`, `useEffect`, etc.) must start with `"use client"`.
- Avoid hydration mismatches such as "Extra attributes from the server: class,style" (no browser-only
  values in server-rendered markup, no nested `<a>` tags).

## Generated files (do not hand-edit)
- `frontend/components/ui/*` (shadcn/ui generated components)
- `frontend/hooks/use-toast.ts`
Change these only when the user explicitly asks; prefer wrapping them in new components instead.

## Safety
- Never print or commit secrets from `frontend/.env.local`.
- Verify changes with `npm run typecheck`, `npm test`, and `npm run build` (run inside `frontend/`).

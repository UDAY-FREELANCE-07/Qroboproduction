import { Suspense } from 'react';

// Next.js 15+ requires a Suspense boundary around client pages that call useSearchParams().
// Renders no markup of its own; matches Next 13's client-side rendering bailout for this route.
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>;
}

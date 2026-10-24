/** @type {import('next').NextConfig} */

// DATA_SOURCE is a BUILD-TIME choice for the browser bundle ("mock" default, or "postgres").
// The same value must be set at runtime; instrumentation.ts refuses to start on a mismatch.
const dataSource = (process.env.DATA_SOURCE || 'mock').trim().toLowerCase();
if (dataSource !== 'mock' && dataSource !== 'postgres') {
  throw new Error(`DATA_SOURCE must be "mock" or "postgres" (got "${dataSource}").`);
}

const nextConfig = {
  // Next.js 16: `next build` no longer runs ESLint (the old `eslint` key was removed); lint runs via `npm run lint`.
  images: { unoptimized: true },
  env: {
    // Not a secret: only tells client code whether to call the /api routes.
    NEXT_PUBLIC_QROBO_DATA_SOURCE: dataSource,
  },
  // Keep the PostgreSQL driver and bcrypt as normal Node modules on the server.
  // (Next.js 15+: renamed from experimental.serverComponentsExternalPackages; instrumentation.ts is stable.)
  serverExternalPackages: ['pg', 'bcryptjs'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

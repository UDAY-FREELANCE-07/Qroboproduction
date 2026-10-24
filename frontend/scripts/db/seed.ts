import { runSeeds } from '../../lib/server/migrations';
import { main, PATHS } from './_client';

// Seeds the DEMO catalog from the original seed SQL. Safe to re-run (each file is applied once).
// Deal and coupon expiry dates are computed relative to the time the seed runs.
main(async (client) => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'yes') {
    throw new Error('Refusing to load demo seed data with NODE_ENV=production. Set ALLOW_DEMO_SEED=yes to confirm.');
  }
  const applied = await runSeeds(client, PATHS.seedsDir, console.log);
  console.log(applied.length ? `Seeding complete (${applied.length} files applied).` : 'Seeds already applied; nothing to do.');
});

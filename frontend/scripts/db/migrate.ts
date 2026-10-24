import { runMigrations } from '../../lib/server/migrations';
import { main, PATHS } from './_client';

main(async (client) => {
  const applied = await runMigrations(client, PATHS.migrationsDir, console.log);
  console.log(applied.length ? `Migrations complete (${applied.length} applied).` : 'Schema is up to date.');
});

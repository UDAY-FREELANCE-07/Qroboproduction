import { migrationStatus } from '../../lib/server/migrations';
import { main, PATHS } from './_client';

main(async (client) => {
  const s = await migrationStatus(client, PATHS);
  for (const m of s.migrations) console.log(`migration ${m.applied ? '[x]' : '[ ]'} ${m.file}`);
  for (const f of s.seeds) console.log(`seed      ${f.applied ? '[x]' : '[ ]'} ${f.file}`);
});

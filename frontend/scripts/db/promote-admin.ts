/**
 * Controlled administrator provisioning.
 *
 *   1. The person registers normally through /register (they choose their own password).
 *   2. An operator with database access runs:
 *        npx tsx --env-file=.env.migrate scripts/db/promote-admin.ts person@example.com
 *
 * There is no default admin account and no password is ever passed to this script.
 * Use --demote to revoke admin rights.
 */
import { main } from './_client';

main(async (client) => {
  const args = process.argv.slice(2);
  const demote = args.includes('--demote');
  const email = args.find((a) => !a.startsWith('--'))?.trim().toLowerCase();
  if (!email || !email.includes('@')) throw new Error('Usage: promote-admin.ts <email> [--demote]');
  const role = demote ? 'customer' : 'admin';
  const res = await client.query(
    `UPDATE profiles SET role = $2 WHERE id = (SELECT id FROM users WHERE email = $1) RETURNING id`,
    [email, role],
  );
  if (!res.rowCount) throw new Error('No registered user with that email. Ask them to register first.');
  // Existing sessions keep working; role is re-read from the database on every request.
  console.log(`${email} is now ${role}.`);
});

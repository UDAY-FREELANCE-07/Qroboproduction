/**
 * Operator command: make an already-registered account an admin and (optionally) set its name.
 *
 *   npx tsx --env-file=.env.migrate scripts/db/bootstrap-admin.ts chirrauday02@gmail.com --name "Uday"
 *
 * No password is ever passed or created here: the person registers on /register with their own
 * password first. Alternative without database access: put the address in ADMIN_EMAILS and the
 * account is promoted automatically when the owner clicks the verification link.
 */
import { main } from './_client';

main(async (client) => {
  const args = process.argv.slice(2);
  const nameIdx = args.indexOf('--name');
  const name = nameIdx > -1 ? args[nameIdx + 1]?.trim() : undefined;
  const email = args.find((a, i) => !a.startsWith('--') && (nameIdx === -1 || i !== nameIdx + 1))?.trim().toLowerCase();
  if (!email || !email.includes('@')) throw new Error('Usage: bootstrap-admin.ts <email> [--name "Full Name"]');
  if (name !== undefined && (name.length === 0 || name.length > 120)) throw new Error('--name must be 1-120 characters.');

  const res = await client.query(
    `UPDATE profiles SET role = 'admin', full_name = COALESCE($2, full_name)
      WHERE id = (SELECT id FROM users WHERE email = $1) RETURNING full_name`,
    [email, name ?? null],
  );
  if (!res.rowCount) throw new Error('No registered user with that email. Register on /register first.');
  console.log(`${email} is now admin (name: ${res.rows[0].full_name ?? 'not set'}).`);
});

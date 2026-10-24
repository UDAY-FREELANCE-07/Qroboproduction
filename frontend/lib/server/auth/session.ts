import 'server-only';
import { randomBytes } from 'crypto';
import { hashToken } from './token-hash';
import type { NextResponse } from 'next/server';
import type { ClientBase } from 'pg';
import { query } from '../db';
import { ApiError } from '../http';

export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Production uses the `__Host-` prefix: browsers only accept it with Secure, Path=/ and no
 * Domain, so subdomains cannot plant or overwrite the session cookie.
 */
export const sessionCookieName = () => (isProduction() ? '__Host-qrobo_session' : 'qrobo_session');

export { hashToken };

export interface SessionUser {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  full_name: string | null;
  phone: string | null;
  email_verified: boolean;
}

export async function createSession(db: ClientBase | null, userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const sql = `INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, now() + make_interval(secs => $3))`;
  const params = [userId, hashToken(token), SESSION_TTL_SECONDS];
  if (db) await db.query(sql, params);
  else await query(sql, params);
  return token;
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: sessionCookieName(),
    value: token,
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({ name: sessionCookieName(), value: '', httpOnly: true, secure: isProduction(), sameSite: 'lax', path: '/', maxAge: 0 });
}

export function readSessionToken(req: Request): string | null {
  const header = req.headers.get('cookie');
  if (!header) return null;
  const name = sessionCookieName();
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      const value = part.slice(idx + 1).trim();
      return value.length >= 20 && value.length <= 200 ? value : null;
    }
  }
  return null;
}

/** Resolve the user from the session cookie. Role is always read from the database. */
export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const token = readSessionToken(req);
  if (!token) return null;
  const { rows } = await query<SessionUser & { session_id: string; stale: boolean }>(
    `SELECT u.id, u.email, p.role, p.full_name, p.phone, u.email_verified_at IS NOT NULL AS email_verified, s.id AS session_id,
            s.last_seen_at < now() - interval '1 hour' AS stale
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       JOIN profiles p ON p.id = u.id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)],
  );
  const row = rows[0];
  if (!row) return null;
  if (row.stale) await query('UPDATE sessions SET last_seen_at = now() WHERE id = $1', [row.session_id]);
  return { id: row.id, email: row.email, role: row.role, full_name: row.full_name, phone: row.phone, email_verified: row.email_verified };
}

export async function requireUser(req: Request): Promise<SessionUser> {
  const user = await getSessionUser(req);
  if (!user) throw new ApiError(401, 'unauthenticated', 'Please sign in to continue.');
  return user;
}

export async function requireAdmin(req: Request): Promise<SessionUser> {
  const user = await requireUser(req);
  if (user.role !== 'admin') throw new ApiError(403, 'forbidden', 'Administrator access required.');
  return user;
}

export async function destroySession(req: Request) {
  const token = readSessionToken(req);
  if (token) await query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)]);
}

/** Housekeeping: called opportunistically on login. */
export async function purgeExpiredSessions() {
  await query(`DELETE FROM sessions WHERE expires_at < now() - interval '1 day'`);
}

export function publicUser(u: SessionUser) {
  return {
    user: { id: u.id, email: u.email, email_verified: u.email_verified, user_metadata: { full_name: u.full_name } },
    profile: { id: u.id, full_name: u.full_name, role: u.role, phone: u.phone },
  };
}

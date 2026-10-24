import { createHash } from 'crypto';

/** SHA-256 hex of a random bearer token (session cookies, email links). */
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

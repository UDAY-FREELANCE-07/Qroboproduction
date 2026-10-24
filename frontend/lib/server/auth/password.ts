import bcrypt from 'bcryptjs';

/** bcrypt cost factor. ~250ms per hash on typical EC2 hardware; raise as hardware improves. */
export const BCRYPT_COST = 12;
/** bcrypt only uses the first 72 bytes, so longer inputs are rejected rather than silently truncated. */
export const PASSWORD_MAX_BYTES = 72;
export const PASSWORD_MIN_LENGTH = 8;

export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES) return `Password must be at most ${PASSWORD_MAX_BYTES} bytes.`;
  return null;
}

export function hashPassword(password: string, cost = BCRYPT_COST): Promise<string> {
  return bcrypt.hash(password, cost);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

let dummyHash: Promise<string> | undefined;
/** Burn equivalent CPU when the account does not exist, so response timing does not reveal it. */
export async function verifyAgainstDummy(password: string): Promise<false> {
  dummyHash ??= bcrypt.hash('qrobo-timing-equalizer', BCRYPT_COST);
  await bcrypt.compare(password, await dummyHash);
  return false;
}

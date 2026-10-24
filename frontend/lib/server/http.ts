import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ConfigError } from './config';
import { DataSourceDisabledError } from './db';

/** Error with an HTTP status and a client-safe message/code. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function ok<T>(data: T, init?: { status?: number; headers?: Record<string, string> }) {
  return NextResponse.json({ data, error: null }, { status: init?.status ?? 200, headers: noStore(init?.headers) });
}

export function fail(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    { data: null, error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status, headers: noStore() },
  );
}

function noStore(extra?: Record<string, string>) {
  return { 'Cache-Control': 'no-store', ...(extra ?? {}) };
}

/** Map PostgreSQL error codes to safe client responses. SQL text and values are never echoed. */
export function mapDbError(err: any): ApiError | null {
  switch (err?.code) {
    case '23505':
      return new ApiError(409, 'conflict', 'A record with the same unique value already exists.');
    case '23503':
      return new ApiError(409, 'in_use', 'This record is referenced by other data and cannot be changed or deleted.');
    case '23502':
      return new ApiError(400, 'missing_field', 'A required field is missing.');
    case '23514':
      return new ApiError(400, 'invalid_value', 'A value is outside the allowed range.');
    case '22P02':
    case '22003':
    case '22007':
    case '22008':
      return new ApiError(400, 'invalid_value', 'A value has an invalid format.');
    case '57014':
      return new ApiError(503, 'timeout', 'The request took too long. Please try again.');
    default:
      return null;
  }
}

export function toErrorResponse(err: unknown) {
  if (err instanceof ApiError) return fail(err.status, err.code, err.message, err.details);
  if (err instanceof ZodError) {
    return fail(400, 'validation_error', 'Invalid request.', err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })));
  }
  if (err instanceof DataSourceDisabledError) {
    return fail(503, 'data_source_disabled', 'This endpoint requires DATA_SOURCE=postgres.');
  }
  if (err instanceof ConfigError) {
    console.error('[api] configuration error:', err.message);
    return fail(503, 'service_unavailable', 'Service temporarily unavailable.');
  }
  const mapped = mapDbError(err);
  if (mapped) return fail(mapped.status, mapped.code, mapped.message);
  const code = (err as any)?.code;
  if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND' || /timeout|terminated/i.test(String((err as any)?.message))) {
    console.error('[api] database unavailable:', (err as Error).message);
    return fail(503, 'service_unavailable', 'Service temporarily unavailable.');
  }
  console.error('[api] unhandled error:', err);
  return fail(500, 'internal_error', 'Something went wrong.');
}

/** Wrap a route handler so every thrown error becomes a consistent JSON response. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

/**
 * CSRF defence for cookie-authenticated, state-changing requests:
 *  - session cookie is SameSite=Lax (set in session.ts), and
 *  - the request must be JSON and come from our own origin.
 */
export function assertSameOriginJson(req: Request) {
  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw new ApiError(415, 'unsupported_media_type', 'Requests must use Content-Type: application/json.');
  }
  const origin = req.headers.get('origin');
  if (!origin) throw new ApiError(403, 'forbidden_origin', 'Missing Origin header.');
  const allowed = new Set<string>();
  const url = new URL(req.url);
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? url.host;
  const proto = req.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
  allowed.add(`${proto}://${host}`);
  for (const o of (process.env.APP_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean)) allowed.add(o);
  if (!allowed.has(origin)) throw new ApiError(403, 'forbidden_origin', 'Cross-origin request rejected.');
}

export async function readJson(req: Request, maxBytes = 256 * 1024): Promise<unknown> {
  const text = await req.text();
  if (text.length > maxBytes) throw new ApiError(413, 'payload_too_large', 'Request body is too large.');
  if (text.trim() === '') return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(400, 'invalid_json', 'Request body is not valid JSON.');
  }
}

/**
 * Client IP for rate limiting. The documented nginx config sets X-Real-IP from $remote_addr
 * (not spoofable by the client). Fallback: the right-most X-Forwarded-For entry, which is the
 * one appended by our own proxy; left-most entries are client-controlled.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const parts = fwd.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return 'unknown';
}

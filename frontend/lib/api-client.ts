/**
 * Browser client for DATA_SOURCE=postgres.
 *
 * Exposes the same `from(table)...` and `auth.*` call shapes the existing pages already use, so
 * the UI does not change. Every call goes to the Next.js API (`/api/data`, `/api/auth/*`), where
 * the server enforces authentication, authorization and validation. Nothing here is trusted.
 */

type Filter = [string, string, unknown];
interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
interface Result<T = any> {
  data: T | null;
  error: ApiError | null;
  count: number | null;
  status: number;
}

async function postJson<T = any>(url: string, body: unknown): Promise<Result<T>> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || json?.error) {
      return { data: null, error: json?.error ?? { message: `Request failed (${res.status})` }, count: null, status: res.status };
    }
    return { data: json?.data ?? null, error: null, count: json?.count ?? null, status: res.status };
  } catch {
    return { data: null, error: { message: 'Network error. Please check your connection.' }, count: null, status: 0 };
  }
}

class ApiQueryBuilder implements PromiseLike<Result> {
  private req: {
    table: string;
    op: 'select' | 'insert' | 'update' | 'delete';
    select?: string;
    filters: Filter[];
    or?: string;
    order: { column: string; ascending: boolean }[];
    limit?: number;
    offset?: number;
    count?: 'exact';
    single?: 'single' | 'maybe';
    values?: unknown;
    returning?: string;
  };

  constructor(table: string) {
    this.req = { table, op: 'select', filters: [], order: [] };
  }

  select(columns = '*', options?: { count?: string }) {
    if (this.req.op === 'select') this.req.select = columns;
    else this.req.returning = columns;
    if (options?.count) this.req.count = 'exact';
    return this;
  }
  private f(op: string, column: string, value: unknown) {
    this.req.filters.push([op, column, value]);
    return this;
  }
  eq(c: string, v: unknown) { return this.f('eq', c, v); }
  neq(c: string, v: unknown) { return this.f('neq', c, v); }
  gt(c: string, v: unknown) { return this.f('gt', c, v); }
  gte(c: string, v: unknown) { return this.f('gte', c, v); }
  lt(c: string, v: unknown) { return this.f('lt', c, v); }
  lte(c: string, v: unknown) { return this.f('lte', c, v); }
  like(c: string, v: string) { return this.f('like', c, v); }
  ilike(c: string, v: string) { return this.f('ilike', c, v); }
  in(c: string, v: unknown[]) { return this.f('in', c, (Array.isArray(v) ? v : []).filter((x) => x !== undefined)); }
  or(filters: string) {
    this.req.or = filters;
    return this;
  }
  order(column: string, options?: { ascending?: boolean }) {
    this.req.order.push({ column, ascending: options?.ascending !== false });
    return this;
  }
  limit(n: number) {
    this.req.limit = n;
    return this;
  }
  range(from: number, to: number) {
    this.req.offset = from;
    this.req.limit = to - from + 1;
    return this;
  }
  single() {
    this.req.single = 'single';
    return this;
  }
  maybeSingle() {
    this.req.single = 'maybe';
    return this;
  }
  insert(values: unknown) {
    this.req.op = 'insert';
    this.req.values = values;
    return this;
  }
  update(values: unknown) {
    this.req.op = 'update';
    this.req.values = values;
    return this;
  }
  delete() {
    this.req.op = 'delete';
    return this;
  }

  then<R1 = Result, R2 = never>(onfulfilled?: ((v: Result) => R1 | PromiseLike<R1>) | null, onrejected?: ((e: any) => R2 | PromiseLike<R2>) | null) {
    return postJson('/api/data', this.req).then(onfulfilled, onrejected);
  }
}

// ---------------- auth ----------------
export interface ApiUser {
  id: string;
  email: string;
  user_metadata: { full_name: string | null };
}
type AuthEvent = 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED';
type Session = { user: ApiUser } | null;
type Listener = (event: AuthEvent, session: Session) => void;

const listeners = new Set<Listener>();
let current: Promise<Session> | null = null;

function emit(event: AuthEvent, session: Session) {
  current = Promise.resolve(session);
  listeners.forEach((l) => l(event, session));
}

async function fetchSession(): Promise<Session> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' });
    const json = await res.json();
    return json?.data?.user ? { user: json.data.user } : null;
  } catch {
    return null;
  }
}

const auth = {
  async getSession() {
    current ??= fetchSession();
    return { data: { session: await current }, error: null };
  },
  onAuthStateChange(cb: Listener) {
    listeners.add(cb);
    // New subscribers receive the current session asynchronously.
    auth.getSession().then(({ data }) => {
      if (listeners.has(cb)) cb('INITIAL_SESSION', data.session);
    });
    return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const r = await postJson('/api/auth/login', { email, password });
    if (!r.error && r.data?.user) emit('SIGNED_IN', { user: r.data.user });
    return { data: r.data, error: r.error };
  },
  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string } } }) {
    // Only email, password and display name are sent; the server always assigns role "customer".
    const r = await postJson('/api/auth/register', { email, password, full_name: options?.data?.full_name ?? '' });
    if (!r.error && r.data?.user) emit('SIGNED_IN', { user: r.data.user });
    return { data: r.data, error: r.error };
  },
  async signOut() {
    const r = await postJson('/api/auth/logout', {});
    emit('SIGNED_OUT', null);
    return { error: r.error };
  },
  async updateUser({ password }: { password?: string }) {
    if (!password) return { data: null, error: { message: 'Nothing to update.' } };
    const r = await postJson('/api/auth/password', { password });
    if (!r.error) {
      const s = await fetchSession();
      emit('USER_UPDATED', s);
    }
    return { data: r.data, error: r.error };
  },
};

export function createApiClient() {
  return { from: (table: string) => new ApiQueryBuilder(table), auth };
}

// ---------------- checkout ----------------
export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function placeOrderViaApi(input: {
  idempotencyKey: string;
  deliveryMethod: string;
  address: Record<string, string>;
}) {
  return postJson<{ orderId: string; orderNumber: string; total: number; replayed: boolean }>('/api/checkout', {
    idempotency_key: input.idempotencyKey,
    delivery_method: input.deliveryMethod,
    payment_method: 'cod',
    shipping_address: input.address,
  });
}

// ---------------- account / email ----------------
async function getJson<T = any>(url: string): Promise<Result<T>> {
  try {
    const res = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
    const json = await res.json().catch(() => null);
    if (!res.ok || json?.error) {
      return { data: null, error: json?.error ?? { message: `Request failed (${res.status})` }, count: null, status: res.status };
    }
    return { data: json?.data ?? null, error: null, count: null, status: res.status };
  } catch {
    return { data: null, error: { message: 'Network error. Please check your connection.' }, count: null, status: 0 };
  }
}

/** True when the API is switched off because the site runs on mock data. */
export const isMockModeError = (r: { status: number; error: ApiError | null }) =>
  r.status === 503 && r.error?.code === 'data_source_disabled';

export interface AccountStatus {
  user: (ApiUser & { email_verified?: boolean }) | null;
  profile: { id: string; full_name: string | null; role: string; phone: string | null } | null;
}

export interface EmailStatus {
  provider: 'log' | 'smtp' | 'resend';
  from: string;
  appUrl: string;
  adminEmails: string[];
  last7Days: Record<string, number>;
  recent: { id: string; to_email: string; template: string; subject: string; status: string; attempts: number; last_error: string | null; created_at: string; sent_at: string | null }[];
}

export const accountApi = {
  me: () => getJson<AccountStatus>('/api/auth/me'),
  verifyEmail: (token: string) => postJson<{ verified: boolean; role: string }>('/api/auth/verify-email', { token }),
  resendVerification: () => postJson<{ sent: boolean; alreadyVerified?: boolean }>('/api/auth/resend-verification', {}),
  forgotPassword: (email: string) => postJson<{ message: string }>('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => postJson<{ reset: boolean }>('/api/auth/reset-password', { token, password }),
  changePassword: async (currentPassword: string, password: string) => {
    const r = await postJson<{ updated: boolean }>('/api/auth/password', { current_password: currentPassword, password });
    if (!r.error) emit('USER_UPDATED', await fetchSession());
    return r;
  },
  emailStatus: () => getJson<EmailStatus>('/api/admin/email'),
  sendTestEmail: () => postJson<{ queued: boolean; to: string; provider: string }>('/api/admin/email', {}),
};

export const newsletterApi = {
  subscribe: (email: string) => postJson<{ message: string }>('/api/newsletter/subscribe', { email }),
  confirm: (token: string) => postJson<{ subscribed: boolean }>('/api/newsletter/confirm', { token }),
  unsubscribe: (token: string) => postJson<{ unsubscribed: boolean }>('/api/newsletter/unsubscribe', { token }),
};

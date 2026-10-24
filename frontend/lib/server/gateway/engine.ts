/**
 * Data gateway engine: executes the small, allowlisted subset of query-builder operations the
 * existing QROBO UI uses (select/filters/order/range/single + insert/update/delete) as
 * parameterized SQL, under the rules in policies.ts.
 *
 * Security properties:
 *  - Table, column, operator and relation names come only from static allowlists and are
 *    double-quoted after validation; every value is a bind parameter ($n).
 *  - Identity/role come from the server session (ctx), never from the request body.
 *  - Owner scoping is ANDed into every statement; writes need at least one `eq` filter.
 */
import { z } from 'zod';
import { ApiError } from '../http';
import { POLICIES, type Cond, type Role, type TablePolicy } from './policies';
import { TABLES, isTableName, type ColType, type TableName } from './schema';

export interface Queryable {
  query: (text: string, params?: unknown[]) => Promise<{ rows: any[]; rowCount: number | null }>;
}

export interface GatewayContext {
  userId: string | null;
  role: Role;
}

const SCALAR_OPS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'like', 'ilike'] as const;
const Scalar = z.union([z.string().max(2000), z.number().finite(), z.boolean(), z.null()]);

export const GatewayRequest = z.object({
  table: z.string().max(64),
  op: z.enum(['select', 'insert', 'update', 'delete']),
  select: z.string().max(500).optional(),
  filters: z.array(z.tuple([z.enum(SCALAR_OPS), z.string().max(64), z.union([Scalar, z.array(Scalar).max(500)])])).max(30).default([]),
  or: z.string().max(1000).optional(),
  order: z.array(z.object({ column: z.string().max(64), ascending: z.boolean().default(true) })).max(5).default([]),
  limit: z.number().int().min(0).max(1000).optional(),
  offset: z.number().int().min(0).max(1_000_000).optional(),
  count: z.literal('exact').optional(),
  single: z.enum(['single', 'maybe']).optional(),
  values: z.union([z.record(z.unknown()), z.array(z.record(z.unknown())).min(1).max(100)]).optional(),
  returning: z.string().max(500).optional(),
});
export type GatewayRequest = z.infer<typeof GatewayRequest>;

export interface GatewayResult {
  data: unknown;
  count: number | null;
}

const MAX_LIMIT = { admin: 1000, other: 200 };
const IDENT = /^[a-z_][a-z0-9_]*$/;
const q = (c: string) => `"${c}"`;

const bad = (message: string, code = 'invalid_query') => new ApiError(400, code, message);

class Params {
  values: unknown[] = [];
  add = (v: unknown) => {
    this.values.push(v);
    return `$${this.values.length}`;
  };
}

const isAdmin = (ctx: GatewayContext) => ctx.role === 'admin';

function visibleColumns(table: TableName, ctx: GatewayContext): string[] {
  const hidden = isAdmin(ctx) ? [] : POLICIES[table].read.hiddenForNonAdmin ?? [];
  return Object.keys(TABLES[table]).filter((c) => !hidden.includes(c));
}

function requireColumn(table: TableName, col: string, allowed: string[]): string {
  if (!IDENT.test(col) || !allowed.includes(col)) throw bad(`Unknown or inaccessible column "${col}" on ${table}.`, 'unknown_column');
  return col;
}

// ---------- select parsing ----------
interface RelSpec {
  alias: string;
  columns: '*' | string[];
}
interface ParsedSelect {
  columns: '*' | string[];
  relations: RelSpec[];
}

function splitTopLevel(s: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth < 0) throw bad('Malformed select.');
    if (ch === ',' && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (depth !== 0) throw bad('Malformed select.');
  out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}

function parseColumnList(s: string): '*' | string[] {
  const t = s.trim();
  if (t === '' || t === '*') return '*';
  return t.split(',').map((c) => c.trim()).filter(Boolean);
}

export function parseSelect(table: TableName, select: string | undefined): ParsedSelect {
  const items = splitTopLevel(select && select.trim() ? select : '*');
  let columns: string[] | '*' = [];
  const relations: RelSpec[] = [];
  for (const item of items) {
    const rel = /^(?:([a-z_]+):)?([a-z_]+)\((.*)\)$/.exec(item);
    if (rel) {
      const [, aliasRaw, relTable, inner] = rel;
      const alias = aliasRaw ?? relTable;
      const def = POLICIES[table].relations?.[alias];
      if (!def || def.table !== relTable) throw bad(`Relation "${item}" is not allowed on ${table}.`, 'unknown_relation');
      if (/[()]/.test(inner)) throw bad('Nested relations are not supported.');
      relations.push({ alias, columns: parseColumnList(inner) });
    } else if (item === '*') {
      columns = '*';
    } else if (columns !== '*') {
      columns.push(item);
    }
  }
  if (Array.isArray(columns) && columns.length === 0 && relations.length === 0) columns = '*';
  return { columns, relations };
}

function resolveColumns(table: TableName, spec: '*' | string[], ctx: GatewayContext): string[] {
  const visible = visibleColumns(table, ctx);
  return spec === '*' ? visible : spec.map((c) => requireColumn(table, c, visible));
}

// ---------- filters ----------
function scalarFilter(table: TableName, op: string, col: string, value: unknown, allowed: string[], p: Params): string {
  requireColumn(table, col, allowed);
  const type = TABLES[table][col as keyof (typeof TABLES)[typeof table]] as ColType;
  if (type === 'text[]' || type === 'jsonb') throw bad(`Operator ${op} is not supported on ${col}.`);
  const c = q(col);
  switch (op) {
    case 'eq':
      return value === null ? `${c} IS NULL` : `${c} = ${p.add(value)}`;
    case 'neq':
      return value === null ? `${c} IS NOT NULL` : `${c} IS DISTINCT FROM ${p.add(value)}`;
    case 'gt':
      return `${c} > ${p.add(value)}`;
    case 'gte':
      return `${c} >= ${p.add(value)}`;
    case 'lt':
      return `${c} < ${p.add(value)}`;
    case 'lte':
      return `${c} <= ${p.add(value)}`;
    case 'in':
      if (!Array.isArray(value)) throw bad('"in" requires an array.');
      return `${c} = ANY(${p.add(value)})`;
    case 'like':
    case 'ilike':
      if (typeof value !== 'string') throw bad(`"${op}" requires a string.`);
      return `${c} ${op === 'like' ? 'LIKE' : 'ILIKE'} ${p.add(value)}`;
    default:
      throw bad(`Unsupported operator ${op}.`);
  }
}

/** Parses the PostgREST-style `or` string used by search, e.g. `name.ilike.%x%,tags.cs.{x}`. */
export function parseOr(table: TableName, or: string, allowed: string[], p: Params): string {
  const parts = or.split(',').map((s) => s.trim()).filter(Boolean);
  if (!parts.length || parts.length > 10) throw bad('Invalid "or" filter.');
  const conds = parts.map((part) => {
    const m = /^([a-z_]+)\.(eq|like|ilike|cs)\.(.*)$/s.exec(part);
    if (!m) throw bad('Invalid "or" filter.');
    const [, col, op, val] = m;
    if (op === 'cs') {
      requireColumn(table, col, allowed);
      if (TABLES[table][col as keyof (typeof TABLES)[typeof table]] !== 'text[]') throw bad(`"cs" requires an array column.`);
      const inner = /^\{(.*)\}$/s.exec(val);
      if (!inner) throw bad('"cs" value must look like {value}.');
      return `${q(col)} @> ${p.add([inner[1]])}::text[]`;
    }
    return scalarFilter(table, op, col, val, allowed, p);
  });
  return `(${conds.join(' OR ')})`;
}

function scopeConds(policy: TablePolicy, ctx: GatewayContext, p: Params): string[] {
  const r = policy.read;
  if (!r.scope) return [];
  if (isAdmin(ctx) && !r.ownerOnly) return [];
  return r.scope(ctx.userId).map((c: Cond) => c(p.add));
}

function checkReadAccess(table: TableName, ctx: GatewayContext) {
  const r = POLICIES[table].read;
  if (r.who === 'user' && !ctx.userId) throw new ApiError(401, 'unauthenticated', 'Please sign in to continue.');
}

// ---------- read ----------
interface ReadPlan {
  table: TableName;
  columns: string[];
  relations: RelSpec[];
  extraConds?: (p: Params) => string[];
}

async function runRead(db: Queryable, plan: ReadPlan, req: Partial<GatewayRequest>, ctx: GatewayContext, wantCount: boolean) {
  const { table } = plan;
  const policy = POLICIES[table];
  checkReadAccess(table, ctx);
  const visible = visibleColumns(table, ctx);
  const p = new Params();
  const where: string[] = [...scopeConds(policy, ctx, p)];
  if (plan.extraConds) where.push(...plan.extraConds(p));

  const filters = req.filters ?? [];
  if (!isAdmin(ctx) && policy.read.requireEqFilter) {
    const need = policy.read.requireEqFilter;
    if (!filters.some(([op, col, v]) => op === 'eq' && col === need && typeof v === 'string' && v.length > 0)) {
      throw new ApiError(403, 'forbidden', `Listing ${table} is not allowed; look up by ${need}.`);
    }
  }
  for (const [op, col, value] of filters) where.push(scalarFilter(table, op, col, value, visible, p));
  if (req.or) where.push(parseOr(table, req.or, visible, p));
  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';

  // Always fetch columns needed to attach relations; strip them afterwards if not requested.
  const sqlColumns = [...plan.columns];
  for (const rel of plan.relations) {
    const local = POLICIES[table].relations![rel.alias].localColumn;
    if (!sqlColumns.includes(local)) sqlColumns.push(local);
  }

  const orderParts = (req.order ?? []).map((o) => `${q(requireColumn(table, o.column, visible))} ${o.ascending ? 'ASC' : 'DESC'}`);
  if (orderParts.length && 'id' in TABLES[table] && !(req.order ?? []).some((o) => o.column === 'id')) orderParts.push('"id" ASC');
  const orderSql = orderParts.length ? ` ORDER BY ${orderParts.join(', ')}` : '';

  const cap = isAdmin(ctx) ? MAX_LIMIT.admin : MAX_LIMIT.other;
  let limit = Math.min(req.limit ?? cap, cap);
  if (req.single) limit = Math.min(limit, 2);
  const offsetSql = req.offset ? ` OFFSET ${p.add(req.offset)}` : '';
  const text = `SELECT ${sqlColumns.map(q).join(', ')} FROM ${q(table)}${whereSql}${orderSql} LIMIT ${p.add(limit)}${offsetSql}`;
  const { rows } = await db.query(text, p.values);

  let count: number | null = null;
  if (wantCount) {
    // Same WHERE and bind values, without LIMIT/OFFSET parameters.
    const countParams = p.values.slice(0, p.values.length - (req.offset ? 2 : 1));
    const res = await db.query(`SELECT count(*)::int AS n FROM ${q(table)}${whereSql}`, countParams);
    count = res.rows[0].n;
  }

  for (const rel of plan.relations) await attachRelation(db, table, rel, rows, ctx);

  const extras = sqlColumns.filter((c) => !plan.columns.includes(c));
  if (extras.length) for (const r of rows) for (const c of extras) delete r[c];
  return { rows, count };
}

async function attachRelation(db: Queryable, table: TableName, rel: RelSpec, rows: any[], ctx: GatewayContext) {
  const def = POLICIES[table].relations![rel.alias];
  const keys = Array.from(new Set(rows.map((r) => r[def.localColumn]).filter((v) => v !== null && v !== undefined)));
  if (!keys.length) {
    for (const r of rows) r[rel.alias] = def.kind === 'one' ? null : [];
    return;
  }
  const columns = resolveColumns(def.table, rel.columns, ctx);
  const sub = await runRead(
    db,
    {
      table: def.table,
      columns: columns.includes(def.remoteColumn) ? columns : [...columns, def.remoteColumn],
      relations: [],
      extraConds: (p) => [`${q(def.remoteColumn)} = ANY(${p.add(keys)})`],
    },
    def.kind === 'many' ? { order: [{ column: 'created_at', ascending: true }], limit: 1000 } : { limit: 1000 },
    ctx,
    false,
  );
  const stripRemote = !columns.includes(def.remoteColumn);
  const grouped = new Map<unknown, any[]>();
  for (const s of sub.rows) {
    const k = s[def.remoteColumn];
    if (stripRemote) delete s[def.remoteColumn];
    grouped.set(k, [...(grouped.get(k) ?? []), s]);
  }
  for (const r of rows) {
    const list = grouped.get(r[def.localColumn]) ?? [];
    r[rel.alias] = def.kind === 'one' ? list[0] ?? null : list;
  }
}

function applySingle(rows: any[], single: GatewayRequest['single']) {
  if (!single) return rows;
  if (rows.length > 1) throw new ApiError(406, 'not_single', 'Multiple rows returned where one was expected.');
  if (single === 'single' && rows.length === 0) throw new ApiError(406, 'not_found', 'No matching row.');
  return rows[0] ?? null;
}

// ---------- writes ----------
function prepareValue(table: TableName, col: string, value: unknown): unknown {
  const type = TABLES[table][col as keyof (typeof TABLES)[typeof table]] as ColType;
  if (value === null || value === undefined) return null;
  switch (type) {
    case 'jsonb':
      return JSON.stringify(value);
    case 'text[]':
      if (!Array.isArray(value) || value.length > 200 || !value.every((v) => typeof v === 'string' && v.length <= 2000)) {
        throw bad(`${col} must be an array of strings.`, 'invalid_value');
      }
      return value;
    case 'bool':
      if (typeof value !== 'boolean') throw bad(`${col} must be true or false.`, 'invalid_value');
      return value;
    case 'int':
    case 'num':
      if (typeof value !== 'number' || !Number.isFinite(value)) throw bad(`${col} must be a number.`, 'invalid_value');
      if (type === 'int' && !Number.isInteger(value)) throw bad(`${col} must be a whole number.`, 'invalid_value');
      return value;
    default:
      if (typeof value !== 'string' && typeof value !== 'number') throw bad(`${col} has an invalid value.`, 'invalid_value');
      if (String(value).length > 100_000) throw bad(`${col} is too long.`, 'invalid_value');
      return value;
  }
}

function authorizeWrite(table: TableName, op: 'insert' | 'update' | 'delete', ctx: GatewayContext) {
  const rule = POLICIES[table][op];
  if (!rule) throw new ApiError(403, 'forbidden', `${op} on ${table} is not allowed.`);
  if (rule.who === 'admin' && !isAdmin(ctx)) {
    throw new ApiError(ctx.userId ? 403 : 401, ctx.userId ? 'forbidden' : 'unauthenticated', 'Administrator access required.');
  }
  if (rule.who === 'owner' && !ctx.userId) throw new ApiError(401, 'unauthenticated', 'Please sign in to continue.');
  return rule;
}

function writeWhere(table: TableName, req: GatewayRequest, ctx: GatewayContext, p: Params, scope?: (uid: string) => Cond) {
  if (req.or) throw bad('"or" is not allowed on writes.');
  if (!req.filters.some(([op]) => op === 'eq')) throw bad('Updates and deletes require at least one eq filter.');
  const allowed = Object.keys(TABLES[table]);
  const where = req.filters.map(([op, col, v]) => scalarFilter(table, op, col, v, allowed, p));
  if (scope) where.push(scope(ctx.userId!)(p.add));
  return ` WHERE ${where.join(' AND ')}`;
}

function returningSql(table: TableName, req: GatewayRequest, ctx: GatewayContext) {
  if (!req.returning) return { sql: '', wanted: false };
  const parsed = parseSelect(table, req.returning);
  if (parsed.relations.length) throw bad('Relations are not supported in returning.');
  return { sql: ` RETURNING ${resolveColumns(table, parsed.columns, ctx).map(q).join(', ')}`, wanted: true };
}

async function runInsert(db: Queryable, table: TableName, req: GatewayRequest, ctx: GatewayContext) {
  const rule = authorizeWrite(table, 'insert', ctx) as NonNullable<TablePolicy['insert']>;
  if (!req.values) throw bad('Insert requires values.');
  const rows = Array.isArray(req.values) ? req.values : [req.values];
  const columns = new Set<string>();
  for (const row of rows) {
    if (rule.ownerColumn) {
      const supplied = row[rule.ownerColumn];
      if (supplied !== undefined && supplied !== ctx.userId) throw new ApiError(403, 'forbidden', 'Cannot write data for another user.');
      row[rule.ownerColumn] = ctx.userId;
    }
    for (const k of Object.keys(row)) {
      if (!rule.columns.includes(k)) throw bad(`Column "${k}" is not writable on ${table}.`, 'column_not_writable');
      columns.add(k);
    }
  }
  if (table === 'cart_items') {
    const cartIds = Array.from(new Set(rows.map((r) => r.cart_id)));
    if (cartIds.some((id) => typeof id !== 'string')) throw bad('cart_id is required.', 'missing_field');
    const owned = await db.query('SELECT count(*)::int AS n FROM carts WHERE id = ANY($1) AND user_id = $2', [cartIds, ctx.userId]);
    if (owned.rows[0].n !== cartIds.length) throw new ApiError(403, 'forbidden', 'Cart does not belong to you.');
  }
  const cols = Array.from(columns);
  const p = new Params();
  const tuples = rows.map((row) => `(${cols.map((c) => (c in row ? p.add(prepareValue(table, c, row[c])) : 'DEFAULT')).join(', ')})`);
  const ret = returningSql(table, req, ctx);
  const text = cols.length
    ? `INSERT INTO ${q(table)} (${cols.map(q).join(', ')}) VALUES ${tuples.join(', ')}${ret.sql}`
    : `INSERT INTO ${q(table)} DEFAULT VALUES${ret.sql}`;
  const res = await db.query(text, p.values);
  return ret.wanted ? applySingle(res.rows, req.single) : null;
}

async function runUpdate(db: Queryable, table: TableName, req: GatewayRequest, ctx: GatewayContext) {
  const rule = authorizeWrite(table, 'update', ctx) as NonNullable<TablePolicy['update']>;
  if (!req.values || Array.isArray(req.values)) throw bad('Update requires a single values object.');
  const keys = Object.keys(req.values);
  if (!keys.length) throw bad('Update requires at least one column.');
  const p = new Params();
  const sets = keys.map((k) => {
    if (!rule.columns.includes(k)) throw bad(`Column "${k}" is not writable on ${table}.`, 'column_not_writable');
    return `${q(k)} = ${p.add(prepareValue(table, k, (req.values as Record<string, unknown>)[k]))}`;
  });
  const where = writeWhere(table, req, ctx, p, rule.who === 'owner' ? rule.scope : undefined);
  const ret = returningSql(table, req, ctx);
  const res = await db.query(`UPDATE ${q(table)} SET ${sets.join(', ')}${where}${ret.sql}`, p.values);
  return ret.wanted ? applySingle(res.rows, req.single) : null;
}

async function runDelete(db: Queryable, table: TableName, req: GatewayRequest, ctx: GatewayContext) {
  const rule = authorizeWrite(table, 'delete', ctx)!;
  const p = new Params();
  const where = writeWhere(table, req, ctx, p, rule.who === 'owner' ? rule.scope : undefined);
  await db.query(`DELETE FROM ${q(table)}${where}`, p.values);
  return null;
}

export async function executeGateway(db: Queryable, raw: unknown, ctx: GatewayContext): Promise<GatewayResult> {
  const req = GatewayRequest.parse(raw);
  if (!isTableName(req.table)) throw new ApiError(404, 'unknown_table', 'Unknown resource.');
  const table = req.table;
  switch (req.op) {
    case 'select': {
      const parsed = parseSelect(table, req.select);
      const columns = resolveColumns(table, parsed.columns, ctx);
      const { rows, count } = await runRead(db, { table, columns, relations: parsed.relations }, req, ctx, req.count === 'exact');
      return { data: applySingle(rows, req.single), count };
    }
    case 'insert':
      return { data: await runInsert(db, table, req, ctx), count: null };
    case 'update':
      return { data: await runUpdate(db, table, req, ctx), count: null };
    case 'delete':
      return { data: await runDelete(db, table, req, ctx), count: null };
  }
}

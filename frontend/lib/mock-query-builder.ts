import { mockDataMap, mockProducts } from './mock-data';

/**
 * In-memory query builder for DATA_SOURCE=mock (demo data from lib/mock-data.ts).
 * Supports the same chainable calls as the API client: select/filters/order/range/single and
 * insert/update/delete (optionally followed by .select()/.single()). Writes only change memory
 * for the current browser tab and are lost on reload.
 */
type Op = 'select' | 'insert' | 'update' | 'delete';

export class MockQueryBuilder implements PromiseLike<{ data: any; error: null; count: number | null }> {
  private tableName: string;
  private op: Op = 'select';
  private values: any = null;
  private returning = false;
  private filters: Array<(item: any) => boolean> = [];
  private sortFn: ((a: any, b: any) => number) | null = null;
  private limitCount: number | null = null;
  private offsetCount = 0;
  private isSingle = false;
  private isMaybeSingle = false;
  private countMode: string | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private get table(): any[] {
    if (!mockDataMap[this.tableName]) mockDataMap[this.tableName] = [];
    return mockDataMap[this.tableName];
  }

  select(_fields?: string, options?: { count?: string }) {
    if (this.op !== 'select') this.returning = true;
    if (options?.count) this.countMode = options.count;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((item) => item[column] !== value);
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push((item) => Number(item[column]) > Number(value));
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((item) => Number(item[column]) >= Number(value));
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push((item) => Number(item[column]) < Number(value));
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((item) => Number(item[column]) <= Number(value));
    return this;
  }

  in(column: string, values: any[]) {
    const set = new Set(Array.isArray(values) ? values : []);
    this.filters.push((item) => set.has(item[column]));
    return this;
  }

  like(column: string, pattern: string) {
    return this.ilike(column, pattern);
  }

  ilike(column: string, pattern: string) {
    const escaped = String(pattern).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*');
    const regex = new RegExp(`^${escaped}$`, 'i');
    this.filters.push((item) => regex.test(String(item[column] || '')));
    return this;
  }

  or(filterStr: string) {
    const parts = filterStr.split(',').map((p) => p.trim());
    this.filters.push((item) =>
      parts.some((p) => {
        const [col, op, ...rest] = p.split('.');
        const val = rest.join('.');
        if (op === 'ilike' || op === 'like') {
          const raw = val.replace(/^%|%$/g, '');
          return String(item[col] || '').toLowerCase().includes(raw.toLowerCase());
        }
        if (op === 'cs') {
          const tag = val.replace(/^\{|\}$/g, '');
          return Array.isArray(item[col]) && item[col].includes(tag);
        }
        if (op === 'eq') return String(item[col]) === String(val);
        return false;
      }),
    );
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const asc = options?.ascending !== false;
    this.sortFn = (a, b) => {
      const valA = a[column];
      const valB = b[column];
      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;
      return asc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
    };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this.offsetCount = from;
    this.limitCount = to - from + 1;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  insert(values: any) {
    this.op = 'insert';
    this.values = values;
    return this;
  }

  update(values: any) {
    this.op = 'update';
    this.values = values;
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  private matches = (item: any) => this.filters.every((fn) => fn(item));

  private shape(rows: any[], count: number | null) {
    const data = this.isSingle || this.isMaybeSingle ? rows[0] ?? null : rows;
    return { data, error: null, count };
  }

  private execute() {
    const now = new Date().toISOString();
    if (this.op === 'insert') {
      const list = Array.isArray(this.values) ? this.values : [this.values];
      const inserted = list.map((v: any) => ({
        id: v?.id || `${this.tableName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...v,
        created_at: now,
      }));
      this.table.unshift(...inserted);
      return this.shape(this.returning ? inserted : [], null);
    }
    if (this.op === 'update') {
      const updated: any[] = [];
      this.table.forEach((row, i) => {
        if (this.matches(row)) {
          this.table[i] = { ...row, ...this.values, updated_at: now };
          updated.push(this.table[i]);
        }
      });
      return this.shape(this.returning ? updated : [], null);
    }
    if (this.op === 'delete') {
      mockDataMap[this.tableName] = this.table.filter((row) => !this.matches(row));
      return { data: null, error: null, count: null };
    }

    let result = this.table.filter(this.matches);
    const totalCount = result.length;

    // Embedded product relation used by the deals pages.
    if (this.tableName === 'deals') {
      result = result.map((d) => ({
        ...d,
        product: mockProducts.find((p) => p.id === d.product_id || p.slug === String(d.product_id).replace(/^prod-/, '')) || null,
      }));
    }
    if (this.sortFn) result = [...result].sort(this.sortFn);
    if (this.offsetCount > 0) result = result.slice(this.offsetCount);
    if (this.limitCount !== null) result = result.slice(0, this.limitCount);
    return this.shape(result, this.countMode ? totalCount : null);
  }

  then<R1 = any, R2 = never>(
    onfulfilled?: ((value: { data: any; error: null; count: number | null }) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return Promise.resolve().then(() => this.execute()).then(onfulfilled, onrejected);
  }
}

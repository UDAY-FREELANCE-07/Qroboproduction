import { cpSync, mkdtempSync, appendFileSync, rmSync } from 'fs';
import os from 'os';
import path from 'path';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations, runSeeds } from '@/lib/server/migrations';
import { TABLES } from '@/lib/server/gateway/schema';
import { mockDataMap } from '@/lib/mock-data';
import { createTestDb, dbAvailable, PATHS, type TestDb } from './helpers';

describe.skipIf(!dbAvailable())('migrations and seeds on PostgreSQL', () => {
  let db: TestDb;
  beforeAll(async () => {
    db = await createTestDb();
  });
  afterAll(async () => db?.drop());

  const count = async (t: string) => (await db.pool.query(`SELECT count(*)::int AS n FROM ${t}`)).rows[0].n;

  it('seeds exactly the existing demo catalog and nothing else', async () => {
    const expected: Record<string, number> = {
      categories: 21, brands: 15, products: 42, banners: 3, promo_cards: 2, deals: 10,
      coupons: 4, projects: 6, project_components: 16, tutorials: 8,
      users: 0, profiles: 0, sessions: 0, orders: 0, order_items: 0, reviews: 0, carts: 0, cart_items: 0,
      wishlists: 0, addresses: 0, inventory_transactions: 0, payment_events: 0,
    };
    for (const [t, n] of Object.entries(expected)) expect([t, await count(t)]).toEqual([t, n]);
  });

  it('is safe to re-run (no duplicate banners/deals/components)', async () => {
    const c = new Client({ connectionString: db.url });
    await c.connect();
    try {
      expect(await runMigrations(c, PATHS.migrationsDir)).toEqual([]);
      expect(await runSeeds(c, PATHS.seedsDir)).toEqual([]);
    } finally {
      await c.end();
    }
    expect(await count('banners')).toBe(3);
    expect(await count('deals')).toBe(10);
    expect(await count('project_components')).toBe(16);
  });

  it('refuses an edited, already-applied migration', async () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'qrobo-mig-'));
    cpSync(PATHS.migrationsDir, dir, { recursive: true });
    appendFileSync(path.join(dir, '0001_init_schema.sql'), '\n-- edited\n');
    const c = new Client({ connectionString: db.url });
    await c.connect();
    try {
      await expect(runMigrations(c, dir)).rejects.toThrow(/contents changed/);
    } finally {
      await c.end();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('preserves every product, banner, project and tutorial image URL and gallery order from mock-data.ts', async () => {
    const products = (await db.pool.query('SELECT slug, name, sku, price, primary_image, images, stock FROM products')).rows;
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    expect(bySlug.size).toBe(mockDataMap.products.length);
    for (const m of mockDataMap.products) {
      const p = bySlug.get(m.slug);
      expect(p, m.slug).toBeTruthy();
      expect({ name: p.name, sku: p.sku, price: Number(p.price), primary_image: p.primary_image, images: p.images, stock: p.stock })
        .toEqual({ name: m.name, sku: m.sku, price: m.price, primary_image: m.primary_image, images: m.images, stock: m.stock });
    }
    for (const t of ['banners', 'promo_cards', 'projects', 'tutorials'] as const) {
      const key = t === 'projects' || t === 'tutorials' ? 'slug' : 'title';
      const rows = (await db.pool.query(`SELECT ${key} AS k, image_url FROM ${t}`)).rows;
      const dbMap = new Map(rows.map((r) => [r.k, r.image_url]));
      for (const m of mockDataMap[t]) expect([t, m[key], dbMap.get(m[key])]).toEqual([t, m[key], m.image_url]);
    }
  });

  it('gateway column allowlist matches the real schema', async () => {
    const { rows } = await db.pool.query(
      `SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'`,
    );
    for (const [table, cols] of Object.entries(TABLES)) {
      const actual = rows.filter((r) => r.table_name === table).map((r) => r.column_name).sort();
      expect([table, actual]).toEqual([table, Object.keys(cols).sort()]);
    }
  });

  it('uses only plain PostgreSQL objects (no external auth schema)', async () => {
    const { rows } = await db.pool.query(`SELECT count(*)::int AS n FROM information_schema.schemata WHERE schema_name = 'auth'`);
    expect(rows[0].n).toBe(0);
  });
});

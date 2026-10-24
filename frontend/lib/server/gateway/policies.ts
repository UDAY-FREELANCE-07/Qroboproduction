/**
 * Authorization policy for the data gateway. It is the only place that decides who may read or
 * deliberately fixes their flaws:
 *   - catalog/content writes are admin-only,
 *   - profiles.role is never writable through the API (no self-promotion),
 *   - orders cannot be created/updated by customers here (checkout is /api/checkout; admins may
 *     only change `status`, never payment fields),
 *   - owner tables are always scoped to the session user, even for admins,
 *   - inventory_transactions, users, sessions, payment_events are not exposed at all.
 */
import type { TableName } from './schema';
import { TABLES } from './schema';

export type Role = 'anon' | 'customer' | 'admin';

/** A SQL condition built with a parameter allocator, e.g. (p) => `"user_id" = ${p(userId)}`. */
export type Cond = (p: (v: unknown) => string) => string;

export interface ReadRule {
  /** Who may read at all. */
  who: 'public' | 'user';
  /** Conditions ANDed for non-admins (or for everyone when ownerOnly). */
  scope?: (userId: string | null) => Cond[];
  /** If true, `scope` applies to admins too (personal data such as carts). */
  ownerOnly?: boolean;
  /** Columns non-admins can never see. */
  hiddenForNonAdmin?: string[];
  /** Non-admin reads must include an `eq` filter on this column (prevents listing e.g. all coupons). */
  requireEqFilter?: string;
}

export interface WriteRule {
  who: 'admin' | 'owner';
  columns: string[];
  /** owner tables: column that is forced to the session user id on insert. */
  ownerColumn?: string;
  /** owner tables: condition limiting which rows may be updated/deleted. */
  scope?: (userId: string) => Cond;
}

export interface Relation {
  table: TableName;
  /** many-to-one: local FK column -> related id. one-to-many: related FK column -> local id. */
  kind: 'one' | 'many';
  localColumn: string;
  remoteColumn: string;
}

export interface TablePolicy {
  read: ReadRule;
  insert?: WriteRule;
  update?: WriteRule;
  delete?: Pick<WriteRule, 'who' | 'scope'>;
  relations?: Record<string, Relation>;
}

const q = (c: string) => `"${c}"`;
const eqTrue = (col: string): Cond => () => `${q(col)} = true`;
const ownedBy = (col: string, userId: string): Cond => (p) => `${q(col)} = ${p(userId)}`;
const cartOwnedBy = (userId: string): Cond => (p) => `"cart_id" IN (SELECT id FROM carts WHERE user_id = ${p(userId)})`;

/** All columns except system-managed ones. */
const adminWritable = (table: TableName, exclude: string[] = []) =>
  Object.keys(TABLES[table]).filter((c) => !['id', 'created_at', 'updated_at', ...exclude].includes(c));

const productRel: Relation = { table: 'products', kind: 'one', localColumn: 'product_id', remoteColumn: 'id' };

function adminCatalog(table: TableName, read: ReadRule, extra: Partial<TablePolicy> = {}, exclude: string[] = []): TablePolicy {
  const columns = adminWritable(table, exclude);
  return {
    read,
    insert: { who: 'admin', columns },
    update: { who: 'admin', columns },
    delete: { who: 'admin' },
    ...extra,
  };
}

const publishedOnly: ReadRule = { who: 'public', scope: () => [eqTrue('is_published')] };
const activeOnly: ReadRule = { who: 'public', scope: () => [eqTrue('is_active')] };

export const POLICIES: Record<TableName, TablePolicy> = {
  categories: adminCatalog('categories', { who: 'public' }),
  brands: adminCatalog('brands', { who: 'public' }),
  products: adminCatalog('products', { ...publishedOnly, hiddenForNonAdmin: ['cost_price'] }),
  banners: adminCatalog('banners', activeOnly),
  promo_cards: adminCatalog('promo_cards', activeOnly),
  deals: adminCatalog('deals', activeOnly, { relations: { product: productRel } }),
  projects: adminCatalog('projects', publishedOnly),
  project_components: adminCatalog('project_components', { who: 'public' }, { relations: { product: productRel } }),
  tutorials: adminCatalog('tutorials', publishedOnly),
  coupons: adminCatalog(
    'coupons',
    {
      who: 'public',
      scope: () => [eqTrue('is_active')],
      requireEqFilter: 'code',
      hiddenForNonAdmin: ['usage_limit', 'used_count', 'user_id', 'category_id'],
    },
    {},
    ['used_count'],
  ),

  reviews: {
    read: { who: 'public', scope: () => [eqTrue('is_approved')], hiddenForNonAdmin: ['user_id', 'order_id'] },
    update: { who: 'admin', columns: ['is_approved'] },
    delete: { who: 'admin' },
    relations: { product: productRel },
  },

  profiles: {
    read: { who: 'user', scope: (uid) => [ownedBy('id', uid!)] },
    // Owner-only even for admins; `role` is intentionally not writable.
    update: {
      who: 'owner',
      columns: ['full_name', 'phone', 'notify_order_updates', 'notify_marketing', 'notify_admin_new_orders'],
      scope: (uid) => ownedBy('id', uid),
    },
  },

  orders: {
    read: { who: 'user', scope: (uid) => [ownedBy('user_id', uid!)], hiddenForNonAdmin: ['idempotency_key', 'razorpay_signature'] },
    update: { who: 'admin', columns: ['status', 'courier', 'tracking_number', 'tracking_url'] },
    relations: { order_items: { table: 'order_items', kind: 'many', localColumn: 'id', remoteColumn: 'order_id' } },
  },
  order_items: {
    read: {
      who: 'user',
      scope: (uid) => [(p) => `"order_id" IN (SELECT id FROM orders WHERE user_id = ${p(uid)})`],
    },
  },

  carts: {
    read: { who: 'user', ownerOnly: true, scope: (uid) => [ownedBy('user_id', uid!)] },
    insert: { who: 'owner', columns: ['user_id'], ownerColumn: 'user_id' },
  },
  cart_items: {
    read: { who: 'user', ownerOnly: true, scope: (uid) => [cartOwnedBy(uid!)] },
    insert: { who: 'owner', columns: ['cart_id', 'product_id', 'quantity'] },
    update: { who: 'owner', columns: ['quantity'], scope: cartOwnedBy },
    delete: { who: 'owner', scope: cartOwnedBy },
    relations: { product: productRel },
  },
  wishlists: {
    read: { who: 'user', ownerOnly: true, scope: (uid) => [ownedBy('user_id', uid!)] },
    insert: { who: 'owner', columns: ['user_id', 'product_id'], ownerColumn: 'user_id' },
    delete: { who: 'owner', scope: (uid) => ownedBy('user_id', uid) },
    relations: { product: productRel },
  },
  addresses: {
    read: { who: 'user', ownerOnly: true, scope: (uid) => [ownedBy('user_id', uid!)] },
    insert: {
      who: 'owner',
      ownerColumn: 'user_id',
      columns: ['user_id', 'label', 'full_name', 'phone', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'is_default'],
    },
    update: {
      who: 'owner',
      scope: (uid) => ownedBy('user_id', uid),
      columns: ['label', 'full_name', 'phone', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'is_default'],
    },
    delete: { who: 'owner', scope: (uid) => ownedBy('user_id', uid) },
  },
};

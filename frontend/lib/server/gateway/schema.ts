/**
 * Static column allowlist for every table reachable through /api/data.
 * Must match backend/postgres/migrations (verified by tests/integration/schema.test.ts).
 * Tables NOT listed here (users, sessions, inventory_transactions, payment_events,
 * schema_migrations, seed_history) are unreachable through the gateway.
 */
export type ColType = 'uuid' | 'text' | 'int' | 'num' | 'bool' | 'ts' | 'text[]' | 'jsonb';

function cols(spec: string): Record<string, ColType> {
  const out: Record<string, ColType> = {};
  for (const token of spec.trim().split(/\s+/)) {
    const [name, type] = token.split(':');
    out[name] = (type as ColType) ?? 'text';
  }
  return out;
}

const TS = 'created_at:ts updated_at:ts';

export const TABLES = {
  categories: cols(`id:uuid name slug description image_url icon_name parent_id:uuid is_featured:bool sort_order:int ${TS}`),
  brands: cols(`id:uuid name slug description logo_url country ${TS}`),
  products: cols(`id:uuid name slug description short_description category_id:uuid brand_id:uuid sku price:num
    compare_at_price:num cost_price:num images:text[] primary_image specifications:jsonb features:text[]
    whats_included:text[] compatibility:text[] tags:text[] rating:num review_count:int stock:int reserved_stock:int
    low_stock_threshold:int is_featured:bool is_bestseller:bool is_new_arrival:bool is_deal:bool is_published:bool
    weight:num dimensions ${TS}`),
  reviews: cols(`id:uuid product_id:uuid user_id:uuid order_id:uuid rating:int title body images:text[]
    is_verified_purchase:bool is_approved:bool ${TS}`),
  carts: cols(`id:uuid user_id:uuid ${TS}`),
  cart_items: cols(`id:uuid cart_id:uuid product_id:uuid quantity:int created_at:ts`),
  wishlists: cols(`id:uuid user_id:uuid product_id:uuid created_at:ts`),
  addresses: cols(`id:uuid user_id:uuid label full_name phone address_line1 address_line2 city state postal_code
    country is_default:bool ${TS}`),
  orders: cols(`id:uuid order_number user_id:uuid status payment_status payment_method payment_id razorpay_order_id
    razorpay_payment_id razorpay_signature subtotal:num discount:num shipping_cost:num tax:num total:num coupon_code
    shipping_address:jsonb billing_address:jsonb notes idempotency_key ${TS}`),
  order_items: cols(`id:uuid order_id:uuid product_id:uuid product_name product_image product_slug sku price:num
    quantity:int total:num created_at:ts`),
  coupons: cols(`id:uuid code description discount_type discount_value:num min_order_value:num max_discount:num
    usage_limit:int used_count:int user_id:uuid category_id:uuid expires_at:ts is_active:bool ${TS}`),
  banners: cols(`id:uuid title subtitle description image_url category_label cta_text cta_link sort_order:int
    is_active:bool ${TS}`),
  promo_cards: cols(`id:uuid title description image_url cta_text cta_link background_color sort_order:int
    is_active:bool created_at:ts`),
  deals: cols(`id:uuid product_id:uuid title description discount_percentage:num sale_price:num original_price:num
    starts_at:ts ends_at:ts is_active:bool created_at:ts`),
  projects: cols(`id:uuid title slug description difficulty estimated_cost:num estimated_time image_url images:text[]
    video_url tutorial tags:text[] is_published:bool ${TS}`),
  project_components: cols(`id:uuid project_id:uuid product_id:uuid name quantity:int created_at:ts`),
  tutorials: cols(`id:uuid title slug description category content image_url video_url difficulty read_time:int
    tags:text[] is_published:bool ${TS}`),
  profiles: cols(`id:uuid full_name phone role avatar_url notify_order_updates:bool notify_marketing:bool
    notify_admin_new_orders:bool ${TS}`),
} as const;

export type TableName = keyof typeof TABLES;

export const isTableName = (t: unknown): t is TableName =>
  typeof t === 'string' && Object.prototype.hasOwnProperty.call(TABLES, t);

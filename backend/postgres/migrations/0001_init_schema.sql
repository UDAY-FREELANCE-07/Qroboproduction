-- QROBO PostgreSQL schema (standard PostgreSQL >= 13, e.g. Amazon RDS for PostgreSQL)
--
-- Identity: app-owned `users` + `sessions` tables; the user is always taken from the
-- server session, never from a column default.
-- Authorization: enforced in the Next.js API layer (lib/server/gateway/policies.ts); the app
-- database role is never exposed to browsers.
-- Profiles are created by /api/auth/register with role 'customer' only.
-- Integrity: carts.user_id unique, cart_items (cart_id, product_id) unique, non-negative
-- price/stock checks, orders.idempotency_key, RESTRICT on deletes that would orphan
-- catalog/order history, payment_events for idempotent webhook handling.
--
-- Table and column names match the UI row types (frontend/lib/data-client.ts `Database`) and
-- the demo seed files in backend/postgres/seeds.

-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ USERS / SESSIONS / PROFILES ============
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(email) AND position('@' IN email) > 1),
  password_hash text NOT NULL,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,          -- SHA-256 of the cookie token; raw token is never stored
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ CATALOG ============
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  icon_name text DEFAULT 'Cpu',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_featured boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  country text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  -- RESTRICT: a category/brand with products cannot be deleted (admin UI expects this error).
  category_id uuid REFERENCES categories(id) ON DELETE RESTRICT,
  brand_id uuid REFERENCES brands(id) ON DELETE RESTRICT,
  sku text UNIQUE NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price numeric(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  cost_price numeric(10,2) CHECK (cost_price IS NULL OR cost_price >= 0),
  images text[] DEFAULT '{}',               -- gallery; array order is display order
  primary_image text,
  specifications jsonb DEFAULT '{}'::jsonb,
  features text[] DEFAULT '{}',
  whats_included text[] DEFAULT '{}',
  compatibility text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  rating numeric(3,2) DEFAULT 0,
  review_count int DEFAULT 0,
  stock int DEFAULT 0 CHECK (stock >= 0),
  reserved_stock int DEFAULT 0 CHECK (reserved_stock >= 0),
  low_stock_threshold int DEFAULT 5,
  is_featured boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  is_new_arrival boolean DEFAULT false,
  is_deal boolean DEFAULT false,
  is_published boolean DEFAULT true,
  weight numeric(6,2),
  dimensions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_published ON products(is_published);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_bestseller ON products(is_bestseller);
CREATE INDEX idx_products_new_arrival ON products(is_new_arrival);
CREATE INDEX idx_products_tags ON products USING gin(tags);

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id uuid,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  images text[] DEFAULT '{}',
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (product_id, user_id)
);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ============ CART / WISHLIST / ADDRESSES ============
CREATE TABLE carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 1000),
  created_at timestamptz DEFAULT now(),
  UNIQUE (cart_id, product_id)
);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

CREATE TABLE wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label text DEFAULT 'Home',
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text DEFAULT 'India',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ============ ORDERS / PAYMENTS ============
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','returned','refunded')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded','partially_refunded')),
  payment_method text NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod','razorpay')),
  payment_id text,
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text UNIQUE,
  razorpay_signature text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount numeric(10,2) DEFAULT 0 CHECK (discount >= 0),
  shipping_cost numeric(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  tax numeric(10,2) DEFAULT 0 CHECK (tax >= 0),
  total numeric(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  coupon_code text,
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  idempotency_key text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, idempotency_key)
);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  -- RESTRICT: products that appear in orders cannot be hard-deleted; unpublish them instead.
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,               -- snapshot at purchase time
  product_image text,
  product_slug text,
  sku text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total numeric(10,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Verified payment-provider events (webhooks). No card data or provider secrets are stored.
CREATE TABLE payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_id text NOT NULL,
  event_type text NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);

-- ============ PROMOTIONS ============
CREATE TABLE coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage','fixed')),
  discount_value numeric(10,2) NOT NULL CHECK (discount_value >= 0),
  min_order_value numeric(10,2) DEFAULT 0,
  max_discount numeric(10,2),
  usage_limit int,
  used_count int DEFAULT 0,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  description text,
  image_url text,
  category_label text,
  cta_text text DEFAULT 'Shop Now',
  cta_link text DEFAULT '/shop',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE promo_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  cta_text text DEFAULT 'Shop Now',
  cta_link text DEFAULT '/shop',
  background_color text DEFAULT 'bg-blue-50',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title text,
  description text,
  discount_percentage numeric(5,2),
  sale_price numeric(10,2) NOT NULL CHECK (sale_price >= 0),
  original_price numeric(10,2) NOT NULL CHECK (original_price >= 0),
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_deals_product ON deals(product_id);

-- ============ CONTENT ============
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  estimated_cost numeric(10,2),
  estimated_time text,
  image_url text,
  images text[] DEFAULT '{}',
  video_url text,
  tutorial text,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE project_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  quantity int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_project_components_project ON project_components(project_id);

CREATE TABLE tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category text DEFAULT 'Electronics Basics',
  content text,
  image_url text,
  video_url text,
  difficulty text DEFAULT 'beginner',
  read_time int DEFAULT 5,
  tags text[] DEFAULT '{}',
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX idx_tutorials_category ON tutorials(category);

-- ============ INVENTORY (internal; never exposed through the public API) ============
CREATE TABLE inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL,
  type text NOT NULL CHECK (type IN ('restock','sale','adjustment','reservation','release')),
  reference_id uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_inventory_product ON inventory_transactions(product_id);

-- ============ updated_at TRIGGERS ============
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','profiles','categories','brands','products','reviews','carts',
                           'addresses','orders','coupons','banners','projects','tutorials']
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;

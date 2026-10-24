import { MockQueryBuilder } from './mock-query-builder';
import { CLIENT_DATA_SOURCE } from './data-source';
import { createApiClient } from './api-client';

/**
 * Browser data client used by every page.
 *   DATA_SOURCE=mock     -> in-memory demo data (lib/mock-data.ts); accounts are unavailable.
 *   DATA_SOURCE=postgres -> Next.js API (/api/data, /api/auth/*) backed by PostgreSQL.
 * Both modes expose the same chainable query shape, so pages don't care which one is active.
 */

export interface QueryError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface QueryResult<T = any> {
  data: T;
  error: QueryError | null;
  count: number | null;
}

export interface QueryBuilder extends PromiseLike<QueryResult> {
  select(columns?: string, options?: { count?: string }): QueryBuilder;
  eq(column: string, value: unknown): QueryBuilder;
  neq(column: string, value: unknown): QueryBuilder;
  gt(column: string, value: unknown): QueryBuilder;
  gte(column: string, value: unknown): QueryBuilder;
  lt(column: string, value: unknown): QueryBuilder;
  lte(column: string, value: unknown): QueryBuilder;
  in(column: string, values: unknown[]): QueryBuilder;
  like(column: string, pattern: string): QueryBuilder;
  ilike(column: string, pattern: string): QueryBuilder;
  or(filters: string): QueryBuilder;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder;
  limit(count: number): QueryBuilder;
  range(from: number, to: number): QueryBuilder;
  single(): QueryBuilder;
  maybeSingle(): QueryBuilder;
  insert(values: unknown): QueryBuilder;
  update(values: unknown): QueryBuilder;
  delete(): QueryBuilder;
}

export interface AppUser {
  id: string;
  email?: string;
  email_verified?: boolean;
  user_metadata?: { full_name?: string | null };
}

export type AppSession = { user: AppUser } | null;
type AuthResult = Promise<{ data: any; error: QueryError | null }>;

export interface AuthClient {
  getSession(): Promise<{ data: { session: AppSession }; error: QueryError | null }>;
  onAuthStateChange(cb: (event: string, session: AppSession) => void): { data: { subscription: { unsubscribe(): void } } };
  signInWithPassword(credentials: { email: string; password: string }): AuthResult;
  signUp(credentials: { email: string; password: string; options?: { data?: { full_name?: string } } }): AuthResult;
  signOut(): Promise<{ error: QueryError | null }>;
  updateUser(attributes: { password?: string }): AuthResult;
}

export interface DataClient {
  from(table: string): QueryBuilder;
  auth: AuthClient;
}

const MOCK_AUTH_MESSAGE = 'Accounts are not available on the demo site. Set DATA_SOURCE=postgres to enable sign-in.';

function createMockClient(): DataClient {
  const unavailable = async () => ({ data: null, error: { message: MOCK_AUTH_MESSAGE, code: 'data_source_disabled' } });
  return {
    from: (table) => new MockQueryBuilder(table) as unknown as QueryBuilder,
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (cb) => {
        const t = setTimeout(() => cb('INITIAL_SESSION', null), 0);
        return { data: { subscription: { unsubscribe: () => clearTimeout(t) } } };
      },
      signInWithPassword: unavailable,
      signUp: unavailable,
      signOut: async () => ({ error: null }),
      updateUser: unavailable,
    },
  };
}

export const dataClient: DataClient =
  CLIENT_DATA_SOURCE === 'postgres' ? (createApiClient() as unknown as DataClient) : createMockClient();

/** Row types for the store's tables (shared by mock and PostgreSQL modes). */
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          icon_name: string | null;
          parent_id: string | null;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['categories']['Row']>;
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['brands']['Row']>;
        Update: Partial<Database['public']['Tables']['brands']['Row']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          category_id: string | null;
          brand_id: string | null;
          sku: string;
          price: number;
          compare_at_price: number | null;
          cost_price: number | null;
          images: string[];
          primary_image: string | null;
          specifications: Record<string, string>;
          features: string[];
          whats_included: string[];
          compatibility: string[];
          tags: string[];
          rating: number;
          review_count: number;
          stock: number;
          reserved_stock: number;
          low_stock_threshold: number;
          is_featured: boolean;
          is_bestseller: boolean;
          is_new_arrival: boolean;
          is_deal: boolean;
          is_published: boolean;
          weight: number | null;
          dimensions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['products']['Row']>;
        Update: Partial<Database['public']['Tables']['products']['Row']>;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          order_id: string | null;
          rating: number;
          title: string | null;
          body: string | null;
          images: string[];
          is_verified_purchase: boolean;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['reviews']['Row']>;
        Update: Partial<Database['public']['Tables']['reviews']['Row']>;
      };
      carts: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['carts']['Row']>;
        Update: Partial<Database['public']['Tables']['carts']['Row']>;
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['cart_items']['Row']>;
        Update: Partial<Database['public']['Tables']['cart_items']['Row']>;
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['wishlists']['Row']>;
        Update: Partial<Database['public']['Tables']['wishlists']['Row']>;
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['addresses']['Row']>;
        Update: Partial<Database['public']['Tables']['addresses']['Row']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status: string;
          payment_status: string;
          payment_method: string;
          payment_id: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          subtotal: number;
          discount: number;
          shipping_cost: number;
          tax: number;
          total: number;
          coupon_code: string | null;
          shipping_address: Record<string, string> | null;
          billing_address: Record<string, string> | null;
          notes: string | null;
          courier?: string | null;
          tracking_number?: string | null;
          tracking_url?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['orders']['Row']>;
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_image: string | null;
          product_slug: string | null;
          sku: string | null;
          price: number;
          quantity: number;
          total: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['order_items']['Row']>;
        Update: Partial<Database['public']['Tables']['order_items']['Row']>;
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: string;
          discount_value: number;
          min_order_value: number;
          max_discount: number | null;
          usage_limit: number | null;
          used_count: number;
          user_id: string | null;
          category_id: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['coupons']['Row']>;
        Update: Partial<Database['public']['Tables']['coupons']['Row']>;
      };
      banners: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          image_url: string | null;
          category_label: string | null;
          cta_text: string;
          cta_link: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['banners']['Row']>;
        Update: Partial<Database['public']['Tables']['banners']['Row']>;
      };
      promo_cards: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          cta_text: string;
          cta_link: string;
          background_color: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['promo_cards']['Row']>;
        Update: Partial<Database['public']['Tables']['promo_cards']['Row']>;
      };
      deals: {
        Row: {
          id: string;
          product_id: string;
          title: string | null;
          description: string | null;
          discount_percentage: number | null;
          sale_price: number;
          original_price: number;
          starts_at: string;
          ends_at: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['deals']['Row']>;
        Update: Partial<Database['public']['Tables']['deals']['Row']>;
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          difficulty: string;
          estimated_cost: number | null;
          estimated_time: string | null;
          image_url: string | null;
          images: string[];
          video_url: string | null;
          tutorial: string | null;
          tags: string[];
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['projects']['Row']>;
        Update: Partial<Database['public']['Tables']['projects']['Row']>;
      };
      project_components: {
        Row: {
          id: string;
          project_id: string;
          product_id: string | null;
          name: string;
          quantity: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['project_components']['Row']>;
        Update: Partial<Database['public']['Tables']['project_components']['Row']>;
      };
      tutorials: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          category: string;
          content: string | null;
          image_url: string | null;
          video_url: string | null;
          difficulty: string;
          read_time: number;
          tags: string[];
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['tutorials']['Row']>;
        Update: Partial<Database['public']['Tables']['tutorials']['Row']>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
    };
  };
};

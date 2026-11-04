'use client';

import {
  AdminProduct,
  AdminCategory,
  AdminBrand,
  AdminOrder,
  AdminCustomer,
  AdminPayment,
  AdminCoupon,
  AdminPromotion,
  AdminReview,
  AdminProject,
  AdminTutorial,
  AdminHomepageSection,
  AdminSupportTicket,
  AdminNotification,
  AdminSettings,
  InventoryAdjustment,
  OrderStatus,
  PaymentStatus,
  AdminUser,
} from './admin-types';
import {
  initialProducts,
  initialCategories,
  initialBrands,
  initialOrders,
  initialCustomers,
  initialPayments,
  initialCoupons,
  initialPromotions,
  initialReviews,
  initialProjects,
  initialTutorials,
  initialHomepageSections,
  initialSupportTickets,
  initialNotifications,
  initialSettings,
  initialAdminUsers,
} from './admin-mock-data';
import { dataClient } from '@/lib/data-client';
import { CLIENT_DATA_SOURCE } from '@/lib/data-source';

// Helper for local storage persistence
function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(`qrobo_${key}`);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`qrobo_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to store ${key}`, e);
  }
}

function mapDbProductToAdmin(p: any, catMap: Map<string, string>, brandMap: Map<string, string>): AdminProduct {
  const price = Number(p.price || 0);
  const originalPrice = Number(p.compare_at_price || p.price || 0);
  const discountPercentage = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  let specs: Record<string, string> = {};
  if (typeof p.specifications === 'string') {
    try { specs = JSON.parse(p.specifications); } catch { specs = {}; }
  } else if (p.specifications && typeof p.specifications === 'object') {
    specs = p.specifications;
  }

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    brand: brandMap.get(p.brand_id) || 'Hi Technology',
    category: catMap.get(p.category_id) || 'Components',
    shortDescription: p.short_description || '',
    description: p.description || '',
    price,
    originalPrice,
    discountPercentage,
    taxRate: 18,
    stock: Number(p.stock || 0),
    reservedStock: Number(p.reserved_stock || 0),
    lowStockThreshold: Number(p.low_stock_threshold || 5),
    warehouse: 'Main Hub - Hyderabad',
    primaryImage: p.primary_image || (p.images && p.images[0]) || '',
    galleryImages: p.images || [],
    status: p.is_published ? 'published' : 'draft',
    isFeatured: p.is_featured || false,
    rating: Number(p.rating || 0),
    reviewCount: Number(p.review_count || 0),
    specifications: specs,
    tags: p.tags || [],
    createdAt: p.created_at || new Date().toISOString(),
    updatedAt: p.updated_at || new Date().toISOString(),
  };
}

// In-memory / localStorage stores
let products = getStorage<AdminProduct[]>('admin_products_v37', initialProducts);
let categories = getStorage<AdminCategory[]>('admin_categories_v37', initialCategories);
let brands = getStorage<AdminBrand[]>('admin_brands', initialBrands);
let orders = getStorage<AdminOrder[]>('admin_orders', initialOrders);
let customers = getStorage<AdminCustomer[]>('admin_customers', initialCustomers);
let payments = getStorage<AdminPayment[]>('admin_payments', initialPayments);
let coupons = getStorage<AdminCoupon[]>('admin_coupons', initialCoupons);
let promotions = getStorage<AdminPromotion[]>('admin_promotions', initialPromotions);
let reviews = getStorage<AdminReview[]>('admin_reviews', initialReviews);
let projects = getStorage<AdminProject[]>('admin_projects', initialProjects);
let tutorials = getStorage<AdminTutorial[]>('admin_tutorials', initialTutorials);
let homepageSections = getStorage<AdminHomepageSection[]>('admin_homepage_sections', initialHomepageSections);
let supportTickets = getStorage<AdminSupportTicket[]>('admin_support_tickets', initialSupportTickets);
let notifications = getStorage<AdminNotification[]>('admin_notifications', initialNotifications);
let settings = getStorage<AdminSettings>('admin_settings', initialSettings);
let adminUsers = getStorage<AdminUser[]>('admin_users_v2', initialAdminUsers);
if (!adminUsers || !adminUsers.some((u) => u.email === 'chirrauday02@gmail.com')) {
  adminUsers = initialAdminUsers;
  setStorage('admin_users_v2', adminUsers);
}
let adjustments = getStorage<InventoryAdjustment[]>('admin_adjustments', []);

export const adminService = {
  // --- DASHBOARD METRICS ---
  async getDashboardMetrics() {
    const prods = await this.getProducts();
    const ords = await this.getOrders();
    const custs = await this.getCustomers();

    const totalRevenue = ords
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((acc, curr) => acc + curr.grandTotal, 0);

    const pendingOrdersCount = ords.filter((o) => o.orderStatus === 'pending').length;
    const lowStockCount = prods.filter((p) => p.stock <= p.lowStockThreshold).length;

    // Status breakdown
    const statusCounts: Record<OrderStatus, number> = {
      pending: ords.filter((o) => o.orderStatus === 'pending').length,
      processing: ords.filter((o) => o.orderStatus === 'processing').length,
      packed: ords.filter((o) => o.orderStatus === 'packed').length,
      shipped: ords.filter((o) => o.orderStatus === 'shipped').length,
      delivered: ords.filter((o) => o.orderStatus === 'delivered').length,
      cancelled: ords.filter((o) => o.orderStatus === 'cancelled').length,
      returned: ords.filter((o) => o.orderStatus === 'returned').length,
    };

    return {
      totalRevenue,
      totalRevenueGrowth: 18.4,
      totalOrders: ords.length,
      totalOrdersGrowth: 12.8,
      totalCustomers: custs.length,
      totalCustomersGrowth: 24.5,
      totalProducts: prods.length,
      totalProductsGrowth: 8.2,
      pendingOrders: pendingOrdersCount,
      lowStockProducts: lowStockCount,
      recentOrders: ords.slice(0, 5),
      topProducts: prods.slice(0, 5),
      lowStockAlerts: prods.filter((p) => p.stock <= p.lowStockThreshold).slice(0, 5),
      orderStatusCounts: statusCounts,
    };
  },

  // --- PRODUCTS ---
  async getProducts(): Promise<AdminProduct[]> {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          dataClient.from('products').select('*').limit(2000),
          dataClient.from('categories').select('id, name, slug').limit(500),
          dataClient.from('brands').select('id, name, slug').limit(500),
        ]);
        if (prodRes.data && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
          const catMap = new Map<string, string>();
          (catRes.data || []).forEach((c: any) => {
            catMap.set(c.id, c.name);
            catMap.set(c.slug, c.name);
          });
          const brandMap = new Map<string, string>();
          (brandRes.data || []).forEach((b: any) => {
            brandMap.set(b.id, b.name);
            brandMap.set(b.slug, b.name);
          });

          const dbProducts = prodRes.data.map((p: any) => mapDbProductToAdmin(p, catMap, brandMap));
          products = dbProducts;
          return dbProducts;
        }
      } catch (err) {
        console.warn('PostgreSQL getProducts error:', err);
      }
    }
    return [...products];
  },

  async getProductById(id: string): Promise<AdminProduct | null> {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const { data } = await dataClient.from('products').select('*').eq('id', id).maybeSingle();
        if (data) {
          const cats = await this.getCategories();
          const brs = await this.getBrands();
          const catMap = new Map<string, string>();
          cats.forEach((c) => { catMap.set(c.id, c.name); catMap.set(c.slug, c.name); });
          const brandMap = new Map<string, string>();
          brs.forEach((b) => { brandMap.set(b.id, b.name); brandMap.set(b.slug, b.name); });
          return mapDbProductToAdmin(data, catMap, brandMap);
        }
      } catch (err) {
        console.warn('PostgreSQL getProductById error:', err);
      }
    }
    return products.find((p) => p.id === id) || null;
  },

  async createProduct(data: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const catRes = await dataClient.from('categories').select('id').eq('name', data.category).maybeSingle();
        const brandRes = await dataClient.from('brands').select('id').eq('name', data.brand).maybeSingle();

        const insertRes = await dataClient.from('products').insert({
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          sku: data.sku,
          price: data.price,
          compare_at_price: data.originalPrice,
          stock: data.stock,
          reserved_stock: data.reservedStock || 0,
          low_stock_threshold: data.lowStockThreshold || 5,
          is_published: data.status === 'published',
          category_id: catRes.data?.id || undefined,
          brand_id: brandRes.data?.id || undefined,
          primary_image: data.primaryImage,
          images: data.galleryImages,
          description: data.description,
          short_description: data.shortDescription,
          specifications: data.specifications,
          tags: data.tags,
        }).select('id').single();

        if (insertRes.data?.id) {
          const created = await this.getProductById(insertRes.data.id);
          if (created) return created;
        }
      } catch (err) {
        console.warn('PostgreSQL createProduct error:', err);
      }
    }
    const newProduct: AdminProduct = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products = [newProduct, ...products];
    setStorage('admin_products_v37', products);
    return newProduct;
  },

  async updateProduct(id: string, data: Partial<AdminProduct>) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const updates: any = {};
        if (data.name !== undefined) updates.name = data.name;
        if (data.price !== undefined) updates.price = data.price;
        if (data.originalPrice !== undefined) updates.compare_at_price = data.originalPrice;
        if (data.stock !== undefined) updates.stock = data.stock;
        if (data.status !== undefined) updates.is_published = data.status === 'published';
        if (data.shortDescription !== undefined) updates.short_description = data.shortDescription;
        if (data.description !== undefined) updates.description = data.description;
        if (data.primaryImage !== undefined) updates.primary_image = data.primaryImage;
        if (data.galleryImages !== undefined) updates.images = data.galleryImages;
        if (data.specifications !== undefined) updates.specifications = data.specifications;
        if (data.tags !== undefined) updates.tags = data.tags;

        if (Object.keys(updates).length > 0) {
          await dataClient.from('products').update(updates).eq('id', id);
        }
      } catch (err) {
        console.warn('PostgreSQL updateProduct error:', err);
      }
    }
    products = products.map((p) =>
      p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    );
    setStorage('admin_products_v37', products);
    return products.find((p) => p.id === id) || null;
  },

  async deleteProduct(id: string) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        await dataClient.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('PostgreSQL deleteProduct error:', err);
      }
    }
    products = products.filter((p) => p.id !== id);
    setStorage('admin_products_v37', products);
    return true;
  },

  async duplicateProduct(id: string) {
    const existing = await this.getProductById(id);
    if (!existing) return null;
    const copy: AdminProduct = {
      ...existing,
      id: `prod-${Date.now()}`,
      name: `${existing.name} (Copy)`,
      sku: `${existing.sku}-COPY`,
      slug: `${existing.slug}-copy`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.createProduct(copy);
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<AdminCategory[]> {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const { data } = await dataClient.from('categories').select('*').order('sort_order').limit(500);
        if (data && Array.isArray(data) && data.length > 0) {
          const dbCategories: AdminCategory[] = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            parentId: c.parent_id || null,
            image: c.image_url || '',
            iconName: c.icon_name || 'Cpu',
            productCount: 0,
            sortOrder: c.sort_order || 0,
            isFeatured: c.is_featured || false,
            status: 'active',
          }));
          categories = dbCategories;
          return dbCategories;
        }
      } catch (err) {
        console.warn('PostgreSQL getCategories error:', err);
      }
    }
    return [...categories];
  },

  async createCategory(data: Omit<AdminCategory, 'id' | 'productCount'>) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const insertRes = await dataClient.from('categories').insert({
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: data.description,
          icon_name: data.iconName || 'Cpu',
          image_url: data.image,
          is_featured: data.isFeatured,
          sort_order: data.sortOrder,
        }).select('id').single();

        if (insertRes.data?.id) {
          return {
            ...data,
            id: insertRes.data.id,
            productCount: 0,
          };
        }
      } catch (err) {
        console.warn('PostgreSQL createCategory error:', err);
      }
    }
    const newCat: AdminCategory = {
      ...data,
      id: `cat-${Date.now()}`,
      productCount: 0,
    };
    categories = [...categories, newCat];
    setStorage('admin_categories_v37', categories);
    return newCat;
  },

  async updateCategory(id: string, data: Partial<AdminCategory>) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const updates: any = {};
        if (data.name !== undefined) updates.name = data.name;
        if (data.description !== undefined) updates.description = data.description;
        if (data.iconName !== undefined) updates.icon_name = data.iconName;
        if (data.image !== undefined) updates.image_url = data.image;
        if (data.isFeatured !== undefined) updates.is_featured = data.isFeatured;
        if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;

        if (Object.keys(updates).length > 0) {
          await dataClient.from('categories').update(updates).eq('id', id);
        }
      } catch (err) {
        console.warn('PostgreSQL updateCategory error:', err);
      }
    }
    categories = categories.map((c) => (c.id === id ? { ...c, ...data } : c));
    setStorage('admin_categories_v37', categories);
    return categories.find((c) => c.id === id) || null;
  },

  async deleteCategory(id: string) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        await dataClient.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('PostgreSQL deleteCategory error:', err);
      }
    }
    categories = categories.filter((c) => c.id !== id);
    setStorage('admin_categories_v37', categories);
    return true;
  },

  // --- BRANDS ---
  async getBrands(): Promise<AdminBrand[]> {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const { data } = await dataClient.from('brands').select('*').order('name').limit(500);
        if (data && Array.isArray(data) && data.length > 0) {
          const dbBrands: AdminBrand[] = data.map((b: any) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            description: b.description || '',
            logo: b.logo_url || '',
            productCount: 0,
            status: 'active',
          }));
          brands = dbBrands;
          return dbBrands;
        }
      } catch (err) {
        console.warn('PostgreSQL getBrands error:', err);
      }
    }
    return [...brands];
  },

  async createBrand(data: Omit<AdminBrand, 'id' | 'productCount'>) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const insertRes = await dataClient.from('brands').insert({
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: data.description,
          logo_url: data.logo,
        }).select('id').single();

        if (insertRes.data?.id) {
          return {
            ...data,
            id: insertRes.data.id,
            productCount: 0,
          };
        }
      } catch (err) {
        console.warn('PostgreSQL createBrand error:', err);
      }
    }
    const newBrand: AdminBrand = {
      ...data,
      id: `brand-${Date.now()}`,
      productCount: 0,
    };
    brands = [...brands, newBrand];
    setStorage('admin_brands', brands);
    return newBrand;
  },

  async updateBrand(id: string, data: Partial<AdminBrand>) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const updates: any = {};
        if (data.name !== undefined) updates.name = data.name;
        if (data.description !== undefined) updates.description = data.description;
        if (data.logo !== undefined) updates.logo_url = data.logo;

        if (Object.keys(updates).length > 0) {
          await dataClient.from('brands').update(updates).eq('id', id);
        }
      } catch (err) {
        console.warn('PostgreSQL updateBrand error:', err);
      }
    }
    brands = brands.map((b) => (b.id === id ? { ...b, ...data } : b));
    setStorage('admin_brands', brands);
    return brands.find((b) => b.id === id) || null;
  },

  async deleteBrand(id: string) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        await dataClient.from('brands').delete().eq('id', id);
      } catch (err) {
        console.warn('PostgreSQL deleteBrand error:', err);
      }
    }
    brands = brands.filter((b) => b.id !== id);
    setStorage('admin_brands', brands);
    return true;
  },

  // --- INVENTORY ---
  async getInventory() {
    const prods = await this.getProducts();
    return prods.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      warehouse: p.warehouse,
      availableStock: p.stock - p.reservedStock,
      reservedStock: p.reservedStock,
      totalStock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      status:
        p.stock <= 0
          ? 'out_of_stock'
          : p.stock <= p.lowStockThreshold
          ? 'low_stock'
          : 'in_stock',
    }));
  },

  async getAdjustments() {
    return [...adjustments];
  },

  async adjustStock(
    productId: string,
    delta: number,
    type: InventoryAdjustment['type'],
    reason: string,
    adjustedBy = 'Admin'
  ) {
    const product = await this.getProductById(productId);
    if (!product) return null;

    const previousStock = product.stock;
    const newStock = Math.max(0, previousStock + delta);

    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        await dataClient.from('products').update({ stock: newStock }).eq('id', productId);
      } catch (err) {
        console.warn('PostgreSQL adjustStock error:', err);
      }
    }

    product.stock = newStock;
    product.updatedAt = new Date().toISOString();
    products = products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p));
    setStorage('admin_products_v37', products);

    const log: InventoryAdjustment = {
      id: `adj-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      previousStock,
      adjustedQuantity: delta,
      newStock,
      type,
      reason,
      adjustedBy,
      timestamp: new Date().toISOString(),
    };
    adjustments = [log, ...adjustments];
    setStorage('admin_adjustments', adjustments);
    return { product, log };
  },

  // --- ORDERS ---
  async getOrders(): Promise<AdminOrder[]> {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const { data } = await dataClient.from('orders').select('*, order_items(*)').limit(500);
        if (data && Array.isArray(data) && data.length > 0) {
          const dbOrders: AdminOrder[] = data.map((o: any) => {
            const addr = typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : (o.shipping_address || {});
            const subtotal = Number(o.subtotal || 0);
            const tax = Number(o.tax || 0);
            const shippingFee = Number(o.shipping_cost || 0);
            const discount = Number(o.discount || 0);
            const grandTotal = Number(o.total || 0);
            
            return {
              id: o.id,
              orderNumber: o.order_number,
              customerId: o.user_id,
              customerName: addr.full_name || 'Customer',
              customerEmail: addr.email || '',
              customerPhone: addr.phone || '',
              items: (o.order_items || []).map((it: any) => ({
                id: it.id,
                productId: it.product_id,
                name: it.product_name,
                sku: it.sku || '',
                image: it.product_image || '',
                price: Number(it.price || 0),
                quantity: Number(it.quantity || 1),
                total: Number(it.total || 0),
              })),
              subtotal,
              tax,
              shippingFee,
              discount,
              grandTotal,
              discountTotal: discount,
              taxTotal: tax,
              shippingTotal: shippingFee,
              orderStatus: (o.status || 'pending').toLowerCase() as OrderStatus,
              paymentStatus: (o.payment_status || 'pending').toLowerCase() as PaymentStatus,
              paymentMethod: o.payment_method || 'cod',
              trackingNumber: o.tracking_number || '',
              carrier: o.courier || '',
              timeline: [
                {
                  status: (o.status || 'pending').toLowerCase() as OrderStatus,
                  label: (o.status || 'PENDING').toUpperCase(),
                  timestamp: o.created_at || new Date().toISOString(),
                  done: true,
                }
              ],
              shippingAddress: {
                fullName: addr.full_name || 'Customer',
                street: addr.address_line1 || '',
                city: addr.city || '',
                state: addr.state || '',
                postalCode: addr.postal_code || '',
                country: addr.country || 'India',
                phone: addr.phone || '',
              },
              billingAddress: {
                fullName: addr.full_name || 'Customer',
                street: addr.address_line1 || '',
                city: addr.city || '',
                state: addr.state || '',
                postalCode: addr.postal_code || '',
                country: addr.country || 'India',
              },
              createdAt: o.created_at || new Date().toISOString(),
              updatedAt: o.updated_at || new Date().toISOString(),
            };
          });
          orders = dbOrders;
          return dbOrders;
        }
      } catch (err) {
        console.warn('PostgreSQL getOrders error:', err);
      }
    }
    return [...orders];
  },

  async getOrderById(id: string) {
    const ords = await this.getOrders();
    return ords.find((o) => o.id === id) || null;
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        await dataClient.from('orders').update({ status }).eq('id', id);
      } catch (err) {
        console.warn('PostgreSQL updateOrderStatus error:', err);
      }
    }
    orders = orders.map((o) => {
      if (o.id !== id) return o;
      const updatedTimeline = [...o.timeline];
      const existingStep = updatedTimeline.find((t) => t.status === status);
      if (existingStep) {
        existingStep.done = true;
        existingStep.timestamp = new Date().toISOString();
        if (note) existingStep.note = note;
      } else {
        updatedTimeline.push({
          status,
          label: status.toUpperCase(),
          timestamp: new Date().toISOString(),
          note,
          done: true,
        });
      }
      return {
        ...o,
        orderStatus: status,
        timeline: updatedTimeline,
        updatedAt: new Date().toISOString(),
      };
    });
    setStorage('admin_orders', orders);
    return orders.find((o) => o.id === id) || null;
  },

  async updateOrderTracking(id: string, trackingNumber: string, carrier: string) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        await dataClient.from('orders').update({
          courier: carrier,
          tracking_number: trackingNumber,
          status: 'shipped',
        }).eq('id', id);
      } catch (err) {
        console.warn('PostgreSQL updateOrderTracking error:', err);
      }
    }
    orders = orders.map((o) =>
      o.id === id
        ? {
            ...o,
            trackingNumber,
            carrier,
            orderStatus: o.orderStatus === 'packed' ? 'shipped' : o.orderStatus,
            updatedAt: new Date().toISOString(),
          }
        : o
    );
    setStorage('admin_orders', orders);
    return orders.find((o) => o.id === id) || null;
  },

  // --- CUSTOMERS ---
  async getCustomers() {
    return [...customers];
  },

  async getCustomerById(id: string) {
    const customer = customers.find((c) => c.id === id) || null;
    if (!customer) return null;
    const ords = await this.getOrders();
    const customerOrders = ords.filter((o) => o.customerId === id);
    return { ...customer, orders: customerOrders };
  },

  async updateCustomerStatus(id: string, status: 'active' | 'suspended') {
    customers = customers.map((c) => (c.id === id ? { ...c, status } : c));
    setStorage('admin_customers', customers);
    return customers.find((c) => c.id === id) || null;
  },

  // --- PAYMENTS ---
  async getPayments() {
    return [...payments];
  },

  async refundPayment(id: string) {
    payments = payments.map((p) =>
      p.id === id ? { ...p, status: 'refunded' as PaymentStatus } : p
    );
    setStorage('admin_payments', payments);
    return payments.find((p) => p.id === id) || null;
  },

  // --- COUPONS ---
  async getCoupons(): Promise<AdminCoupon[]> {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const { data } = await dataClient.from('coupons').select('*');
        if (data && Array.isArray(data) && data.length > 0) {
          const dbCoupons: AdminCoupon[] = data.map((c: any) => ({
            id: c.id,
            code: c.code,
            description: c.description || '',
            discountType: (c.discount_type || 'percentage') as 'percentage' | 'fixed',
            discountValue: Number(c.discount_value || 0),
            minOrderValue: Number(c.min_order_value || 0),
            maxDiscount: Number(c.max_discount || 0),
            usageLimit: Number(c.usage_limit || 100),
            usedCount: Number(c.used_count || 0),
            perCustomerLimit: 1,
            startDate: c.created_at || new Date().toISOString(),
            endDate: c.expires_at || new Date(Date.now() + 30 * 86400000).toISOString(),
            status: c.is_active ? 'active' : 'inactive',
          }));
          coupons = dbCoupons;
          return dbCoupons;
        }
      } catch (err) {
        console.warn('PostgreSQL getCoupons error:', err);
      }
    }
    return [...coupons];
  },

  async createCoupon(data: Omit<AdminCoupon, 'id' | 'usedCount'>) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const insertRes = await dataClient.from('coupons').insert({
          code: data.code,
          description: data.description,
          discount_type: data.discountType,
          discount_value: data.discountValue,
          min_order_value: data.minOrderValue,
          max_discount: data.maxDiscount,
          usage_limit: data.usageLimit,
          is_active: data.status === 'active',
          expires_at: data.endDate,
        }).select('id').single();

        if (insertRes.data?.id) {
          return {
            ...data,
            id: insertRes.data.id,
            usedCount: 0,
          };
        }
      } catch (err) {
        console.warn('PostgreSQL createCoupon error:', err);
      }
    }
    const newCoupon: AdminCoupon = {
      ...data,
      id: `coup-${Date.now()}`,
      usedCount: 0,
    };
    coupons = [newCoupon, ...coupons];
    setStorage('admin_coupons', coupons);
    return newCoupon;
  },

  async updateCoupon(id: string, data: Partial<AdminCoupon>) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const updates: any = {};
        if (data.code !== undefined) updates.code = data.code;
        if (data.description !== undefined) updates.description = data.description;
        if (data.discountType !== undefined) updates.discount_type = data.discountType;
        if (data.discountValue !== undefined) updates.discount_value = data.discountValue;
        if (data.minOrderValue !== undefined) updates.min_order_value = data.minOrderValue;
        if (data.maxDiscount !== undefined) updates.max_discount = data.maxDiscount;
        if (data.usageLimit !== undefined) updates.usage_limit = data.usageLimit;
        if (data.status !== undefined) updates.is_active = data.status === 'active';
        if (data.endDate !== undefined) updates.expires_at = data.endDate;

        if (Object.keys(updates).length > 0) {
          await dataClient.from('coupons').update(updates).eq('id', id);
        }
      } catch (err) {
        console.warn('PostgreSQL updateCoupon error:', err);
      }
    }
    coupons = coupons.map((c) => (c.id === id ? { ...c, ...data } : c));
    setStorage('admin_coupons', coupons);
    return coupons.find((c) => c.id === id) || null;
  },

  async deleteCoupon(id: string) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        await dataClient.from('coupons').delete().eq('id', id);
      } catch (err) {
        console.warn('PostgreSQL deleteCoupon error:', err);
      }
    }
    coupons = coupons.filter((c) => c.id !== id);
    setStorage('admin_coupons', coupons);
    return true;
  },

  // --- PROMOTIONS ---
  async getPromotions() {
    return [...promotions];
  },

  async createPromotion(data: Omit<AdminPromotion, 'id'>) {
    const newPromo: AdminPromotion = {
      ...data,
      id: `promo-${Date.now()}`,
    };
    promotions = [newPromo, ...promotions];
    setStorage('admin_promotions', promotions);
    return newPromo;
  },

  async updatePromotion(id: string, data: Partial<AdminPromotion>) {
    promotions = promotions.map((p) => (p.id === id ? { ...p, ...data } : p));
    setStorage('admin_promotions', promotions);
    return promotions.find((p) => p.id === id) || null;
  },

  async deletePromotion(id: string) {
    promotions = promotions.filter((p) => p.id !== id);
    setStorage('admin_promotions', promotions);
    return true;
  },

  // --- REVIEWS ---
  async getReviews(): Promise<AdminReview[]> {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const { data } = await dataClient.from('reviews').select('*').limit(500);
        if (data && Array.isArray(data) && data.length > 0) {
          const prods = await this.getProducts();
          const prodMap = new Map<string, { name: string; image: string }>();
          prods.forEach((p) => prodMap.set(p.id, { name: p.name, image: p.primaryImage }));

          const dbReviews: AdminReview[] = data.map((r: any) => ({
            id: r.id,
            productId: r.product_id,
            productName: prodMap.get(r.product_id)?.name || 'Robotics Product',
            productImage: prodMap.get(r.product_id)?.image || '',
            customerId: r.user_id || 'cust-1',
            customerName: 'Verified Customer',
            isVerifiedPurchase: r.is_verified_purchase || false,
            rating: Number(r.rating || 5),
            title: r.title || 'Product Review',
            comment: r.body || '',
            status: r.is_approved ? 'approved' : 'pending',
            createdAt: r.created_at || new Date().toISOString(),
          }));
          reviews = dbReviews;
          return dbReviews;
        }
      } catch (err) {
        console.warn('PostgreSQL getReviews error:', err);
      }
    }
    return [...reviews];
  },

  async updateReviewStatus(id: string, status: AdminReview['status']) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        await dataClient.from('reviews').update({ is_approved: status === 'approved' }).eq('id', id);
      } catch (err) {
        console.warn('PostgreSQL updateReviewStatus error:', err);
      }
    }
    reviews = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    setStorage('admin_reviews', reviews);
    return reviews.find((r) => r.id === id) || null;
  },

  async deleteReview(id: string) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        await dataClient.from('reviews').delete().eq('id', id);
      } catch (err) {
        console.warn('PostgreSQL deleteReview error:', err);
      }
    }
    reviews = reviews.filter((r) => r.id !== id);
    setStorage('admin_reviews', reviews);
    return true;
  },

  // --- PROJECTS ---
  async getProjects(): Promise<AdminProject[]> {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const { data } = await dataClient.from('projects').select('*').limit(100);
        if (data && Array.isArray(data) && data.length > 0) {
          const dbProjects: AdminProject[] = data.map((pr: any) => ({
            id: pr.id,
            title: pr.title,
            slug: pr.slug,
            description: pr.description || '',
            difficulty: (pr.difficulty?.charAt(0).toUpperCase() + pr.difficulty?.slice(1)) || 'Beginner',
            estimatedTime: pr.estimated_time || '2 Hours',
            estimatedCost: Number(pr.estimated_cost || 500),
            image: pr.image_url || '',
            requiredComponents: [],
            instructions: pr.tutorial || '',
            status: pr.is_published ? 'published' : 'draft',
            createdAt: pr.created_at || new Date().toISOString(),
          }));
          projects = dbProjects;
          return dbProjects;
        }
      } catch (err) {
        console.warn('PostgreSQL getProjects error:', err);
      }
    }
    return [...projects];
  },

  async createProject(data: Omit<AdminProject, 'id' | 'createdAt'>) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const insertRes = await dataClient.from('projects').insert({
          title: data.title,
          slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: data.description,
          difficulty: data.difficulty.toLowerCase(),
          estimated_time: data.estimatedTime,
          estimated_cost: data.estimatedCost,
          image_url: data.image,
          tutorial: data.instructions,
          is_published: data.status === 'published',
        }).select('id').single();

        if (insertRes.data?.id) {
          return {
            ...data,
            id: insertRes.data.id,
            createdAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('PostgreSQL createProject error:', err);
      }
    }
    const newPrj: AdminProject = {
      ...data,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    projects = [newPrj, ...projects];
    setStorage('admin_projects', projects);
    return newPrj;
  },

  async updateProject(id: string, data: Partial<AdminProject>) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const updates: any = {};
        if (data.title !== undefined) updates.title = data.title;
        if (data.description !== undefined) updates.description = data.description;
        if (data.difficulty !== undefined) updates.difficulty = data.difficulty.toLowerCase();
        if (data.estimatedTime !== undefined) updates.estimated_time = data.estimatedTime;
        if (data.estimatedCost !== undefined) updates.estimated_cost = data.estimatedCost;
        if (data.image !== undefined) updates.image_url = data.image;
        if (data.instructions !== undefined) updates.tutorial = data.instructions;
        if (data.status !== undefined) updates.is_published = data.status === 'published';

        if (Object.keys(updates).length > 0) {
          await dataClient.from('projects').update(updates).eq('id', id);
        }
      } catch (err) {
        console.warn('PostgreSQL updateProject error:', err);
      }
    }
    projects = projects.map((p) => (p.id === id ? { ...p, ...data } : p));
    setStorage('admin_projects', projects);
    return projects.find((p) => p.id === id) || null;
  },

  async deleteProject(id: string) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        await dataClient.from('projects').delete().eq('id', id);
      } catch (err) {
        console.warn('PostgreSQL deleteProject error:', err);
      }
    }
    projects = projects.filter((p) => p.id !== id);
    setStorage('admin_projects', projects);
    return true;
  },

  // --- TUTORIALS ---
  async getTutorials(): Promise<AdminTutorial[]> {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const { data } = await dataClient.from('tutorials').select('*').limit(100);
        if (data && Array.isArray(data) && data.length > 0) {
          const dbTutorials: AdminTutorial[] = data.map((t: any) => ({
            id: t.id,
            title: t.title,
            slug: t.slug,
            category: 'Robotics',
            tags: t.tags || ['Robotics', 'Tutorial'],
            thumbnail: t.image_url || '',
            readTime: '10 min',
            content: t.content || t.description || '',
            author: 'Qrobo Engineering',
            status: t.is_published ? 'published' : 'draft',
            createdAt: t.created_at || new Date().toISOString(),
          }));
          tutorials = dbTutorials;
          return dbTutorials;
        }
      } catch (err) {
        console.warn('PostgreSQL getTutorials error:', err);
      }
    }
    return [...tutorials];
  },

  async createTutorial(data: Omit<AdminTutorial, 'id' | 'createdAt'>) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const insertRes = await dataClient.from('tutorials').insert({
          title: data.title,
          slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: data.content,
          content: data.content,
          image_url: data.thumbnail,
          is_published: data.status === 'published',
        }).select('id').single();

        if (insertRes.data?.id) {
          return {
            ...data,
            id: insertRes.data.id,
            createdAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('PostgreSQL createTutorial error:', err);
      }
    }
    const newTut: AdminTutorial = {
      ...data,
      id: `tut-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    tutorials = [newTut, ...tutorials];
    setStorage('admin_tutorials', tutorials);
    return newTut;
  },

  async updateTutorial(id: string, data: Partial<AdminTutorial>) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        const updates: any = {};
        if (data.title !== undefined) updates.title = data.title;
        if (data.content !== undefined) {
          updates.content = data.content;
          updates.description = data.content;
        }
        if (data.thumbnail !== undefined) updates.image_url = data.thumbnail;
        if (data.status !== undefined) updates.is_published = data.status === 'published';

        if (Object.keys(updates).length > 0) {
          await dataClient.from('tutorials').update(updates).eq('id', id);
        }
      } catch (err) {
        console.warn('PostgreSQL updateTutorial error:', err);
      }
    }
    tutorials = tutorials.map((t) => (t.id === id ? { ...t, ...data } : t));
    setStorage('admin_tutorials', tutorials);
    return tutorials.find((t) => t.id === id) || null;
  },

  async deleteTutorial(id: string) {
    if (CLIENT_DATA_SOURCE === 'postgres') {
      try {
        await dataClient.from('tutorials').delete().eq('id', id);
      } catch (err) {
        console.warn('PostgreSQL deleteTutorial error:', err);
      }
    }
    tutorials = tutorials.filter((t) => t.id !== id);
    setStorage('admin_tutorials', tutorials);
    return true;
  },

  // --- HOMEPAGE SECTIONS ---
  async getHomepageSections() {
    return [...homepageSections];
  },

  async updateHomepageSection(id: string, data: Partial<AdminHomepageSection>) {
    homepageSections = homepageSections.map((s) => (s.id === id ? { ...s, ...data } : s));
    setStorage('admin_homepage_sections', homepageSections);
    return homepageSections.find((s) => s.id === id) || null;
  },

  async reorderHomepageSections(reordered: AdminHomepageSection[]) {
    homepageSections = reordered;
    setStorage('admin_homepage_sections', homepageSections);
    return [...homepageSections];
  },

  // --- SUPPORT TICKETS ---
  async getSupportTickets() {
    return [...supportTickets];
  },

  async updateTicketStatus(id: string, status: AdminSupportTicket['status']) {
    supportTickets = supportTickets.map((t) => (t.id === id ? { ...t, status } : t));
    setStorage('admin_support_tickets', supportTickets);
    return supportTickets.find((t) => t.id === id) || null;
  },

  async replyToTicket(id: string, message: string, agentName = 'Support Agent') {
    let updated: AdminSupportTicket | null = null;
    supportTickets = supportTickets.map((t) => {
      if (t.id !== id) return t;
      const res = {
        id: `reply-${Date.now()}`,
        sender: agentName,
        role: 'agent' as const,
        message,
        timestamp: new Date().toISOString(),
      };
      const prevReplies = t.replies || [];
      updated = {
        ...t,
        status: 'in_progress',
        replies: [...prevReplies, res],
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });
    setStorage('admin_support_tickets', supportTickets);
    return updated;
  },

  // --- USERS / STAFF ---
  async getAdminUsers() {
    return [...adminUsers];
  },

  async createAdminUser(data: Omit<AdminUser, 'id' | 'createdAt'>) {
    const newUser: AdminUser = {
      ...data,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    adminUsers = [...adminUsers, newUser];
    setStorage('admin_users_v2', adminUsers);
    return newUser;
  },

  async updateAdminUser(id: string, data: Partial<AdminUser>) {
    adminUsers = adminUsers.map((u) => (u.id === id ? { ...u, ...data } : u));
    setStorage('admin_users_v2', adminUsers);
    return adminUsers.find((u) => u.id === id) || null;
  },

  // --- SETTINGS ---
  async getSettings() {
    return { ...settings };
  },

  async updateSettings(newSettings: Partial<AdminSettings>) {
    settings = { ...settings, ...newSettings };
    setStorage('admin_settings', settings);
    return { ...settings };
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    return [...notifications];
  },

  async markNotificationRead(id: string) {
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setStorage('admin_notifications', notifications);
    return true;
  },

  async markAllNotificationsRead() {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    setStorage('admin_notifications', notifications);
    return true;
  },

  // --- SEARCH ---
  async globalSearch(query: string) {
    if (!query.trim()) return { products: [], orders: [], customers: [] };
    const q = query.toLowerCase();
    const prods = await this.getProducts();
    const ords = await this.getOrders();
    const custs = await this.getCustomers();
    const pMatches = prods
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 5);
    const oMatches = ords
      .filter((o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
      .slice(0, 5);
    const cMatches = custs
      .filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
      .slice(0, 5);
    return { products: pMatches, orders: oMatches, customers: cMatches };
  },

  // --- ANALYTICS ---
  async getAnalytics(period: 'Today' | '7 Days' | '30 Days' | '90 Days' | '1 Year') {
    const ords = await this.getOrders();
    const prods = await this.getProducts();

    const paidOrders = ords.filter((o) => o.paymentStatus === 'paid');
    const totalRev = paidOrders.reduce((a, b) => a + b.grandTotal, 0);
    const totalOrdersCount = ords.length;
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRev / totalOrdersCount) : 0;

    const summary = {
      totalRevenue: totalRev,
      totalOrders: totalOrdersCount,
      averageOrderValue: avgOrderValue,
      conversionRate: 2.8,
      customerGrowthRate: 14.2,
      refundRate: 0.4,
    };

    const categoryDistribution = [
      { name: 'Microcontrollers', value: 35, color: '#3b82f6' },
      { name: 'Robotics & Kits', value: 25, color: '#10b981' },
      { name: 'Sensors & Modules', value: 20, color: '#8b5cf6' },
      { name: 'Power & ICs', value: 12, color: '#f59e0b' },
      { name: 'Other Components', value: 8, color: '#64748b' },
    ];

    const timeSeries = [
      { label: 'Week 1', revenue: Math.round(totalRev * 0.2) || 12500, orders: Math.round(totalOrdersCount * 0.2) || 8 },
      { label: 'Week 2', revenue: Math.round(totalRev * 0.25) || 18200, orders: Math.round(totalOrdersCount * 0.25) || 12 },
      { label: 'Week 3', revenue: Math.round(totalRev * 0.25) || 21400, orders: Math.round(totalOrdersCount * 0.25) || 15 },
      { label: 'Week 4', revenue: Math.round(totalRev * 0.3) || 26800, orders: Math.round(totalOrdersCount * 0.3) || 19 },
    ];

    return {
      summary,
      timeSeries,
      categoryDistribution,
      revenue: totalRev,
      orders: totalOrdersCount,
      averageOrderValue: avgOrderValue,
      categorySales: [
        { name: 'Microcontrollers', value: 45 },
        { name: 'Robotics', value: 30 },
        { name: 'Sensors', value: 15 },
        { name: 'Tools', value: 10 },
      ],
      topSelling: prods.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        sales: 120,
        revenue: 120 * p.price,
      })),
    };
  },
};

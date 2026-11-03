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

// In-memory / localStorage stores
let products = getStorage<AdminProduct[]>('admin_products_v37', initialProducts);
if (!products || products.length !== initialProducts.length) {
  products = initialProducts;
  setStorage('admin_products_v37', products);
}

let categories = getStorage<AdminCategory[]>('admin_categories_v37', initialCategories);
if (!categories || categories.length !== initialCategories.length) {
  categories = initialCategories;
  setStorage('admin_categories_v37', categories);
}
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
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((acc, curr) => acc + curr.grandTotal, 0);

    const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'pending').length;
    const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

    // Status breakdown
    const statusCounts: Record<OrderStatus, number> = {
      pending: orders.filter((o) => o.orderStatus === 'pending').length,
      processing: orders.filter((o) => o.orderStatus === 'processing').length,
      packed: orders.filter((o) => o.orderStatus === 'packed').length,
      shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
      delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
      cancelled: orders.filter((o) => o.orderStatus === 'cancelled').length,
      returned: orders.filter((o) => o.orderStatus === 'returned').length,
    };

    return {
      totalRevenue,
      totalRevenueGrowth: 18.4,
      totalOrders: orders.length,
      totalOrdersGrowth: 12.8,
      totalCustomers: customers.length,
      totalCustomersGrowth: 24.5,
      totalProducts: products.length,
      totalProductsGrowth: 8.2,
      pendingOrders: pendingOrdersCount,
      lowStockProducts: lowStockCount,
      recentOrders: orders.slice(0, 5),
      topProducts: products.slice(0, 5),
      lowStockAlerts: products.filter((p) => p.stock <= p.lowStockThreshold).slice(0, 5),
      orderStatusCounts: statusCounts,
    };
  },

  // --- PRODUCTS ---
  async getProducts() {
    return [...products];
  },

  async getProductById(id: string) {
    return products.find((p) => p.id === id) || null;
  },

  async createProduct(data: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>) {
    const newProduct: AdminProduct = {
      ...data,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products = [newProduct, ...products];
    setStorage('admin_products_v4', products);
    return newProduct;
  },

  async updateProduct(id: string, data: Partial<AdminProduct>) {
    products = products.map((p) =>
      p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    );
    setStorage('admin_products_v4', products);
    return products.find((p) => p.id === id) || null;
  },

  async deleteProduct(id: string) {
    products = products.filter((p) => p.id !== id);
    setStorage('admin_products_v4', products);
    return true;
  },

  async duplicateProduct(id: string) {
    const existing = products.find((p) => p.id === id);
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
    products = [copy, ...products];
    setStorage('admin_products_v4', products);
    return copy;
  },

  // --- CATEGORIES ---
  async getCategories() {
    return [...categories];
  },

  async createCategory(data: Omit<AdminCategory, 'id' | 'productCount'>) {
    const newCat: AdminCategory = {
      ...data,
      id: `cat-${Date.now()}`,
      productCount: 0,
    };
    categories = [...categories, newCat];
    setStorage('admin_categories_v4', categories);
    return newCat;
  },

  async updateCategory(id: string, data: Partial<AdminCategory>) {
    categories = categories.map((c) => (c.id === id ? { ...c, ...data } : c));
    setStorage('admin_categories_v4', categories);
    return categories.find((c) => c.id === id) || null;
  },

  async deleteCategory(id: string) {
    categories = categories.filter((c) => c.id !== id);
    setStorage('admin_categories_v4', categories);
    return true;
  },

  // --- BRANDS ---
  async getBrands() {
    return [...brands];
  },

  async createBrand(data: Omit<AdminBrand, 'id' | 'productCount'>) {
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
    brands = brands.map((b) => (b.id === id ? { ...b, ...data } : b));
    setStorage('admin_brands', brands);
    return brands.find((b) => b.id === id) || null;
  },

  async deleteBrand(id: string) {
    brands = brands.filter((b) => b.id !== id);
    setStorage('admin_brands', brands);
    return true;
  },

  // --- INVENTORY ---
  async getInventory() {
    return products.map((p) => ({
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
    const product = products.find((p) => p.id === productId);
    if (!product) return null;

    const previousStock = product.stock;
    const newStock = Math.max(0, previousStock + delta);
    product.stock = newStock;
    product.updatedAt = new Date().toISOString();
    setStorage('admin_products_v4', products);

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
  async getOrders() {
    return [...orders];
  },

  async getOrderById(id: string) {
    return orders.find((o) => o.id === id) || null;
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string) {
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
    const customerOrders = orders.filter((o) => o.customerId === id);
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
  async getCoupons() {
    return [...coupons];
  },

  async createCoupon(data: Omit<AdminCoupon, 'id' | 'usedCount'>) {
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
    coupons = coupons.map((c) => (c.id === id ? { ...c, ...data } : c));
    setStorage('admin_coupons', coupons);
    return coupons.find((c) => c.id === id) || null;
  },

  async deleteCoupon(id: string) {
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
  async getReviews() {
    return [...reviews];
  },

  async updateReviewStatus(id: string, status: AdminReview['status']) {
    reviews = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    setStorage('admin_reviews', reviews);
    return reviews.find((r) => r.id === id) || null;
  },

  async deleteReview(id: string) {
    reviews = reviews.filter((r) => r.id !== id);
    setStorage('admin_reviews', reviews);
    return true;
  },

  // --- PROJECTS ---
  async getProjects() {
    return [...projects];
  },

  async createProject(data: Omit<AdminProject, 'id' | 'createdAt'>) {
    const newProj: AdminProject = {
      ...data,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    projects = [newProj, ...projects];
    setStorage('admin_projects', projects);
    return newProj;
  },

  async updateProject(id: string, data: Partial<AdminProject>) {
    projects = projects.map((p) => (p.id === id ? { ...p, ...data } : p));
    setStorage('admin_projects', projects);
    return projects.find((p) => p.id === id) || null;
  },

  async deleteProject(id: string) {
    projects = projects.filter((p) => p.id !== id);
    setStorage('admin_projects', projects);
    return true;
  },

  // --- TUTORIALS ---
  async getTutorials() {
    return [...tutorials];
  },

  async createTutorial(data: Omit<AdminTutorial, 'id' | 'createdAt'>) {
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
    tutorials = tutorials.map((t) => (t.id === id ? { ...t, ...data } : t));
    setStorage('admin_tutorials', tutorials);
    return tutorials.find((t) => t.id === id) || null;
  },

  async deleteTutorial(id: string) {
    tutorials = tutorials.filter((t) => t.id !== id);
    setStorage('admin_tutorials', tutorials);
    return true;
  },

  // --- HOMEPAGE SECTIONS ---
  async getHomepageSections() {
    return [...homepageSections].sort((a, b) => a.position - b.position);
  },

  async updateHomepageSection(id: string, data: Partial<AdminHomepageSection>) {
    homepageSections = homepageSections.map((s) => (s.id === id ? { ...s, ...data } : s));
    setStorage('admin_homepage_sections', homepageSections);
    return homepageSections.find((s) => s.id === id) || null;
  },

  async reorderHomepageSections(reordered: AdminHomepageSection[]) {
    homepageSections = reordered.map((s, index) => ({ ...s, position: index + 1 }));
    setStorage('admin_homepage_sections', homepageSections);
    return homepageSections;
  },

  // --- SUPPORT TICKETS ---
  async getSupportTickets() {
    return [...supportTickets];
  },

  async updateTicketStatus(id: string, status: AdminSupportTicket['status']) {
    supportTickets = supportTickets.map((t) =>
      t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
    );
    setStorage('admin_support_tickets', supportTickets);
    return supportTickets.find((t) => t.id === id) || null;
  },

  async replyToTicket(id: string, message: string, agentName = 'Support Agent') {
    const ticket = supportTickets.find((t) => t.id === id);
    if (!ticket) return null;

    const newReply = {
      id: `rep-${Date.now()}`,
      sender: agentName,
      role: 'agent' as const,
      message,
      timestamp: new Date().toISOString(),
    };

    ticket.replies = [...(ticket.replies || []), newReply];
    ticket.status = 'in_progress';
    ticket.updatedAt = new Date().toISOString();
    setStorage('admin_support_tickets', supportTickets);
    return ticket;
  },

  // --- ADMIN USERS ---
  async getAdminUsers() {
    return [...adminUsers];
  },

  async createAdminUser(data: Omit<AdminUser, 'id' | 'createdAt'>) {
    const newUser: AdminUser = {
      ...data,
      id: `user-admin-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    adminUsers = [...adminUsers, newUser];
    setStorage('admin_users', adminUsers);
    return newUser;
  },

  async updateAdminUser(id: string, data: Partial<AdminUser>) {
    adminUsers = adminUsers.map((u) => (u.id === id ? { ...u, ...data } : u));
    setStorage('admin_users', adminUsers);
    return adminUsers.find((u) => u.id === id) || null;
  },

  // --- SETTINGS ---
  async getSettings() {
    return { ...settings };
  },

  async updateSettings(newSettings: Partial<AdminSettings>) {
    settings = { ...settings, ...newSettings };
    setStorage('admin_settings', settings);
    return settings;
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    return [...notifications];
  },

  async markNotificationRead(id: string) {
    notifications = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setStorage('admin_notifications', notifications);
    return true;
  },

  async markAllNotificationsRead() {
    notifications = notifications.map((n) => ({ ...n, isRead: true }));
    setStorage('admin_notifications', notifications);
    return true;
  },

  // --- GLOBAL SEARCH ---
  async globalSearch(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) return { products: [], orders: [], customers: [], skus: [] };

    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 5);

    const matchedOrders = orders
      .filter((o) => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
      .slice(0, 5);

    const matchedCustomers = customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
      .slice(0, 5);

    return {
      products: matchedProducts,
      orders: matchedOrders,
      customers: matchedCustomers,
    };
  },

  // --- ANALYTICS DATA GENERATOR ---
  async getAnalytics(period: 'Today' | '7 Days' | '30 Days' | '90 Days' | '1 Year') {
    let days = 30;
    if (period === 'Today') days = 1;
    else if (period === '7 Days') days = 7;
    else if (period === '90 Days') days = 90;
    else if (period === '1 Year') days = 365;

    // Generate trend points
    const points = [];
    const baseRevenue = period === 'Today' ? 2400 : 8500;
    const baseOrders = period === 'Today' ? 3 : 12;

    const steps = period === 'Today' ? 8 : Math.min(days, 14);
    for (let i = 0; i < steps; i++) {
      const multiplier = 0.8 + Math.sin(i * 0.7) * 0.4 + (i / steps) * 0.3;
      points.push({
        label: period === 'Today' ? `${(i * 3).toString().padStart(2, '0')}:00` : `Day ${i + 1}`,
        revenue: Math.round(baseRevenue * multiplier),
        orders: Math.max(1, Math.round(baseOrders * multiplier)),
        aov: Math.round((baseRevenue * multiplier) / Math.max(1, Math.round(baseOrders * multiplier))),
      });
    }

    const categoryDistribution = [
      { name: 'Development Boards', value: 42, color: '#3b82f6' },
      { name: 'Robotics & Kits', value: 28, color: '#10b981' },
      { name: 'Sensors', value: 18, color: '#f59e0b' },
      { name: 'Motors & Drivers', value: 12, color: '#8b5cf6' },
    ];

    return {
      period,
      summary: {
        totalRevenue: points.reduce((acc, p) => acc + p.revenue, 0),
        totalOrders: points.reduce((acc, p) => acc + p.orders, 0),
        averageOrderValue: Math.round(
          points.reduce((acc, p) => acc + p.revenue, 0) /
            Math.max(1, points.reduce((acc, p) => acc + p.orders, 0))
        ),
        conversionRate: 3.42,
        refundRate: 0.8,
        customerGrowthRate: 14.2,
      },
      timeSeries: points,
      categoryDistribution,
    };
  },
};

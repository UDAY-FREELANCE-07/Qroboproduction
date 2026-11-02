export type AdminRole = 
  | 'Super Admin'
  | 'Product Manager'
  | 'Inventory Manager'
  | 'Order Manager'
  | 'Content Manager'
  | 'Support Agent';

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'publish' | 'manage';

export type PermissionModule =
  | 'products'
  | 'categories'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'payments'
  | 'marketing'
  | 'content'
  | 'analytics'
  | 'users'
  | 'settings';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: string;
  subcategory?: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage?: number;
  taxRate: number; // e.g. 18% GST
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  warehouse: string;
  primaryImage: string;
  galleryImages: string[];
  videoUrl?: string;
  status: 'published' | 'draft' | 'archived';
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  specifications: Record<string, string>;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  updatedAt: string;
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string | null;
  parentName?: string;
  image?: string;
  iconName?: string;
  productCount: number;
  sortOrder: number;
  isFeatured: boolean;
  status: 'active' | 'inactive';
}

export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  website?: string;
  productCount: number;
  status: 'active' | 'inactive';
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

export type OrderStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'partially_refunded';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  couponCode?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'UPI' | 'Razorpay' | 'Credit Card' | 'Cash on Delivery' | 'Net Banking';
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  timeline: {
    status: OrderStatus;
    label: string;
    timestamp: string;
    note?: string;
    done: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  status: 'active' | 'suspended';
  addresses: {
    id: string;
    type: 'shipping' | 'billing';
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }[];
  createdAt: string;
}

export interface AdminPayment {
  id: string;
  transactionId: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  provider: 'Razorpay' | 'Stripe' | 'UPI' | 'Cash on Delivery';
  paymentMethod: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  perCustomerLimit: number;
  applicableCategory?: string;
  status: 'active' | 'inactive' | 'expired';
}

export interface AdminPromotion {
  id: string;
  name: string;
  bannerImage: string;
  description: string;
  startDate: string;
  endDate: string;
  discountText: string;
  ctaText: string;
  ctaDestination: string;
  position: 'hero' | 'top_strip' | 'middle_banner' | 'sidebar';
  status: 'active' | 'scheduled' | 'inactive';
}

export interface AdminReview {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  status: 'approved' | 'pending' | 'rejected' | 'hidden';
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface AdminProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  estimatedCost: number;
  estimatedTime: string; // e.g. "3 Hours"
  requiredComponents: {
    productId?: string;
    name: string;
    quantity: number;
    optional?: boolean;
  }[];
  instructions: string;
  codeSnippet?: string;
  status: 'published' | 'draft';
  createdAt: string;
}

export interface AdminTutorial {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  thumbnail: string;
  readTime: string;
  videoUrl?: string;
  content: string;
  author: string;
  status: 'published' | 'draft';
  createdAt: string;
}

export interface AdminHomepageSection {
  id: string;
  name: string;
  type:
    | 'hero_carousel'
    | 'daily_deals'
    | 'offer_banners'
    | 'featured_products'
    | 'shop_by_category'
    | 'flash_sale'
    | 'trending_products'
    | 'recommended_products'
    | 'learning_section'
    | 'benefits_section'
    | 'newsletter';
  title: string;
  subtitle?: string;
  isEnabled: boolean;
  position: number;
  ctaText?: string;
  ctaUrl?: string;
  itemCount?: number;
}

export interface AdminSupportTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  replies?: {
    id: string;
    sender: string;
    role: 'customer' | 'agent';
    message: string;
    timestamp: string;
  }[];
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'inventory' | 'payment' | 'support' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  previousStock: number;
  adjustedQuantity: number;
  newStock: number;
  type: 'restock' | 'adjustment' | 'damaged' | 'return' | 'audit';
  reason: string;
  adjustedBy: string;
  timestamp: string;
}

export interface AdminSettings {
  general: {
    storeName: string;
    storeEmail: string;
    phone: string;
    currency: string;
    currencySymbol: string;
    timezone: string;
    language: string;
  };
  store: {
    legalBusinessName: string;
    gstNumber: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shipping: {
    freeShippingThreshold: number;
    flatRateDelivery: number;
    enableExpressDelivery: boolean;
    expressDeliveryFee: number;
    warehouseAddress: string;
  };
  payments: {
    enableRazorpay: boolean;
    enableUPI: boolean;
    enableCOD: boolean;
    testMode: boolean;
    minOrderCOD: number;
    maxOrderCOD: number;
  };
  notifications: {
    emailOrderConfirmation: boolean;
    emailLowStockAlerts: boolean;
    lowStockAlertThreshold: number;
    smsNotifications: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    socialPreviewImage: string;
    indexingEnabled: boolean;
  };
  security: {
    requireTwoFactor: boolean;
    sessionTimeoutMinutes: number;
    adminPasswordExpirationDays: number;
  };
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Boxes,
  Eye,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Truck,
  FolderTree,
  Tag,
  LifeBuoy,
  Star,
  BookOpen,
  Wrench,
  ShieldCheck,
  CreditCard,
  Check,
  X,
  Sparkles,
  Ticket,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { KpiCard } from '@/components/admin/KpiCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { StockAdjustmentModal } from '@/components/admin/StockAdjustmentModal';
import { adminService } from '@/lib/admin/admin-service';
import { getStoredAdminUser } from '@/lib/admin/admin-auth';
import {
  AdminRole,
  AdminUser,
  AdminOrder,
  AdminProduct,
  AdminCategory,
  AdminSupportTicket,
  AdminReview,
  AdminProject,
  AdminTutorial,
  OrderStatus,
} from '@/lib/admin/admin-types';
import { formatPrice, formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeRole, setActiveRole] = useState<AdminRole>('Super Admin');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<
    'Today' | '7 Days' | '30 Days' | '90 Days' | '1 Year'
  >('30 Days');

  // Loaded operational datasets
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [tutorials, setTutorials] = useState<AdminTutorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stock adjust modal state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    const user = getStoredAdminUser();
    setCurrentUser(user);
    if (user?.role && user.role !== 'Super Admin') {
      setActiveRole(user.role);
    }

    const [m, a, ordList, prodList, catList, tktList, revList, prjList, tutList] =
      await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getAnalytics(analyticsPeriod),
        adminService.getOrders(),
        adminService.getProducts(),
        adminService.getCategories(),
        adminService.getSupportTickets(),
        adminService.getReviews(),
        adminService.getProjects(),
        adminService.getTutorials(),
      ]);

    setMetrics(m);
    setChartData(a.timeSeries);
    setOrders(ordList);
    setProducts(prodList);
    setCategories(catList);
    setTickets(tktList);
    setReviews(revList);
    setProjects(prjList);
    setTutorials(tutList);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [analyticsPeriod]);

  const handleStockAdjustConfirm = async (
    productId: string,
    delta: number,
    type: any,
    reason: string
  ) => {
    await adminService.adjustStock(productId, delta, type, reason);
    toast.success('Stock adjusted successfully');
    loadData();
  };

  const handleQuickStatusUpdate = async (id: string, status: OrderStatus) => {
    await adminService.updateOrderStatus(id, status);
    toast.success(`Order status updated to ${status}`);
    const ordList = await adminService.getOrders();
    setOrders(ordList);
  };

  const handleTicketStatus = async (ticketId: string, status: any) => {
    await adminService.updateTicketStatus(ticketId, status);
    toast.success(`Ticket marked as ${status}`);
    const tktList = await adminService.getSupportTickets();
    setTickets(tktList);
  };

  const handleReviewStatus = async (reviewId: string, status: any) => {
    await adminService.updateReviewStatus(reviewId, status);
    toast.success(`Review ${status}`);
    const revList = await adminService.getReviews();
    setReviews(revList);
  };

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const isSuperAdmin = !currentUser || currentUser.role === 'Super Admin';
  const roleList: AdminRole[] = [
    'Super Admin',
    'Order Manager',
    'Product Manager',
    'Inventory Manager',
    'Support Agent',
    'Content Manager',
  ];

  return (
    <div className="space-y-6">
      {/* Role Switcher Toolbar for Super Admin / Store Owner */}
      {isSuperAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Role Dashboard Preview:</span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              (Inspect specialized views designed for each team role)
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roleList.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  activeRole === role
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RENDER SPECIFIC ROLE DASHBOARD VIEW */}
      {activeRole === 'Order Manager' && (
        <OrderManagerView
          orders={orders}
          metrics={metrics}
          onQuickUpdate={handleQuickStatusUpdate}
          onRefresh={loadData}
        />
      )}

      {activeRole === 'Product Manager' && (
        <ProductManagerView
          products={products}
          categories={categories}
          metrics={metrics}
          onRefresh={loadData}
        />
      )}

      {activeRole === 'Inventory Manager' && (
        <InventoryManagerView
          products={products}
          metrics={metrics}
          onOpenAdjust={(p) => {
            setSelectedProductForAdjust(p);
            setAdjustModalOpen(true);
          }}
          onRefresh={loadData}
        />
      )}

      {activeRole === 'Support Agent' && (
        <SupportAgentView
          tickets={tickets}
          reviews={reviews}
          onTicketStatus={handleTicketStatus}
          onReviewStatus={handleReviewStatus}
          onRefresh={loadData}
        />
      )}

      {activeRole === 'Content Manager' && (
        <ContentManagerView
          projects={projects}
          tutorials={tutorials}
          onRefresh={loadData}
        />
      )}

      {activeRole === 'Super Admin' && (
        <SuperAdminView
          metrics={metrics}
          chartData={chartData}
          analyticsPeriod={analyticsPeriod}
          setAnalyticsPeriod={setAnalyticsPeriod}
          loadData={loadData}
          onOpenAdjust={(p) => {
            setSelectedProductForAdjust(p);
            setAdjustModalOpen(true);
          }}
        />
      )}

      {/* Reusable Stock Adjustment Modal */}
      <StockAdjustmentModal
        open={adjustModalOpen}
        onOpenChange={setAdjustModalOpen}
        product={selectedProductForAdjust}
        onConfirm={handleStockAdjustConfirm}
      />
    </div>
  );
}

/* =========================================================================
   1. ORDER MANAGER DASHBOARD VIEW
   ========================================================================= */
function OrderManagerView({
  orders,
  metrics,
  onQuickUpdate,
  onRefresh,
}: {
  orders: AdminOrder[];
  metrics: any;
  onQuickUpdate: (id: string, status: OrderStatus) => Promise<void>;
  onRefresh: () => void;
}) {
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending');
  const processingOrders = orders.filter((o) => o.orderStatus === 'processing');
  const packedOrders = orders.filter((o) => o.orderStatus === 'packed');
  const shippedOrders = orders.filter((o) => o.orderStatus === 'shipped');
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
              Order Manager Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Order Fulfillment & Dispatch Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Process incoming orders, assign logistics carriers (BlueDart, Delhivery), and track deliveries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-9 gap-1.5 text-xs text-slate-600">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Link href="/admin/orders">
            <Button size="sm" className="h-9 gap-1.5 text-xs">
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>All Orders ({orders.length})</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Focused Order Pipeline KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-800">Pending Confirmation</p>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-950 mt-2">{pendingOrders.length}</p>
          <p className="text-[11px] text-amber-700 mt-1">Requires seller approval</p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-blue-800">Processing & Packing</p>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-950 mt-2">{processingOrders.length + packedOrders.length}</p>
          <p className="text-[11px] text-blue-700 mt-1">Ready for warehouse dispatch</p>
        </div>

        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-purple-800">Out for Delivery</p>
            <Truck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-950 mt-2">{shippedOrders.length}</p>
          <p className="text-[11px] text-purple-700 mt-1">With courier partners</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-800">Delivered Successfully</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-950 mt-2">{deliveredOrders.length}</p>
          <p className="text-[11px] text-emerald-700 mt-1">Completed shipments</p>
        </div>
      </div>

      {/* Live Order Fulfillment Pipeline Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Orders Queue</h3>
            <p className="text-xs text-slate-500">Advance order status with 1-click or assign tracking</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline">
            View Complete Order Table &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Fulfillment Status</th>
                <th className="py-2.5 px-3 text-center">Quick Action</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 8).map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-primary">
                    <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-900">{o.customerName}</p>
                    <p className="text-[11px] text-slate-400">{o.customerEmail}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {o.items.length} item{o.items.length === 1 ? '' : 's'}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">{formatPrice(o.grandTotal)}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={o.paymentStatus} size="sm" />
                    <span className="block text-[10px] text-slate-400 mt-0.5">{o.paymentMethod}</span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={o.orderStatus} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-center">
                    {o.orderStatus === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onQuickUpdate(o.id, 'processing')}
                        className="h-7 text-[11px] font-semibold text-blue-700 border-blue-200 hover:bg-blue-50"
                      >
                        Confirm & Process
                      </Button>
                    )}
                    {o.orderStatus === 'processing' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onQuickUpdate(o.id, 'packed')}
                        className="h-7 text-[11px] font-semibold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                      >
                        Mark Packed
                      </Button>
                    )}
                    {o.orderStatus === 'packed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onQuickUpdate(o.id, 'shipped')}
                        className="h-7 text-[11px] font-semibold text-purple-700 border-purple-200 hover:bg-purple-50"
                      >
                        Dispatch / Ship
                      </Button>
                    )}
                    {o.orderStatus === 'shipped' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onQuickUpdate(o.id, 'delivered')}
                        className="h-7 text-[11px] font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      >
                        Confirm Delivery
                      </Button>
                    )}
                    {['delivered', 'cancelled', 'returned'].includes(o.orderStatus) && (
                      <span className="text-[11px] text-slate-400 italic">Fulfilled</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Nav shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/payments"
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-primary hover:shadow-sm transition-all flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900">Payments & COD Console</h4>
            <p className="text-xs text-slate-500 mt-0.5">Track prepaid and cash-on-delivery reconciliations</p>
          </div>
          <CreditCard className="w-5 h-5 text-slate-400" />
        </Link>
        <Link
          href="/admin/customers"
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-primary hover:shadow-sm transition-all flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900">Customer Directory</h4>
            <p className="text-xs text-slate-500 mt-0.5">Customer shipping addresses and purchase records</p>
          </div>
          <Users className="w-5 h-5 text-slate-400" />
        </Link>
        <Link
          href="/admin/inventory"
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-primary hover:shadow-sm transition-all flex items-center justify-between"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900">Warehouse Stock Check</h4>
            <p className="text-xs text-slate-500 mt-0.5">Verify stock reserves before packing shipments</p>
          </div>
          <Boxes className="w-5 h-5 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}

/* =========================================================================
   2. PRODUCT MANAGER DASHBOARD VIEW
   ========================================================================= */
function ProductManagerView({
  products,
  categories,
  metrics,
  onRefresh,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
  metrics: any;
  onRefresh: () => void;
}) {
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;
  const inStockCount = products.filter((p) => p.stock > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-[11px] font-bold uppercase tracking-wider">
              Product Manager Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Catalog & Inventory Taxonomy Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage 897 electronics items, brand relationships, category trees, and pricing structures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-9 gap-1.5 text-xs text-slate-600">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Link href="/admin/products/new">
            <Button size="sm" className="h-9 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Focused Product KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-600">Catalog Size</p>
            <Package className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{products.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Total active SKUs in database</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-600">Active Categories</p>
            <FolderTree className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{categories.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Taxonomy groups published</p>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-rose-800">Out of Stock</p>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-950 mt-2">{outOfStockCount}</p>
          <p className="text-[11px] text-rose-700 mt-1">Requires restock inventory</p>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-indigo-800">In Stock SKUs</p>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-950 mt-2">{inStockCount}</p>
          <p className="text-[11px] text-indigo-700 mt-1">Available for live purchase</p>
        </div>
      </div>

      {/* Categories & Products Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Featured Catalog Components</h3>
              <p className="text-xs text-slate-500">Quickly adjust prices, edit specifications, or check photos</p>
            </div>
            <Link href="/admin/products" className="text-xs font-semibold text-primary hover:underline">
              View All 897 &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.slice(0, 6).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        {p.primaryImage && (
                          <img src={p.primaryImage} alt="" className="w-7 h-7 object-contain rounded border bg-white p-0.5" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{formatPrice(p.price)}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={p.stock <= 0 ? 'out_of_stock' : 'in_stock'} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link href={`/admin/products/${p.id}`} className="font-semibold text-primary hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">Top Categories</h3>
            <Link href="/admin/categories" className="text-xs font-semibold text-primary hover:underline">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {categories.slice(0, 7).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50">
                <span className="font-medium text-slate-800 line-clamp-1">{c.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-semibold text-[11px]">
                  {c.productCount || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. INVENTORY MANAGER DASHBOARD VIEW
   ========================================================================= */
function InventoryManagerView({
  products,
  metrics,
  onOpenAdjust,
  onRefresh,
}: {
  products: AdminProduct[];
  metrics: any;
  onOpenAdjust: (product: AdminProduct) => void;
  onRefresh: () => void;
}) {
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
              Inventory Manager Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Warehouse Stock & Replenishment Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time stock on hand, bin storage locations, adjustments, and re-order thresholds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-9 gap-1.5 text-xs text-slate-600">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Link href="/admin/inventory">
            <Button size="sm" className="h-9 gap-1.5 text-xs">
              <Boxes className="h-3.5 w-3.5" />
              <span>Full Inventory Table</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Focused Inventory KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-600">Total Tracked SKUs</p>
            <Boxes className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{products.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active electronic parts</p>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-rose-800">Critical Out-of-Stock</p>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-950 mt-2">{outOfStockProducts.length}</p>
          <p className="text-[11px] text-rose-700 mt-1">Immediate restock required</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-800">Low Stock Threshold</p>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-950 mt-2">10 Units</p>
          <p className="text-[11px] text-amber-700 mt-1">Standard safety stock level</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-800">Warehouse Hubs</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-950 mt-2">Hyderabad & Warangal</p>
          <p className="text-[11px] text-emerald-700 mt-1">Operational distribution centers</p>
        </div>
      </div>

      {/* Quick Stock Adjustment & Restock Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Depleted Components (Requires Inbound Stock)</h3>
            <p className="text-xs text-slate-500">Click &quot;Adjust Stock&quot; to log inbound purchase batches</p>
          </div>
          <Link href="/admin/inventory" className="text-xs font-semibold text-primary hover:underline">
            Manage Full Inventory &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Component</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">Stock On-Hand</th>
                <th className="py-2.5 px-3 text-right">Inbound Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {outOfStockProducts.slice(0, 10).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{p.sku}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{formatPrice(p.price)}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                      0 Units (Out of Stock)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenAdjust(p)}
                      className="h-7 text-[11px] font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                    >
                      + Adjust Stock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. SUPPORT AGENT DASHBOARD VIEW
   ========================================================================= */
function SupportAgentView({
  tickets,
  reviews,
  onTicketStatus,
  onReviewStatus,
  onRefresh,
}: {
  tickets: AdminSupportTicket[];
  reviews: AdminReview[];
  onTicketStatus: (id: string, status: any) => Promise<void>;
  onReviewStatus: (id: string, status: any) => Promise<void>;
  onRefresh: () => void;
}) {
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold uppercase tracking-wider">
              Support Agent Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Customer Helpdesk & Review Moderation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Resolve customer technical inquiries, track tickets, and moderate hardware reviews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-9 gap-1.5 text-xs text-slate-600">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Link href="/admin/support">
            <Button size="sm" className="h-9 gap-1.5 text-xs">
              <LifeBuoy className="h-3.5 w-3.5" />
              <span>Support Desk</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Focused Support KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-rose-800">Active Open Tickets</p>
            <LifeBuoy className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-950 mt-2">{openTickets.length}</p>
          <p className="text-[11px] text-rose-700 mt-1">Awaiting resolution</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-800">Resolved Inquiries</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-950 mt-2">{resolvedTickets.length}</p>
          <p className="text-[11px] text-emerald-700 mt-1">Customer issues closed</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-800">Customer Reviews</p>
            <Star className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-950 mt-2">{reviews.length}</p>
          <p className="text-[11px] text-amber-700 mt-1">Feedback items logged</p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-blue-800">Avg First Response</p>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-950 mt-2">&lt; 15 Mins</p>
          <p className="text-[11px] text-blue-700 mt-1">Target resolution rate</p>
        </div>
      </div>

      {/* Support Tickets Queue */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Recent Customer Tickets</h3>
          <Link href="/admin/support" className="text-xs font-semibold text-primary hover:underline">
            All Tickets &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Ticket #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.slice(0, 6).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-primary">{t.ticketNumber}</td>
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-slate-900">{t.customerName}</p>
                    <p className="text-[10px] text-slate-400">{t.customerEmail}</p>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">{t.subject}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                        t.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : t.priority === 'high'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={t.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {t.status !== 'resolved' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTicketStatus(t.id, 'resolved')}
                        className="h-7 text-[11px] font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      >
                        Resolve
                      </Button>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   5. CONTENT MANAGER DASHBOARD VIEW
   ========================================================================= */
function ContentManagerView({
  projects,
  tutorials,
  onRefresh,
}: {
  projects: AdminProject[];
  tutorials: AdminTutorial[];
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[11px] font-bold uppercase tracking-wider">
              Content Manager Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Maker Projects, Tutorials & Knowledge Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Publish STEM educational projects, hardware documentation, and homepage banners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} className="h-9 gap-1.5 text-xs text-slate-600">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Link href="/admin/projects">
            <Button size="sm" className="h-9 gap-1.5 text-xs">
              <Wrench className="h-3.5 w-3.5" />
              <span>Projects Console</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Focused Content KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-violet-800">Robotics Projects</p>
            <Wrench className="w-4 h-4 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-violet-950 mt-2">{projects.length}</p>
          <p className="text-[11px] text-violet-700 mt-1">DIY Kits & Schematics</p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-blue-800">Maker Tutorials</p>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-950 mt-2">{tutorials.length}</p>
          <p className="text-[11px] text-blue-700 mt-1">Guides & Code walkthroughs</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-emerald-800">Published Status</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-950 mt-2">100% Live</p>
          <p className="text-[11px] text-emerald-700 mt-1">Community accessible</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-600">Homepage Banners</p>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">5 Active</p>
          <p className="text-[11px] text-slate-500 mt-1">Storefront hero sliders</p>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Active DIY Robotics & STEM Kits</h3>
          <Link href="/admin/projects" className="text-xs font-semibold text-primary hover:underline">
            Manage Projects &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Project Title</th>
                <th className="py-2.5 px-3">Difficulty</th>
                <th className="py-2.5 px-3">Est. Time</th>
                <th className="py-2.5 px-3">Estimated Cost</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.slice(0, 6).map((prj) => (
                <tr key={prj.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{prj.title}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">
                      {prj.difficulty}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{prj.estimatedTime}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{formatPrice(prj.estimatedCost)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Link href="/admin/projects" className="font-semibold text-primary hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   6. SUPER ADMIN MASTER EXECUTIVE VIEW
   ========================================================================= */
function SuperAdminView({
  metrics,
  chartData,
  analyticsPeriod,
  setAnalyticsPeriod,
  loadData,
  onOpenAdjust,
}: {
  metrics: any;
  chartData: any[];
  analyticsPeriod: any;
  setAnalyticsPeriod: any;
  loadData: () => void;
  onOpenAdjust: (p: any) => void;
}) {
  const orderStatuses = [
    { key: 'pending', label: 'Pending', count: metrics.orderStatusCounts.pending, color: 'bg-amber-500' },
    { key: 'processing', label: 'Processing', count: metrics.orderStatusCounts.processing, color: 'bg-blue-500' },
    { key: 'packed', label: 'Packed', count: metrics.orderStatusCounts.packed, color: 'bg-indigo-500' },
    { key: 'shipped', label: 'Shipped', count: metrics.orderStatusCounts.shipped, color: 'bg-purple-500' },
    { key: 'delivered', label: 'Delivered', count: metrics.orderStatusCounts.delivered, color: 'bg-emerald-500' },
    { key: 'cancelled', label: 'Cancelled', count: metrics.orderStatusCounts.cancelled, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
              Super Admin Executive Console
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Operations Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time performance indicators and inventory tracking across all fulfillment hubs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="h-9 gap-1.5 text-xs text-slate-600">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Link href="/admin/products/new">
            <Button size="sm" className="h-9 gap-1.5 text-xs">
              <Package className="h-3.5 w-3.5" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          label="Total Revenue"
          value={formatPrice(metrics.totalRevenue)}
          change={metrics.totalRevenueGrowth}
          icon={DollarSign}
          iconColor="bg-emerald-600"
          href="/admin/analytics"
        />
        <KpiCard
          label="Total Orders"
          value={metrics.totalOrders}
          change={metrics.totalOrdersGrowth}
          icon={ShoppingCart}
          iconColor="bg-blue-600"
          href="/admin/orders"
        />
        <KpiCard
          label="Customers"
          value={metrics.totalCustomers}
          change={metrics.totalCustomersGrowth}
          icon={Users}
          iconColor="bg-violet-600"
          href="/admin/customers"
        />
        <KpiCard
          label="Catalog Products"
          value={metrics.totalProducts}
          change={metrics.totalProductsGrowth}
          icon={Package}
          iconColor="bg-cyan-600"
          href="/admin/products"
        />
        <KpiCard
          label="Pending Orders"
          value={metrics.pendingOrders}
          icon={Clock}
          iconColor="bg-amber-500"
          href="/admin/orders?status=pending"
        />
        <KpiCard
          label="Low Stock Items"
          value={metrics.lowStockProducts}
          icon={AlertTriangle}
          iconColor="bg-rose-500"
          href="/admin/inventory"
        />
      </div>

      {/* Order Status Pipeline Grid */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Order Fulfillment Pipeline</h3>
          <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline">
            Manage Orders &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {orderStatuses.map((s) => (
            <Link
              key={s.key}
              href={`/admin/orders?status=${s.key}`}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                <span className="text-xs font-semibold text-slate-600">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-2">{s.count}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Revenue & Growth Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue Performance</h3>
            <p className="text-xs text-slate-500">Gross sales and order volume over time</p>
          </div>
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            {(['Today', '7 Days', '30 Days', '90 Days', '1 Year'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setAnalyticsPeriod(period)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  analyticsPeriod === period
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip
                formatter={(value: any) => [formatPrice(Number(value)), 'Revenue']}
                labelStyle={{ fontWeight: 'bold' }}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2.5} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

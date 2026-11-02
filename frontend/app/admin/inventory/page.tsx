'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  Filter,
  PlusCircle,
  History,
  AlertTriangle,
  RefreshCw,
  Package,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { StockAdjustmentModal } from '@/components/admin/StockAdjustmentModal';
import { adminService } from '@/lib/admin/admin-service';
import { formatDateTime } from '@/lib/format';
import { InventoryAdjustment } from '@/lib/admin/admin-types';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [inv, adj] = await Promise.all([
      adminService.getInventory(),
      adminService.getAdjustments(),
    ]);
    setInventory(inv);
    setAdjustments(adj);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjustConfirm = async (
    productId: string,
    delta: number,
    type: any,
    reason: string
  ) => {
    await adminService.adjustStock(productId, delta, type, reason);
    loadData();
  };

  const openAdjust = (item: any) => {
    setSelectedProduct({
      id: item.id,
      name: item.name,
      sku: item.sku,
      stock: item.totalStock,
    });
    setModalOpen(true);
  };

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesWarehouse = warehouseFilter === 'ALL' || item.warehouse === warehouseFilter;
    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  const warehouses = Array.from(new Set(inventory.map((i) => i.warehouse)));
  const lowStockCount = inventory.filter((i) => i.status === 'low_stock').length;
  const outOfStockCount = inventory.filter((i) => i.status === 'out_of_stock').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory & Stock Control</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time warehouse inventory, reserved allocation, replenishment thresholds, and audit trails.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="h-9 gap-1.5 text-xs text-slate-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync</span>
          </Button>
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Table
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Trail ({adjustments.length})
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Pill Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Tracked SKUs</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{inventory.length}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Boxes className="h-5 w-5" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">{lowStockCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Out of Stock</p>
            <p className="text-2xl font-bold text-rose-600 mt-0.5">{outOfStockCount}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Filters Bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by product name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 text-xs h-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Stock Levels</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock (Threshold Warning)</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Warehouses</SelectItem>
                  {warehouses.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Hardware Item</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3">Warehouse Hub</th>
                    <th className="py-3 px-3">Available</th>
                    <th className="py-3 px-3">Reserved</th>
                    <th className="py-3 px-3">Total Stock</th>
                    <th className="py-3 px-3">Min Threshold</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{item.sku}</td>
                      <td className="py-3 px-3 text-slate-600">{item.warehouse}</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">
                        {item.availableStock}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{item.reservedStock}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{item.totalStock}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {item.lowStockThreshold}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAdjust(item)}
                          className="h-8 gap-1 text-xs"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>Adjust</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Audit Trail Table */
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Inventory Transaction Audit Log
            </h3>
            <span className="text-xs text-slate-400">Recorded adjustments across all sessions</span>
          </div>
          {adjustments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No inventory adjustments have been recorded yet. Click "Adjust" on any hardware item above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Delta</th>
                    <th className="py-3 px-3">Previous &rarr; New</th>
                    <th className="py-3 px-3">Reason</th>
                    <th className="py-3 px-4">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adjustments.map((adj) => {
                    const isPositive = adj.adjustedQuantity >= 0;
                    return (
                      <tr key={adj.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {formatDateTime(adj.timestamp)}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{adj.productName}</td>
                        <td className="py-3 px-3 font-mono text-slate-500">{adj.sku}</td>
                        <td className="py-3 px-3 uppercase text-[10px] font-bold tracking-wider text-slate-600">
                          {adj.type}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-0.5 font-bold ${
                              isPositive ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDownRight className="h-3.5 w-3.5" />
                            )}
                            {isPositive ? `+${adj.adjustedQuantity}` : adj.adjustedQuantity}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {adj.previousStock} &rarr;{' '}
                          <span className="font-bold text-slate-900">{adj.newStock}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 italic">{adj.reason}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{adj.adjustedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={selectedProduct}
        onConfirm={handleAdjustConfirm}
      />
    </div>
  );
}

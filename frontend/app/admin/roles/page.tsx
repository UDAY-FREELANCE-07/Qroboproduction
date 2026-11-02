'use client';

import React, { useState } from 'react';
import { ShieldCheck, Shield, Check, Info, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { rolePermissions } from '@/lib/admin/admin-mock-data';
import {
  AdminRole,
  PermissionModule,
  PermissionAction,
} from '@/lib/admin/admin-types';

const allRoles: AdminRole[] = [
  'Super Admin',
  'Product Manager',
  'Inventory Manager',
  'Order Manager',
  'Content Manager',
  'Support Agent',
];

const allModules: { key: PermissionModule; label: string; desc: string }[] = [
  { key: 'products', label: 'Products & Hardware', desc: 'Manage hardware catalog, pricing, SKUs, and specifications' },
  { key: 'categories', label: 'Category Hierarchy', desc: 'Create, edit, and restructure department taxonomies' },
  { key: 'inventory', label: 'Inventory & Warehousing', desc: 'Stock level counts, threshold monitoring, adjustments' },
  { key: 'orders', label: 'Order Processing', desc: 'Order fulfillment, packing, tracking barcodes, dispatches' },
  { key: 'customers', label: 'Customer Management', desc: 'Profiles, address books, purchase history, account suspensions' },
  { key: 'payments', label: 'Payment Gateway', desc: 'Transaction ledgers, gateway confirmations, refund approvals' },
  { key: 'marketing', label: 'Marketing & Coupons', desc: 'Promotional codes, campaign banners, discount rules' },
  { key: 'content', label: 'Projects & Tutorials', desc: 'DIY STEM blueprints, articles, educational code tutorials' },
  { key: 'analytics', label: 'Business Analytics', desc: 'Store revenue, order velocity, margin and conversion reports' },
  { key: 'users', label: 'Staff Accounts', desc: 'Internal personnel access, role assignments' },
  { key: 'settings', label: 'System Settings', desc: 'Store parameters, shipping logic, tax settings, security' },
];

const allActions: { key: PermissionAction; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'publish', label: 'Publish' },
  { key: 'manage', label: 'Manage' },
];

export default function AdminRolesPage() {
  const [selectedRole, setSelectedRole] = useState<AdminRole>('Product Manager');
  const [permissionsMatrix, setPermissionsMatrix] = useState<
    Record<AdminRole, Record<PermissionModule, PermissionAction[]>>
  >(JSON.parse(JSON.stringify(rolePermissions)));
  const [isSaved, setIsSaved] = useState(false);

  const isSuperAdmin = selectedRole === 'Super Admin';

  const togglePermission = (mod: PermissionModule, act: PermissionAction) => {
    if (isSuperAdmin) return; // Super admin has unconstrained permissions

    setPermissionsMatrix((prev) => {
      const roleCopy = { ...prev[selectedRole] };
      const currentActions = roleCopy[mod] || [];
      const hasAction = currentActions.includes(act);

      const nextActions = hasAction
        ? currentActions.filter((a) => a !== act)
        : [...currentActions, act];

      return {
        ...prev,
        [selectedRole]: {
          ...roleCopy,
          [mod]: nextActions,
        },
      };
    });
    setIsSaved(false);
  };

  const handleSaveMatrix = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDefaults = () => {
    setPermissionsMatrix(JSON.parse(JSON.stringify(rolePermissions)));
    setIsSaved(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Roles & Permissions Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enforce role-based access control (RBAC) across catalog, orders, payments, and system controls.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="h-9 gap-1.5 text-xs text-slate-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset to Defaults</span>
          </Button>
          <Button size="sm" onClick={handleSaveMatrix} className="h-9 gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" />
            <span>{isSaved ? 'Saved!' : 'Save Matrix'}</span>
          </Button>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {allRoles.map((r) => {
          const active = selectedRole === r;
          return (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Shield className={`h-3.5 w-3.5 ${active ? 'text-primary' : 'text-slate-400'}`} />
              <span>{r}</span>
            </button>
          );
        })}
      </div>

      {isSuperAdmin && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Super Admin Privilege</p>
            <p className="mt-0.5 text-blue-700">
              The Super Admin role holds permanent system-wide master clearance across all operational modules and actions.
            </p>
          </div>
        </div>
      )}

      {/* Permissions Matrix Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Configuring Clearance for: <span className="text-primary">{selectedRole}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Check action permissions to grant or revoke operational privileges.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Protected Module</th>
                {allActions.map((a) => (
                  <th key={a.key} className="py-3 px-3 text-center w-24">
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allModules.map((m) => {
                const assigned = permissionsMatrix[selectedRole]?.[m.key] || [];
                return (
                  <tr key={m.key} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{m.label}</p>
                      <p className="text-[11px] text-slate-400">{m.desc}</p>
                    </td>
                    {allActions.map((a) => {
                      const checked = isSuperAdmin || assigned.includes(a.key);
                      return (
                        <td key={a.key} className="py-3 px-3 text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={checked}
                              disabled={isSuperAdmin}
                              onCheckedChange={() => togglePermission(m.key, a.key)}
                              aria-label={`${m.label} ${a.label}`}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

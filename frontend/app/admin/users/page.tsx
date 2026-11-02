'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { adminService } from '@/lib/admin/admin-service';
import { AdminUser, AdminRole } from '@/lib/admin/admin-types';
import { formatDateTime } from '@/lib/format';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('Product Manager');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const fetchUsers = async () => {
    setIsLoading(true);
    const data = await adminService.getAdminUsers();
    setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('Product Manager');
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (u: AdminUser) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setStatus(u.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      await adminService.updateAdminUser(editingUser.id, {
        name,
        email,
        role,
        status,
      });
    } else {
      await adminService.createAdminUser({
        name,
        email,
        role,
        status,
        lastLogin: new Date().toISOString(),
      });
    }
    setModalOpen(false);
    fetchUsers();
  };

  const toggleStatus = async (u: AdminUser) => {
    const next = u.status === 'active' ? 'inactive' : 'active';
    await adminService.updateAdminUser(u.id, { status: next });
    fetchUsers();
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff & Team Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authorize administrative staff, allocate departmental responsibilities, and oversee access.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="h-9 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>Invite Staff Member</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search staff name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="Super Admin">Super Admin</SelectItem>
              <SelectItem value="Product Manager">Product Manager</SelectItem>
              <SelectItem value="Inventory Manager">Inventory Manager</SelectItem>
              <SelectItem value="Order Manager">Order Manager</SelectItem>
              <SelectItem value="Content Manager">Content Manager</SelectItem>
              <SelectItem value="Support Agent">Support Agent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Designated Role</th>
                <th className="py-3 px-3">Last Active Session</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-sm">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-primary">
                      <Shield className="h-3 w-3" />
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {u.lastLogin ? formatDateTime(u.lastLogin) : 'Never'}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={u.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(u)}
                        className="h-8 text-xs text-slate-600"
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(u)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-slate-900">
                {editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="u-name">Full Name *</Label>
                <Input
                  id="u-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikramaditya Roy"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="u-email">Work Email Address *</Label>
                <Input
                  id="u-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@qrobo.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Assigned Role</Label>
                <Select value={role} onValueChange={(val) => setRole(val as AdminRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin (Unrestricted)</SelectItem>
                    <SelectItem value="Product Manager">Product Manager</SelectItem>
                    <SelectItem value="Inventory Manager">Inventory Manager</SelectItem>
                    <SelectItem value="Order Manager">Order Manager</SelectItem>
                    <SelectItem value="Content Manager">Content Manager</SelectItem>
                    <SelectItem value="Support Agent">Support Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Account Status</Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as 'active' | 'inactive')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active (Permitted)</SelectItem>
                    <SelectItem value="inactive">Inactive / Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingUser ? 'Save Changes' : 'Create Staff Member'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

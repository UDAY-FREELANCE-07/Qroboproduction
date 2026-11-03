'use client';

import { AdminUser, AdminRole, PermissionModule, PermissionAction } from './admin-types';
import { initialAdminUsers, rolePermissions } from './admin-mock-data';

const ADMIN_STORAGE_KEY = 'qrobo_admin_session';

export function getStoredAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAdminUser(user: AdminUser | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!user) {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } else {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
    }
    window.dispatchEvent(new Event('admin-auth-change'));
  } catch (e) {
    console.error('Failed to save admin session', e);
  }
}

export function getStaffUsers(): AdminUser[] {
  let list = initialAdminUsers;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('admin_users_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return list;
}

export function isAdminEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  if (trimmed === 'chirrauday02@gmail.com') return true;
  return getStaffUsers().some((u) => u.email.toLowerCase() === trimmed);
}

export async function adminSignIn(
  email: string,
  password: string
): Promise<{ user: AdminUser | null; error: string | null }> {
  // Simulate brief network latency
  await new Promise((resolve) => setTimeout(resolve, 200));

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  // Primary Super Admin: chirrauday02@gmail.com
  if (trimmedEmail === 'chirrauday02@gmail.com') {
    if (trimmedPassword !== 'UDAY0211@JR' && trimmedPassword !== 'uday0211jr') {
      return { user: null, error: 'Invalid password. Please enter the correct password.' };
    }
    const user: AdminUser = {
      id: 'user-admin-1',
      name: 'Chirra Uday',
      email: 'chirrauday02@gmail.com',
      role: 'Super Admin',
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: '2025-01-10T00:00:00Z',
    };
    setStoredAdminUser(user);
    return { user, error: null };
  }

  // Other staff accounts (from storage or initial data)
  const staff = getStaffUsers();
  const found = staff.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (found) {
    if (found.status !== 'active') {
      return { user: null, error: 'Your admin account has been deactivated. Please contact the administrator.' };
    }
    if (trimmedPassword !== 'UDAY0211@JR' && trimmedPassword !== 'qroboAdmin2026!') {
      return { user: null, error: 'Invalid password. Please enter the correct password.' };
    }
    const updated = { ...found, lastLogin: new Date().toISOString() };
    setStoredAdminUser(updated);
    return { user: updated, error: null };
  }

  return { user: null, error: 'Invalid admin email or password.' };
}

export async function adminSignOut(): Promise<void> {
  setStoredAdminUser(null);
}

export function hasPermission(
  role: AdminRole,
  module: PermissionModule,
  action: PermissionAction
): boolean {
  if (role === 'Super Admin') return true;
  const permissions = rolePermissions[role];
  if (!permissions) return false;
  const moduleActions = permissions[module];
  return moduleActions ? moduleActions.includes(action) : false;
}

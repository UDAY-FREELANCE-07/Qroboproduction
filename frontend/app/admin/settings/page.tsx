'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Truck,
  CreditCard,
  Bell,
  Search as SearchIcon,
  Shield,
  Save,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/lib/admin/admin-service';
import { AdminSettings } from '@/lib/admin/admin-types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [activeTab, setActiveTab] = useState<
    'general' | 'store' | 'shipping' | 'payments' | 'notifications' | 'seo' | 'security'
  >('general');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await adminService.getSettings();
      setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    await adminService.updateSettings(settings);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (!settings) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-slate-500">Loading store configuration...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'store', label: 'Store & GST', icon: Store },
    { key: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { key: 'payments', label: 'Payment Gateways', icon: CreditCard },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'seo', label: 'SEO & Metadata', icon: SearchIcon },
    { key: 'security', label: 'Security & Access', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Store Settings & System Config</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure fiscal GST details, delivery freight parameters, payment processors, and SEO presets.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="sm"
          className="h-9 gap-1.5 text-xs self-start sm:self-auto"
        >
          {savedSuccess ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </>
          )}
        </Button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave}>
        {/* Tab 1: General */}
        {activeTab === 'general' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              General Storefront Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="st-name">Store Display Name</Label>
                <Input
                  id="st-name"
                  value={settings.general.storeName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, storeName: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="st-email">Customer Support Email</Label>
                <Input
                  id="st-email"
                  type="email"
                  value={settings.general.storeEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, storeEmail: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="st-phone">Helpline Phone Number</Label>
                <Input
                  id="st-phone"
                  value={settings.general.phone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, phone: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="st-curr">Currency</Label>
                <Input
                  id="st-curr"
                  value={settings.general.currency}
                  disabled
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="st-tz">Timezone</Label>
                <Input
                  id="st-tz"
                  value={settings.general.timezone}
                  disabled
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="st-lang">Default Language</Label>
                <Input
                  id="st-lang"
                  value={settings.general.language}
                  disabled
                  className="bg-slate-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Store & GST */}
        {activeTab === 'store' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Legal Business Profile & GST Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="leg-name">Registered Corporate Entity</Label>
                <Input
                  id="leg-name"
                  value={settings.store.legalBusinessName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, legalBusinessName: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gst-num">Goods & Services Tax Identification (GSTIN)</Label>
                <Input
                  id="gst-num"
                  value={settings.store.gstNumber}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, gstNumber: e.target.value },
                    })
                  }
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="st-addr">Registered HQ Address</Label>
                <Input
                  id="st-addr"
                  value={settings.store.addressLine1}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, addressLine1: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="st-city">City</Label>
                <Input
                  id="st-city"
                  value={settings.store.city}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, city: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="st-state">State</Label>
                <Input
                  id="st-state"
                  value={settings.store.state}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, state: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="st-pin">Postal Code (PIN)</Label>
                <Input
                  id="st-pin"
                  value={settings.store.postalCode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, postalCode: e.target.value },
                    })
                  }
                  className="font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Shipping */}
        {activeTab === 'shipping' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Shipping & Freight Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="free-ship">Free Shipping Minimum Threshold (₹)</Label>
                <Input
                  id="free-ship"
                  type="number"
                  value={settings.shipping.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shipping: {
                        ...settings.shipping,
                        freeShippingThreshold: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="flat-ship">Standard Delivery Fee (₹)</Label>
                <Input
                  id="flat-ship"
                  type="number"
                  value={settings.shipping.flatRateDelivery}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shipping: {
                        ...settings.shipping,
                        flatRateDelivery: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="wh-addr">Primary Dispatch Warehouse Address</Label>
                <Input
                  id="wh-addr"
                  value={settings.shipping.warehouseAddress}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shipping: {
                        ...settings.shipping,
                        warehouseAddress: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 text-xs">Enable Express Air Delivery</p>
                <p className="text-[11px] text-slate-500">
                  Allow customers to pay ₹{settings.shipping.expressDeliveryFee} for same-day dispatch.
                </p>
              </div>
              <Switch
                checked={settings.shipping.enableExpressDelivery}
                onCheckedChange={(c) =>
                  setSettings({
                    ...settings,
                    shipping: {
                      ...settings.shipping,
                      enableExpressDelivery: c,
                    },
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Tab 4: Payments */}
        {activeTab === 'payments' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Payment Gateway Enablement
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Razorpay (Cards, NetBanking, UPI)</p>
                  <p className="text-[11px] text-slate-500">PCI-DSS compliant primary checkout gateway</p>
                </div>
                <Switch
                  checked={settings.payments.enableRazorpay}
                  onCheckedChange={(c) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, enableRazorpay: c },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Instant UPI Direct (GPay, PhonePe, Paytm)</p>
                  <p className="text-[11px] text-slate-500">Direct QR code & deep-link intent flows</p>
                </div>
                <Switch
                  checked={settings.payments.enableUPI}
                  onCheckedChange={(c) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, enableUPI: c },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Cash on Delivery (COD)</p>
                  <p className="text-[11px] text-slate-500">
                    Subject to phone verification and pincode serviceability
                  </p>
                </div>
                <Switch
                  checked={settings.payments.enableCOD}
                  onCheckedChange={(c) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, enableCOD: c },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50/50">
                <div>
                  <p className="font-bold text-amber-900 text-xs">Gateway Sandbox Test Mode</p>
                  <p className="text-[11px] text-amber-700">Simulate transactions without real fund transfers</p>
                </div>
                <Switch
                  checked={settings.payments.testMode}
                  onCheckedChange={(c) =>
                    setSettings({
                      ...settings,
                      payments: { ...settings.payments, testMode: c },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Notifications */}
        {activeTab === 'notifications' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Alerts & System Notifications
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Automated Customer Order Confirmations</p>
                  <p className="text-[11px] text-slate-500">Send transactional email with order receipt</p>
                </div>
                <Switch
                  checked={settings.notifications.emailOrderConfirmation}
                  onCheckedChange={(c) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        emailOrderConfirmation: c,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Warehouse Low-Stock Inventory Alerts</p>
                  <p className="text-[11px] text-slate-500">
                    Send email notifications to inventory managers when items drop below threshold
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.emailLowStockAlerts}
                  onCheckedChange={(c) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        emailLowStockAlerts: c,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: SEO */}
        {activeTab === 'seo' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Default SEO & Metadata
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="seo-mtitle">Global Meta Title</Label>
                <Input
                  id="seo-mtitle"
                  value={settings.seo.metaTitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, metaTitle: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="seo-mdesc">Global Meta Description</Label>
                <Textarea
                  id="seo-mdesc"
                  rows={3}
                  value={settings.seo.metaDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, metaDescription: e.target.value },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Search Engine Indexing</p>
                  <p className="text-[11px] text-slate-500">Enable Google / Bing crawler indexing for public pages</p>
                </div>
                <Switch
                  checked={settings.seo.indexingEnabled}
                  onCheckedChange={(c) =>
                    setSettings({
                      ...settings,
                      seo: { ...settings.seo, indexingEnabled: c },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Security */}
        {activeTab === 'security' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Administrative Access & Security Policy
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-900 text-xs">Mandatory 2FA for Staff Accounts</p>
                  <p className="text-[11px] text-slate-500">Require TOTP authenticator app verification upon login</p>
                </div>
                <Switch
                  checked={settings.security.requireTwoFactor}
                  onCheckedChange={(c) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, requireTwoFactor: c },
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sec-timeout">Admin Session Inactivity Timeout (Minutes)</Label>
                  <Input
                    id="sec-timeout"
                    type="number"
                    value={settings.security.sessionTimeoutMinutes}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          sessionTimeoutMinutes: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sec-expiry">Password Expiry Policy (Days)</Label>
                  <Input
                    id="sec-expiry"
                    type="number"
                    value={settings.security.adminPasswordExpirationDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          adminPasswordExpirationDays: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving} size="sm" className="h-9 gap-1.5 text-xs">
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

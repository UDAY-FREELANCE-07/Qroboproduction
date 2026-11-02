'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutTemplate,
  MoveUp,
  MoveDown,
  Edit2,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  Save,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminService } from '@/lib/admin/admin-service';
import { AdminHomepageSection } from '@/lib/admin/admin-types';

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<AdminHomepageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<AdminHomepageSection | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [itemCount, setItemCount] = useState<number>(4);

  const fetchSections = async () => {
    setIsLoading(true);
    const data = await adminService.getHomepageSections();
    setSections(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleToggle = async (section: AdminHomepageSection) => {
    const updated = await adminService.updateHomepageSection(section.id, {
      isEnabled: !section.isEnabled,
    });
    setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, isEnabled: !s.isEnabled } : s)));
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    setSections(newSections);
    await adminService.reorderHomepageSections(newSections);
  };

  const openEditModal = (section: AdminHomepageSection) => {
    setCurrentSection(section);
    setTitle(section.title);
    setSubtitle(section.subtitle || '');
    setCtaText(section.ctaText || '');
    setCtaUrl(section.ctaUrl || '');
    setItemCount(section.itemCount || 4);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSection) return;

    await adminService.updateHomepageSection(currentSection.id, {
      title,
      subtitle,
      ctaText,
      ctaUrl,
      itemCount: Number(itemCount),
    });

    setEditModalOpen(false);
    fetchSections();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Homepage Section Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reorder modules, toggle visibility, and configure promotional carousels without touching code.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSections}
            className="h-9 gap-1.5 text-xs text-slate-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset / Sync</span>
          </Button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-white px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span>Preview Live Storefront</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Info Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900 flex items-start gap-3">
        <LayoutTemplate className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Dynamic Homepage Orchestrator</p>
          <p className="mt-0.5 text-blue-700">
            Drag, shift, and customize display titles for all storefront sections. The customer homepage reads this exact configuration via the admin service layer.
          </p>
        </div>
      </div>

      {/* Sections Table / Reorder List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Order</th>
                <th className="py-3 px-3">Module Component</th>
                <th className="py-3 px-3">Headline Title & Description</th>
                <th className="py-3 px-3">CTA Button</th>
                <th className="py-3 px-3">Display Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sections.map((s, idx) => (
                <tr
                  key={s.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    !s.isEnabled ? 'bg-slate-50/40 opacity-70' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-center font-bold text-slate-500 font-mono">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                      {s.type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-slate-900">{s.title}</p>
                    {s.subtitle && <p className="text-[11px] text-slate-500">{s.subtitle}</p>}
                  </td>
                  <td className="py-3 px-3">
                    {s.ctaText ? (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {s.ctaText} &rarr; {s.ctaUrl}
                      </span>
                    ) : (
                      <span className="text-slate-400">&mdash;</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={s.isEnabled}
                        onCheckedChange={() => handleToggle(s)}
                        aria-label="Toggle section"
                      />
                      <span className="text-[11px] font-medium text-slate-700">
                        {s.isEnabled ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                        className="h-8 w-8 p-0"
                        title="Move Up"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={idx === sections.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="h-8 w-8 p-0"
                        title="Move Down"
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(s)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                        title="Edit Configuration"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Section Configuration Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <DialogTitle className="text-slate-900">
                Configure: {currentSection?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="sec-title">Section Heading *</Label>
                <Input
                  id="sec-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Featured Electronics"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sec-sub">Subtitle / Description</Label>
                <Input
                  id="sec-sub"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Short marketing hook..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sec-cta-t">CTA Button Text</Label>
                  <Input
                    id="sec-cta-t"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. View All"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sec-cta-u">CTA Link Target</Label>
                  <Input
                    id="sec-cta-u"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="/shop"
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sec-count">Max Visible Products / Cards</Label>
                <Input
                  id="sec-count"
                  type="number"
                  min="1"
                  max="16"
                  value={itemCount}
                  onChange={(e) => setItemCount(Number(e.target.value))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Section Config</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

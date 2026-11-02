'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  User,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { adminService } from '@/lib/admin/admin-service';
import { AdminTutorial } from '@/lib/admin/admin-types';
import { formatDate } from '@/lib/format';

export default function AdminTutorialsPage() {
  const [tutorials, setTutorials] = useState<AdminTutorial[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTut, setEditingTut] = useState<AdminTutorial | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Arduino');
  const [tags, setTags] = useState('Arduino, IoT, C++');
  const [thumbnail, setThumbnail] = useState('');
  const [readTime, setReadTime] = useState('8 min read');
  const [author, setAuthor] = useState('Vikramaditya Roy');
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchTutorials = async () => {
    setIsLoading(true);
    const data = await adminService.getTutorials();
    setTutorials(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  const openCreateModal = () => {
    setEditingTut(null);
    setTitle('');
    setSlug('');
    setCategory('Arduino');
    setTags('Arduino, Robotics, Microcontroller');
    setThumbnail('https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800');
    setReadTime('7 min read');
    setAuthor('Vikramaditya Roy');
    setVideoUrl('');
    setContent('## Introduction\n\nStart writing tutorial documentation...');
    setStatus('published');
    setModalOpen(true);
  };

  const openEditModal = (t: AdminTutorial) => {
    setEditingTut(t);
    setTitle(t.title);
    setSlug(t.slug);
    setCategory(t.category);
    setTags(t.tags.join(', '));
    setThumbnail(t.thumbnail);
    setReadTime(t.readTime);
    setAuthor(t.author);
    setVideoUrl(t.videoUrl || '');
    setContent(t.content);
    setStatus(t.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagList = tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      tags: tagList,
      thumbnail,
      readTime,
      author,
      videoUrl,
      content,
      status,
    };

    if (editingTut) {
      await adminService.updateTutorial(editingTut.id, payload);
    } else {
      await adminService.createTutorial(payload);
    }
    setModalOpen(false);
    fetchTutorials();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await adminService.deleteTutorial(deleteId);
      setDeleteId(null);
      fetchTutorials();
    }
  };

  const toggleStatus = async (t: AdminTutorial) => {
    const next = t.status === 'published' ? 'draft' : 'published';
    await adminService.updateTutorial(t.id, { status: next });
    fetchTutorials();
  };

  const filtered = tutorials.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Articles & Lab Tutorials</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish educational articles, microcontroller pinout references, and code tutorials.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="h-9 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>New Tutorial</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search tutorials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">{filtered.length} tutorials</span>
      </div>

      {/* Tutorials Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Author</th>
                <th className="py-3 px-3">Read Time</th>
                <th className="py-3 px-3">Tags</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3 min-w-[220px]">
                      <img
                        src={t.thumbnail}
                        alt=""
                        className="h-10 w-14 rounded-md object-cover border border-slate-200 shrink-0 bg-slate-100"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{t.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{t.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{t.category}</td>
                  <td className="py-3 px-3 text-slate-700">{t.author}</td>
                  <td className="py-3 px-3 text-slate-500">{t.readTime}</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {t.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={t.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(t)}
                        className="h-8 text-xs text-slate-600"
                      >
                        {t.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(t)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteId(t.id);
                          setDeleteOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Tutorial Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-slate-900">
                {editingTut ? 'Edit Tutorial Article' : 'Write New Tutorial'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="t-title">Article Title *</Label>
                <Input
                  id="t-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Getting Started with Arduino Uno R4 WiFi"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arduino">Arduino</SelectItem>
                      <SelectItem value="Raspberry Pi">Raspberry Pi</SelectItem>
                      <SelectItem value="ESP32 / IoT">ESP32 / IoT</SelectItem>
                      <SelectItem value="Robotics">Robotics & ROS</SelectItem>
                      <SelectItem value="Sensors">Sensors & Interfacing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="t-author">Author</Label>
                  <Input
                    id="t-author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Vikramaditya Roy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="t-read">Estimated Read Time</Label>
                  <Input
                    id="t-read"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="8 min read"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(val) => setStatus(val as 'published' | 'draft')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="t-thumb">Thumbnail Image URL</Label>
                <Input
                  id="t-thumb"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="t-tags">Tags (Comma-separated)</Label>
                <Input
                  id="t-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Arduino, ESP32, IoT, Tutorial"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="t-content">Article Markdown Content</Label>
                <Textarea
                  id="t-content"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write tutorial body in markdown..."
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingTut ? 'Save Article' : 'Publish Article'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Tutorial"
        description="Are you sure you want to permanently delete this tutorial article?"
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

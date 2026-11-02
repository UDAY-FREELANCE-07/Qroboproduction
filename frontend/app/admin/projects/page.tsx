'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  DollarSign,
  Code2,
  Package,
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
import { AdminProject } from '@/lib/admin/admin-types';
import { formatPrice } from '@/lib/format';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [image, setImage] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(2500);
  const [estimatedTime, setEstimatedTime] = useState('3 Hours');
  const [instructions, setInstructions] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    const data = await adminService.getProjects();
    setProjects(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setDifficulty('Beginner');
    setImage('https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800');
    setEstimatedCost(2500);
    setEstimatedTime('2.5 Hours');
    setInstructions('Step 1: Assemble chassis\nStep 2: Connect microcontroller');
    setCodeSnippet('// Setup code\nvoid setup() {\n  Serial.begin(115200);\n}');
    setStatus('published');
    setModalOpen(true);
  };

  const openEditModal = (p: AdminProject) => {
    setEditingProject(p);
    setTitle(p.title);
    setSlug(p.slug);
    setDescription(p.description);
    setDifficulty(p.difficulty);
    setImage(p.image);
    setEstimatedCost(p.estimatedCost);
    setEstimatedTime(p.estimatedTime);
    setInstructions(p.instructions);
    setCodeSnippet(p.codeSnippet || '');
    setStatus(p.status);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description,
      difficulty,
      image,
      estimatedCost: Number(estimatedCost),
      estimatedTime,
      requiredComponents: editingProject?.requiredComponents || [
        { name: 'Arduino Uno R4 Board', quantity: 1 },
        { name: 'Ultrasonic Sonar Module', quantity: 1 },
      ],
      instructions,
      codeSnippet,
      status,
    };

    if (editingProject) {
      await adminService.updateProject(editingProject.id, payload);
    } else {
      await adminService.createProject(payload);
    }
    setModalOpen(false);
    fetchProjects();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await adminService.deleteProject(deleteId);
      setDeleteId(null);
      fetchProjects();
    }
  };

  const toggleStatus = async (p: AdminProject) => {
    const next = p.status === 'published' ? 'draft' : 'published';
    await adminService.updateProject(p.id, { status: next });
    fetchProjects();
  };

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Robotics & STEM Projects</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build DIY project blueprints, component BOMs (Bill of Materials), and step-by-step schematics.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="h-9 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span>New STEM Project</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">{filtered.length} projects</span>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="relative rounded-lg overflow-hidden h-40 mb-3 bg-slate-100 border border-slate-200">
                <img src={p.image} alt="" className="h-full w-full object-cover" />
                <div className="absolute top-2 right-2">
                  <StatusBadge status={p.status} size="sm" />
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <span className="rounded bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur">
                    {p.difficulty}
                  </span>
                  <span className="rounded bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 backdrop-blur">
                    <Clock className="h-2.5 w-2.5" />
                    {p.estimatedTime}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-base text-slate-900 leading-tight">{p.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>

              {/* Required BOM preview */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Package className="h-3 w-3 text-primary" />
                  <span>Required Hardware Kit ({p.requiredComponents.length} items)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {p.requiredComponents.map((c, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                    >
                      {c.quantity}x {c.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400">Est. Project Cost</span>
                <p className="text-sm font-bold text-slate-900">{formatPrice(p.estimatedCost)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleStatus(p)}
                  className="h-8 text-xs text-slate-600"
                >
                  {p.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(p)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDeleteId(p.id);
                    setDeleteOpen(true);
                  }}
                  className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Project Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-slate-900">
                {editingProject ? 'Edit Robotics Project' : 'Add STEM Robotics Project'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="proj-title">Project Title *</Label>
                <Input
                  id="proj-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous Obstacle-Avoiding Robot Car"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Difficulty Level</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(val) =>
                      setDifficulty(val as 'Beginner' | 'Intermediate' | 'Advanced')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner (School / Intro)</SelectItem>
                      <SelectItem value="Intermediate">Intermediate (IoT / Sensors)</SelectItem>
                      <SelectItem value="Advanced">Advanced (ROS / Vision / RTOS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="est-time">Estimated Build Time</Label>
                  <Input
                    id="est-time"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="3 Hours"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cost">Estimated Hardware Cost (₹)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Publishing Status</Label>
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
                <Label htmlFor="proj-img">Cover Image URL</Label>
                <Input
                  id="proj-img"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proj-desc">Project Overview / Hook</Label>
                <Textarea
                  id="proj-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what the robot accomplishes..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proj-inst">Step-by-Step Build Instructions (Markdown)</Label>
                <Textarea
                  id="proj-inst"
                  rows={4}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="### Step 1: Chassis Assembly..."
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proj-code">Embedded Firmware Code / Script</Label>
                <Textarea
                  id="proj-code"
                  rows={4}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="// Arduino C++ or Python code..."
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingProject ? 'Save Project' : 'Publish Project'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete STEM Project"
        description="Are you sure you want to remove this project tutorial from the website?"
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

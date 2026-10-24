'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Category = Database['public']['Tables']['categories']['Row'];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [iconName, setIconName] = useState('Cpu');
  const [isFeatured, setIsFeatured] = useState(false);

  const load = async () => {
    const { data } = await dataClient.from('categories').select('*').order('sort_order');
    setCategories(data || []);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), icon_name: iconName, is_featured: isFeatured };
    if (editing) {
      const { error } = await dataClient.from('categories').update(data).eq('id', editing.id);
      if (error) { toast.error('Failed to update'); return; }
      toast.success('Category updated');
    } else {
      const { error } = await dataClient.from('categories').insert(data);
      if (error) { toast.error('Failed to create'); return; }
      toast.success('Category created');
    }
    setEditing(null); setName(''); setSlug(''); setIconName('Cpu'); setIsFeatured(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const { error } = await dataClient.from('categories').delete().eq('id', id);
    if (error) { toast.error('Cannot delete - products may reference this category'); }
    else { toast.success('Category deleted'); load(); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Categories</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-navy mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1" placeholder="auto-generated" />
            </div>
            <div>
              <Label htmlFor="iconName">Icon Name</Label>
              <Input id="iconName" value={iconName} onChange={(e) => setIconName(e.target.value)} className="mt-1" />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-primary" />
              <span className="text-sm">Featured on homepage</span>
            </label>
            <div className="flex gap-2">
              <Button type="submit">{editing ? 'Update' : 'Add'} Category</Button>
              {editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); setName(''); setSlug(''); }}>Cancel</Button>}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          {isLoading ? <div className="p-4 animate-pulse">Loading...</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="text-sm font-medium text-navy">{cat.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                    <TableCell>{cat.is_featured ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Yes</span> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setEditing(cat); setName(cat.name); setSlug(cat.slug); setIconName(cat.icon_name || 'Cpu'); setIsFeatured(cat.is_featured); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(cat.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

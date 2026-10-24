'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Banner = Database['public']['Tables']['banners']['Row'];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [isActive, setIsActive] = useState(true);

  const load = async () => {
    const { data } = await dataClient.from('banners').select('*').order('sort_order');
    setBanners(data || []);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { title, subtitle, description, image_url: imageUrl, category_label: categoryLabel, cta_text: ctaText, cta_link: ctaLink, is_active: isActive };
    if (editing) {
      await dataClient.from('banners').update(data).eq('id', editing.id);
      toast.success('Banner updated');
    } else {
      await dataClient.from('banners').insert(data);
      toast.success('Banner created');
    }
    setEditing(null); setTitle(''); setSubtitle(''); setDescription(''); setImageUrl(''); setCategoryLabel('');
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await dataClient.from('banners').delete().eq('id', id);
    toast.success('Banner deleted');
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Homepage Banners</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-navy mb-4">{editing ? 'Edit Banner' : 'Add Banner'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="title">Title</Label><Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" /></div>
            <div><Label htmlFor="subtitle">Subtitle</Label><Input id="subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="description">Description</Label><textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" rows={3} /></div>
            <div><Label htmlFor="imageUrl">Image URL</Label><Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1" /></div>
            <div><Label htmlFor="categoryLabel">Category Label</Label><Input id="categoryLabel" value={categoryLabel} onChange={(e) => setCategoryLabel(e.target.value)} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label htmlFor="ctaText">CTA Text</Label><Input id="ctaText" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="mt-1" /></div>
              <div><Label htmlFor="ctaLink">CTA Link</Label><Input id="ctaLink" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} className="mt-1" /></div>
            </div>
            <label className="flex items-center gap-2"><Switch checked={isActive} onCheckedChange={setIsActive} /> <span className="text-sm">Active</span></label>
            <div className="flex gap-2">
              <Button type="submit">{editing ? 'Update' : 'Add'} Banner</Button>
              {editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); setTitle(''); }}>Cancel</Button>}
            </div>
          </form>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? <div className="animate-pulse">Loading...</div> : banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
              {banner.image_url && <img src={banner.image_url} alt={banner.title} className="w-24 h-24 rounded-lg object-cover" />}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-navy">{banner.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{banner.description}</p>
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(banner); setTitle(banner.title); setSubtitle(banner.subtitle || ''); setDescription(banner.description || ''); setImageUrl(banner.image_url || ''); setCategoryLabel(banner.category_label || ''); setCtaText(banner.cta_text); setCtaLink(banner.cta_link); setIsActive(banner.is_active); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(banner.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

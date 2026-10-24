'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star, Check, X } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Review = Database['public']['Tables']['reviews']['Row'];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<(Review & { product: { name: string } | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    const { data } = await dataClient
      .from('reviews')
      .select('*, product:products(name)')
      .order('created_at', { ascending: false });
    setReviews((data as any) || []);
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleApproval = async (id: string, current: boolean) => {
    const { error } = await dataClient.from('reviews').update({ is_approved: !current }).eq('id', id);
    if (error) { toast.error('Failed to update'); }
    else { toast.success(!current ? 'Review approved' : 'Review hidden'); load(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await dataClient.from('reviews').delete().eq('id', id);
    toast.success('Review deleted');
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Reviews</h1>
      {isLoading ? <div className="animate-pulse">Loading...</div> : reviews.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">No reviews yet</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="text-sm font-medium text-navy">{review.product?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn('w-3 h-3', i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200')} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs line-clamp-2">{review.body || review.title || '-'}</TableCell>
                  <TableCell>{review.is_verified_purchase ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Yes</span> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                  <TableCell>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', review.is_approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                      {review.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(review.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => toggleApproval(review.id, review.is_approved)}>
                        {review.is_approved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { dataClient } from '@/lib/data-client';
import type { Database } from '@/lib/data-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function AdminCustomersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profRes, ordersRes] = await Promise.all([
        dataClient.from('profiles').select('*').order('created_at', { ascending: false }),
        dataClient.from('orders').select('user_id'),
      ]);
      setProfiles(profRes.data || []);
      const counts: Record<string, number> = {};
      (ordersRes.data || []).forEach((o: any) => { counts[o.user_id] = (counts[o.user_id] || 0) + 1; });
      setOrderCounts(counts);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Customers</h1>
      {isLoading ? <div className="animate-pulse">Loading...</div> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="text-sm font-medium text-navy">{profile.full_name || 'N/A'}</TableCell>
                  <TableCell>
                    <span className={cn('text-xs px-2 py-1 rounded-full', profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600')}>
                      {profile.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{profile.phone || '-'}</TableCell>
                  <TableCell className="text-sm font-medium text-navy">{orderCounts[profile.id] || 0}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(profile.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

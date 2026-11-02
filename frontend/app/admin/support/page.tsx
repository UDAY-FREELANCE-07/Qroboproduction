'use client';

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Search,
  Filter,
  MessageSquare,
  Clock,
  Send,
  User,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { EmptyState } from '@/components/admin/EmptyState';
import { adminService } from '@/lib/admin/admin-service';
import { AdminSupportTicket } from '@/lib/admin/admin-types';
import { formatDate, formatDateTime } from '@/lib/format';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Ticket Thread Modal State
  const [activeTicket, setActiveTicket] = useState<AdminSupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    const data = await adminService.getSupportTickets();
    setTickets(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenThread = (t: AdminSupportTicket) => {
    setActiveTicket(t);
    setReplyMessage('');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyMessage.trim()) return;

    setIsReplying(true);
    const updated = await adminService.replyToTicket(activeTicket.id, replyMessage, 'Pooja Iyer');
    if (updated) {
      setActiveTicket(updated);
      setReplyMessage('');
      fetchTickets();
    }
    setIsReplying(false);
  };

  const handleUpdateStatus = async (id: string, status: AdminSupportTicket['status']) => {
    await adminService.updateTicketStatus(id, status);
    if (activeTicket && activeTicket.id === id) {
      setActiveTicket({ ...activeTicket, status });
    }
    fetchTickets();
  };

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const getPriorityColor = (priority: AdminSupportTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'low':
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support Desk & Help Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Resolve customer inquiries, technical firmware debugging, GST invoice requests, and returns.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTickets}
          className="h-9 gap-1.5 text-xs text-slate-600 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by ticket #, customer, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Ticket Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Ticket Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="waiting">Waiting on Customer</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Priority Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading support queue...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            title="No support tickets found"
            description="No active issues match your filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket Number</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Subject Inquiry</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Assigned Agent</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      <button
                        onClick={() => handleOpenThread(t)}
                        className="hover:underline text-left"
                      >
                        {t.ticketNumber}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{t.customerName}</p>
                      <p className="text-[11px] text-slate-400">{t.customerEmail}</p>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <p className="font-semibold text-slate-900 line-clamp-1">{t.subject}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{t.message}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {t.assignedAgent || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={t.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenThread(t)}
                        className="h-8 gap-1 text-xs"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>Reply ({t.replies?.length || 0})</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Conversation Modal */}
      {activeTicket && (
        <Dialog open={!!activeTicket} onOpenChange={(open) => !open && setActiveTicket(null)}>
          <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-primary">
                    {activeTicket.ticketNumber}
                  </span>
                  <DialogTitle className="text-base text-slate-900 mt-0.5">
                    {activeTicket.subject}
                  </DialogTitle>
                </div>
                <StatusBadge status={activeTicket.status} size="sm" />
              </div>
            </DialogHeader>

            <div className="space-y-4 py-3">
              {/* Customer original inquiry */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    {activeTicket.customerName} ({activeTicket.customerEmail})
                  </span>
                  <span className="text-slate-400 font-mono">
                    {formatDateTime(activeTicket.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-wrap">{activeTicket.message}</p>
              </div>

              {/* Reply Thread */}
              {activeTicket.replies?.map((rep) => (
                <div
                  key={rep.id}
                  className={`rounded-xl border p-4 text-xs space-y-1.5 ${
                    rep.role === 'agent'
                      ? 'bg-blue-50/60 border-blue-200 ml-6'
                      : 'bg-white border-slate-200 mr-6'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      {rep.sender}
                      {rep.role === 'agent' && (
                        <span className="rounded bg-primary text-white text-[9px] font-bold px-1.5 py-0.2">
                          STAFF
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDateTime(rep.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{rep.message}</p>
                </div>
              ))}

              {/* Status Update Options */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Quick Status:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(activeTicket.id, 'in_progress')}
                  className="h-7 text-xs"
                >
                  In Progress
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(activeTicket.id, 'waiting')}
                  className="h-7 text-xs"
                >
                  Waiting
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(activeTicket.id, 'resolved')}
                  className="h-7 text-xs text-emerald-700"
                >
                  Mark Resolved
                </Button>
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="space-y-2 pt-2">
                <Label htmlFor="reply-box">Send Staff Response</Label>
                <Textarea
                  id="reply-box"
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type official reply to customer..."
                  className="text-xs"
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={isReplying} className="h-8 gap-1.5 text-xs">
                    <Send className="h-3.5 w-3.5" />
                    <span>{isReplying ? 'Sending...' : 'Send Response'}</span>
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

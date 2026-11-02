'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Package,
  ShoppingCart,
  CreditCard,
  LifeBuoy,
  Info,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { AdminNotification } from '@/lib/admin/admin-types';
import { adminService } from '@/lib/admin/admin-service';
import { cn } from '@/lib/utils';

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifs = async () => {
    const data = await adminService.getNotifications();
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await adminService.markAllNotificationsRead();
    fetchNotifs();
  };

  const handleItemClick = async (notif: AdminNotification) => {
    if (!notif.isRead) {
      await adminService.markNotificationRead(notif.id);
      fetchNotifs();
    }
    setOpen(false);
  };

  const getIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'inventory':
        return <Package className="h-4 w-4 text-amber-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case 'support':
        return <LifeBuoy className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-slate-50/50">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
            <p className="text-xs text-slate-500">
              {unreadCount} unread message{unreadCount === 1 ? '' : 's'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-8 text-xs text-primary hover:text-primary/90"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No notifications</div>
          ) : (
            notifications.map((n) => {
              const item = (
                <div
                  className={cn(
                    'flex items-start gap-3 p-3 text-left transition-colors hover:bg-slate-50 cursor-pointer',
                    !n.isRead && 'bg-blue-50/40'
                  )}
                  onClick={() => handleItemClick(n)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-xs text-slate-900 leading-tight',
                        !n.isRead ? 'font-bold' : 'font-medium'
                      )}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                  </div>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  )}
                </div>
              );

              return n.link ? (
                <Link key={n.id} href={n.link}>
                  {item}
                </Link>
              ) : (
                <div key={n.id}>{item}</div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-100 p-2 text-center bg-slate-50/50">
          <Link
            href="/admin/orders"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all order activity
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

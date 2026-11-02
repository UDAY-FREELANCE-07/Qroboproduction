'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: number; // percentage change, e.g. 12.5 or -4.2
  changeLabel?: string; // e.g. "vs last month"
  icon: LucideIcon;
  iconColor?: string; // e.g. 'bg-blue-500'
  href?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  change,
  changeLabel = 'vs last 30 days',
  icon: Icon,
  iconColor = 'bg-primary',
  href,
  className,
}: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0;

  const content = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md',
        href && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm transition-transform group-hover:scale-105',
            iconColor
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {change !== undefined && (
          <div className="mt-2 flex items-center text-xs">
            <span
              className={cn(
                'inline-flex items-center font-semibold gap-0.5 rounded px-1.5 py-0.5',
                isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
            <span className="ml-2 text-slate-400">{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

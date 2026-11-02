'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BrandLogoProps {
  href?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark' | 'admin';
  theme?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
  collapsed?: boolean;
  priority?: boolean;
}

const sizeMap = {
  xs: {
    img: 'h-6 sm:h-7 w-auto',
    title: 'text-sm sm:text-base',
    badge: 'text-[9px] px-1 py-0.2',
    sub: 'text-[10px]',
    gap: 'gap-1.5',
  },
  sm: {
    img: 'h-8 sm:h-9 w-auto',
    title: 'text-base sm:text-lg',
    badge: 'text-[10px] px-1.5 py-0.5',
    sub: 'text-[11px]',
    gap: 'gap-2',
  },
  md: {
    img: 'h-9 sm:h-10 md:h-11 w-auto',
    title: 'text-xl sm:text-2xl',
    badge: 'text-xs px-2 py-0.5',
    sub: 'text-xs',
    gap: 'gap-2 sm:gap-2.5',
  },
  lg: {
    img: 'h-12 sm:h-14 w-auto',
    title: 'text-2xl sm:text-3xl',
    badge: 'text-xs px-2 py-0.5',
    sub: 'text-sm',
    gap: 'gap-3',
  },
  xl: {
    img: 'h-16 sm:h-20 w-auto',
    title: 'text-3xl sm:text-4xl',
    badge: 'text-sm px-2.5 py-1',
    sub: 'text-sm',
    gap: 'gap-3 sm:gap-4',
  },
};

export function BrandLogo({
  href = '/',
  size = 'md',
  variant = 'full',
  theme = 'auto',
  showSubtitle = false,
  subtitleText = 'Robotics & Electronics',
  className,
  collapsed = false,
  priority = false,
}: BrandLogoProps) {
  const s = sizeMap[size];

  // Determine text colors based on theme
  const isDark = theme === 'dark';
  const titleColor = isDark ? 'text-white' : 'text-navy';
  const primaryColor = isDark ? 'text-blue-400' : 'text-primary';
  const subColor = isDark ? 'text-slate-400' : 'text-gray-500';

  const logoContent = (
    <div
      className={cn(
        'group inline-flex items-center shrink-0 select-none transition-transform duration-200',
        s.gap,
        className
      )}
    >
      {/* 3D Transparent Mascot Mark */}
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src="/logo.png"
          alt="Qrobo"
          className={cn(
            s.img,
            'object-contain drop-shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md'
          )}
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>

      {/* Brand Wordmark and Badges */}
      {!collapsed && variant !== 'mark' && (
        <div className="flex flex-col justify-center leading-none shrink-0">
          <div className="flex items-center gap-1.5">
            <span className={cn(s.title, 'font-black tracking-tight whitespace-nowrap', titleColor)}>
              Q<span className={primaryColor}>robo</span>
            </span>

            {variant === 'admin' && (
              <span
                className={cn(
                  'rounded font-bold tracking-wider uppercase shadow-sm whitespace-nowrap',
                  s.badge,
                  isDark
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                    : 'bg-primary text-white'
                )}
              >
                Admin
              </span>
            )}
          </div>

          {showSubtitle && (
            <p className={cn(s.sub, 'mt-1 font-medium tracking-wide truncate whitespace-nowrap', subColor)}>
              {subtitleText}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (!href) {
    return logoContent;
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
      aria-label="Qrobo Home"
    >
      {logoContent}
    </Link>
  );
}

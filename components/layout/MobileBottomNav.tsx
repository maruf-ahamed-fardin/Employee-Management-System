'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Receipt,
  Laptop,
  Contact,
} from 'lucide-react';
import { cn } from '@/lib/utils/format';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isCenter?: boolean;
}

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Staff', href: '/employees', icon: Users },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Home', href: '/dashboard', icon: Home, isCenter: true },
  { label: 'Assets', href: '/assets', icon: Laptop },
  { label: 'Cards', href: '/team-profile', icon: Contact },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-3.5 flex flex-col items-center justify-center group focus:outline-none"
              >
                <div
                  className={cn(
                    'size-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl active:scale-95 ring-4 ring-white dark:ring-[#090d16]',
                    isActive
                      ? 'bg-gradient-to-tr from-[#F37021] to-[#ff8c42] text-white shadow-[#F37021]/40 scale-105'
                      : 'bg-slate-900 dark:bg-slate-800 text-slate-300 hover:text-white shadow-slate-950/30'
                  )}
                >
                  <Icon className="size-5 stroke-[2.2]" />
                </div>
                <span
                  className={cn(
                    'text-[10px] mt-0.5 font-bold tracking-tight transition-colors',
                    isActive ? 'text-[#F37021]' : 'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[54px]',
                isActive
                  ? 'text-primary font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              )}
            >
              <div className="relative">
                <Icon className={cn('size-5', isActive && 'text-[#F37021]')} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-[#F37021]" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

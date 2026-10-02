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
  colorName: string;
  activeGradient: string;
  inactiveIconColor: string;
  activeLabelColor: string;
  glowColor: string;
  softBg: string;
}

const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    label: 'Staff',
    href: '/employees',
    icon: Users,
    colorName: 'sky',
    activeGradient: 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white',
    inactiveIconColor: 'text-sky-500 dark:text-sky-400',
    activeLabelColor: 'text-sky-500 dark:text-sky-400 font-bold',
    glowColor: 'shadow-sky-500/30',
    softBg: 'bg-sky-500/10 dark:bg-sky-500/15',
  },
  {
    label: 'Expenses',
    href: '/expenses',
    icon: Receipt,
    colorName: 'emerald',
    activeGradient: 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white',
    inactiveIconColor: 'text-emerald-500 dark:text-emerald-400',
    activeLabelColor: 'text-emerald-500 dark:text-emerald-400 font-bold',
    glowColor: 'shadow-emerald-500/30',
    softBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
  },
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
    isCenter: true,
    colorName: 'orange',
    activeGradient: 'bg-gradient-to-tr from-[#F37021] to-[#ff8c42] text-white',
    inactiveIconColor: 'text-[#F37021] dark:text-[#ff8c42]',
    activeLabelColor: 'text-[#F37021] dark:text-[#ff8c42] font-bold',
    glowColor: 'shadow-[#F37021]/40',
    softBg: 'bg-[#F37021]/10 dark:bg-[#F37021]/15',
  },
  {
    label: 'Assets',
    href: '/assets',
    icon: Laptop,
    colorName: 'purple',
    activeGradient: 'bg-gradient-to-tr from-purple-500 to-indigo-600 text-white',
    inactiveIconColor: 'text-purple-500 dark:text-purple-400',
    activeLabelColor: 'text-purple-500 dark:text-purple-400 font-bold',
    glowColor: 'shadow-purple-500/30',
    softBg: 'bg-purple-500/10 dark:bg-purple-500/15',
  },
  {
    label: 'Cards',
    href: '/team-profile',
    icon: Contact,
    colorName: 'rose',
    activeGradient: 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white',
    inactiveIconColor: 'text-rose-500 dark:text-rose-400',
    activeLabelColor: 'text-rose-500 dark:text-rose-400 font-bold',
    glowColor: 'shadow-rose-500/30',
    softBg: 'bg-rose-500/10 dark:bg-rose-500/15',
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className="flex flex-col items-center justify-center py-1 px-1.5 min-w-[56px] transition-all select-none active:scale-95 group focus:outline-none"
            >
              {/* Colorful Icon Container (Balanced Size for all 5 buttons) */}
              <div
                className={cn(
                  'size-9 rounded-xl flex items-center justify-center transition-all duration-300 relative',
                  isActive
                    ? cn(item.activeGradient, 'shadow-md', item.glowColor, 'scale-105')
                    : cn(
                        item.softBg,
                        item.inactiveIconColor,
                        'hover:scale-105 border border-transparent hover:border-current/20'
                      )
                )}
              >
                <Icon
                  className={cn(
                    'size-4.5 transition-transform duration-200',
                    isActive ? 'stroke-[2.4]' : 'stroke-[2]'
                  )}
                />

                {/* Tiny Active Pill Indicator */}
                {isActive && (
                  <span className="absolute -bottom-1 size-1 rounded-full bg-white dark:bg-slate-900" />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] mt-1 font-semibold tracking-tight transition-colors',
                  isActive
                    ? item.activeLabelColor
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationConfig } from '@/config/navigation';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils/format';
import { X } from 'lucide-react';
import { SeloraLogo } from '@/components/brand/SeloraLogo';

export function MobileNav() {
  const pathname = usePathname();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { user } = useAuthStore();

  if (!mobileMenuOpen) return null;

  const userRole = user?.role || 'employee';

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer */}
      <div className="relative z-50 flex flex-col w-72 max-w-[80vw] bg-white dark:bg-[#0b1120] border-r border-border shadow-2xl h-full p-4">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
            <SeloraLogo size="sm" subtitle="EMS Enterprise" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          {navigationConfig.map((item) => {
            if (item.roles && !item.roles.includes(userRole)) return null;

            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                )}
              >
                <Icon
                  className={cn(
                    'size-5 shrink-0',
                    isActive ? 'text-[#f37021] dark:text-[#fb923c]' : 'text-slate-400'
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

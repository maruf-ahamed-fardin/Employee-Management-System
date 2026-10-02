'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationConfig } from '@/config/navigation';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils/format';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { SeloraLogo, SeloraIcon } from '@/components/brand/SeloraLogo';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const userRole = user?.role || 'employee';

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300 relative z-30',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Floating Edge Collapse / Expand Toggle Button */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-5 z-40 flex size-6 items-center justify-center rounded-full border border-border bg-card shadow-md hover:bg-accent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
      >
        <ChevronLeft
          className={cn('size-3.5 transition-transform duration-200', sidebarCollapsed && 'rotate-180')}
        />
      </button>

      {/* Brand Header with SeloraX Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-border',
          sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4 pr-5'
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 overflow-hidden group focus-visible:outline-none"
        >
          {sidebarCollapsed ? (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/80 ring-1 ring-border group-hover:scale-105 transition-transform">
              <SeloraIcon size={26} />
            </div>
          ) : (
            <div className="flex items-center pl-1 group-hover:opacity-90 transition-opacity">
              <SeloraLogo size="md" subtitle="EMS Enterprise" />
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Items Grouped by Section */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-none">
        {(['Workspace', 'Finance & Operations', 'Organization', 'Administration'] as const).map((sectionName) => {
          const sectionItems = navigationConfig.filter(
            (item) => item.section === sectionName && (!item.roles || item.roles.includes(userRole))
          );

          if (sectionItems.length === 0) return null;

          return (
            <div key={sectionName} className="space-y-1">
              {!sidebarCollapsed ? (
                <div className="px-3 pb-1 pt-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400/90 dark:text-slate-500">
                  {sectionName}
                </div>
              ) : (
                <div className="my-2 border-t border-border/50" />
              )}

              {sectionItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    title={sidebarCollapsed ? item.title : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm shadow-[#252175]/20 dark:shadow-[#4f46e5]/25 font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-4.5 shrink-0 transition-colors',
                        isActive
                          ? 'text-[#f37021] dark:text-[#fb923c]'
                          : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      )}
                    />
                    {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                    {!sidebarCollapsed && item.badge && (
                      <span
                        className={cn(
                          'ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#f37021]/15 text-[#ea580c] dark:bg-[#f37021]/20 dark:text-[#fb923c]'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Enterprise Status Footer */}
      {!sidebarCollapsed && (
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-[#252175]/8 via-[#f37021]/6 to-transparent border border-[#252175]/15 dark:border-[#818cf8]/20 dark:from-[#4f46e5]/10 dark:via-[#f37021]/10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#252175] dark:text-[#818cf8]">
            <Sparkles className="size-3.5 text-[#f37021]" />
            <span>SeloraX Enterprise</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Workforce telemetry & active operations.
          </p>
        </div>
      )}
    </aside>
  );
}

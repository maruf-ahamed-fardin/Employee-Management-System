'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <Home className="size-3.5" />
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const formatted = segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        return (
          <div key={href} className="flex items-center gap-1.5">
            <ChevronRight className="size-3 text-slate-400" />
            {isLast ? (
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatted}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                {formatted}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

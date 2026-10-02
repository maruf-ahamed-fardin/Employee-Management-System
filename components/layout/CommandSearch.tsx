'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  Building2,
  Briefcase,
  Navigation,
  ArrowRight,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SearchResultPayload {
  employees: {
    id: string;
    name: string;
    employeeCode: string;
    positionTitle: string;
    departmentName: string;
    email: string;
  }[];
  departments: {
    id: string;
    name: string;
    code: string;
  }[];
  positions: {
    id: string;
    title: string;
    departmentName: string;
  }[];
  navigation: {
    name: string;
    href: string;
  }[];
}

export function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultPayload | null>(null);
  const [loading, setLoading] = useState(false);

  // Shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced live search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.data);
        }
      } catch {}
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  const hasAnyResults =
    results &&
    (results.employees.length > 0 ||
      results.departments.length > 0 ||
      results.positions.length > 0 ||
      results.navigation.length > 0);

  return (
    <>
      {/* Desktop Search Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:inline-flex items-center gap-2 h-9 w-60 lg:w-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 px-3 text-xs text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <Search className="size-3.5 text-muted-foreground" />
        <span className="truncate">Search people, teams...</span>
        <kbd className="ml-auto rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          Ctrl K
        </kbd>
      </button>

      {/* Mobile Search Trigger Icon */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="md:hidden size-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
      >
        <Search className="size-5" />
      </button>

      {/* Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          containerClassName="items-start pt-[10vh] sm:pt-[15vh]"
          className="p-0 overflow-hidden sm:max-w-xl bg-card border-border shadow-2xl"
        >
          <DialogTitle className="sr-only">Quick Search</DialogTitle>
          <DialogDescription className="sr-only">
            Find colleagues, departments, job positions, and navigate pages
          </DialogDescription>

          <div className="relative border-b border-border/80 p-3 sm:p-4 bg-background">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 size-4 text-primary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search colleagues, departments, positions, or features..."
              className="pl-9 pr-8 h-10 border-0 shadow-none focus-visible:ring-0 text-sm bg-transparent"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto p-2 sm:p-3 space-y-4">
            {query.trim().length < 2 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Quick Universal Search</p>
                <p className="mt-1 text-[11px]">
                  Type at least 2 characters to search across staff directory, departments, and system modules.
                </p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center p-8 text-xs text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Searching SeloraX directory...</span>
              </div>
            ) : !hasAnyResults ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">No matches found for &quot;{query}&quot;</p>
                <p className="mt-1 text-[11px]">
                  Try searching by employee name, ID (e.g. SX-001), or department name.
                </p>
              </div>
            ) : (
              <>
                {/* People Results */}
                {results.employees.length > 0 && (
                  <div className="space-y-1">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Colleagues & Staff
                    </p>
                    {results.employees.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => handleSelect(`/team-profile/${e.id}`)}
                        className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-secondary/70 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="size-8 rounded-xl bg-accent text-accent-foreground font-bold text-xs flex items-center justify-center shrink-0">
                            {e.name.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                              {e.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {e.employeeCode} · {e.positionTitle} · {e.departmentName}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          View Card →
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Departments Results */}
                {results.departments.length > 0 && (
                  <div className="space-y-1 border-t border-border/60 pt-2">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Departments
                    </p>
                    {results.departments.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleSelect(`/departments/${d.id}`)}
                        className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-secondary/70 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Building2 className="size-4" />
                          </span>
                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {d.name}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{d.code}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Positions Results */}
                {results.positions.length > 0 && (
                  <div className="space-y-1 border-t border-border/60 pt-2">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Job Positions
                    </p>
                    {results.positions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelect('/positions')}
                        className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-secondary/70 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="size-8 rounded-xl bg-secondary text-foreground flex items-center justify-center shrink-0">
                            <Briefcase className="size-4 text-[#F37021]" />
                          </span>
                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {p.title}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{p.departmentName}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Navigation Results */}
                {results.navigation.length > 0 && (
                  <div className="space-y-1 border-t border-border/60 pt-2">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      System Features & Pages
                    </p>
                    {results.navigation.map((nav, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelect(nav.href)}
                        className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-secondary/70 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="size-8 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                            <Navigation className="size-4 text-primary" />
                          </span>
                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {nav.name}
                          </span>
                        </div>
                        <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border-t border-border/60 bg-muted/30 px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Press Esc to close</span>
            <span className="flex items-center gap-1">
              <Sparkles className="size-3 text-[#F37021]" />
              <span>SeloraX Quick Command</span>
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

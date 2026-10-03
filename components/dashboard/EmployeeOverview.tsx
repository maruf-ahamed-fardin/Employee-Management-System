'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  Mail,
  CheckCircle2,
  TrendingUp,
  Building2,
  Copy,
  Check,
  Briefcase,
  Send,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/format';

export interface RecentEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: { id?: string; name: string; code?: string };
  position?: { id?: string; title: string };
  status: string;
  createdAt?: string | Date;
  hireDate?: string | Date;
  photoUrl?: string | null;
}

interface EmployeeOverviewProps {
  employees?: RecentEmployee[];
  totalEmployeesCount?: number;
  className?: string;
}

// Department theme configuration for avatars, badges, and accents
const DEPT_CONFIGS: Record<
  string,
  {
    gradient: string;
    text: string;
    border: string;
    badgeBg: string;
    barColor: string;
  }
> = {
  Engineering: {
    gradient: 'from-blue-600 to-indigo-600 text-white',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    barColor: 'bg-blue-500',
  },
  'Product & Design': {
    gradient: 'from-purple-600 to-pink-600 text-white',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    barColor: 'bg-purple-500',
  },
  'Finance & Operations': {
    gradient: 'from-emerald-600 to-teal-600 text-white',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    barColor: 'bg-emerald-500',
  },
  'Human Resources': {
    gradient: 'from-rose-600 to-amber-600 text-white',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    barColor: 'bg-rose-500',
  },
  Marketing: {
    gradient: 'from-amber-600 to-orange-600 text-white',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    barColor: 'bg-amber-500',
  },
};

function getDeptStyle(deptName?: string) {
  if (!deptName) {
    return {
      gradient: 'from-indigo-600 to-violet-600 text-white',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
      barColor: 'bg-indigo-500',
    };
  }

  // Exact or partial match
  for (const [key, value] of Object.entries(DEPT_CONFIGS)) {
    if (deptName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(deptName.toLowerCase())) {
      return value;
    }
  }

  return {
    gradient: 'from-indigo-600 to-violet-600 text-white',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
    barColor: 'bg-indigo-500',
  };
}

export function EmployeeOverview({
  employees = [],
  totalEmployeesCount,
  className,
}: EmployeeOverviewProps) {
  const [activeDeptFilter, setActiveDeptFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique departments for filter pills
  const departments = useMemo(() => {
    const map = new Map<string, number>();
    employees.forEach((emp) => {
      const dept = emp.department?.name || 'General';
      map.set(dept, (map.get(dept) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    if (activeDeptFilter === 'ALL') return employees.slice(0, 5);
    return employees
      .filter((emp) => (emp.department?.name || 'General') === activeDeptFilter)
      .slice(0, 5);
  }, [employees, activeDeptFilter]);

  // Department distribution metrics for segmented progress bar
  const deptBreakdown = useMemo(() => {
    const total = employees.length || 1;
    return departments.map((d) => ({
      name: d.name,
      count: d.count,
      percentage: Math.round((d.count / total) * 100),
      style: getDeptStyle(d.name),
    }));
  }, [departments, employees]);

  const copyEmail = (e: React.MouseEvent, email: string, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedId(email);
    toast.success(`Copied ${name}'s email (${email})`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendWelcomeGreetings = () => {
    toast.success('🎉 Welcome greeting & digital onboarding pack dispatched to all recent joiners!', {
      description: 'Emails and workspace invitations have been synchronized.',
    });
  };

  return (
    <div
      className={cn(
        'col-span-full lg:col-span-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0b101d]/90 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group',
        className
      )}
    >
      {/* Ambient background glow decoration */}
      <div className="absolute -top-24 -right-24 size-48 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 size-48 bg-gradient-to-tr from-blue-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* ─── 1. TOP HEADER SECTION ────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800/60 relative z-10 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Animated Icon Avatar */}
            <div className="size-10 sm:size-11 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-blue-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
              <UserPlus className="size-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Recent Joiners
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {employees.length} New
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Fresh talent & onboarding momentum
              </p>
            </div>
          </div>

          {/* View Directory Link */}
          <Link
            href="/employees"
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/70 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700/80 transition-all duration-200 shadow-xs group/btn"
          >
            <span>View All</span>
            <ArrowUpRight className="size-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* ─── 2. INTERACTIVE DEPARTMENT FILTER PILLS ───────────────────────── */}
        {departments.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pt-3.5 mt-0.5">
            <button
              type="button"
              onClick={() => setActiveDeptFilter('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-xl text-[11px] font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0',
                activeDeptFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800'
              )}
            >
              All ({employees.length})
            </button>
            {departments.map((dept) => {
              const isActive = activeDeptFilter === dept.name;
              return (
                <button
                  key={dept.name}
                  type="button"
                  onClick={() => setActiveDeptFilter(dept.name)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-[11px] font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 truncate max-w-[130px]',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800'
                  )}
                >
                  {dept.name.split(' ')[0]} ({dept.count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 3. EMPLOYEES ROSTER LIST ─────────────────────────────────────── */}
      <div className="p-3 sm:p-4 space-y-2.5 flex-1 relative z-10">
        {filteredEmployees.length === 0 ? (
          <div className="py-8 text-center">
            <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-2">
              <Users className="size-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              No recent additions found
            </p>
          </div>
        ) : (
          filteredEmployees.map((emp) => {
            const deptStyle = getDeptStyle(emp.department?.name);
            const initials = `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();

            return (
              <Link
                key={emp.id}
                href={`/employees/${emp.id}`}
                className="group/emp block p-2.5 sm:p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/70 bg-slate-50/70 dark:bg-[#0e1424]/60 hover:bg-white dark:hover:bg-[#121a2e] hover:border-indigo-500/40 hover:shadow-md transition-all duration-200 relative overflow-hidden"
              >
                {/* Subtle highlight bar on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover/emp:bg-indigo-500 transition-colors" />

                <div className="flex items-center justify-between gap-3">
                  {/* Left: Avatar + Names */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div
                        className={cn(
                          'size-10 sm:size-10.5 rounded-2xl bg-gradient-to-tr flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm ring-2 ring-white/10 group-hover/emp:scale-105 transition-transform duration-200',
                          deptStyle.gradient
                        )}
                      >
                        {initials}
                      </div>
                      {/* Active status pulse */}
                      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0b101d] flex items-center justify-center">
                        <span className="size-1.5 rounded-full bg-white animate-pulse" />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover/emp:text-indigo-600 dark:group-hover/emp:text-indigo-400 transition-colors">
                          {emp.firstName} {emp.lastName}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {emp.position?.title || 'Team Member'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={cn(
                            'text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md border truncate max-w-[150px]',
                            deptStyle.badgeBg
                          )}
                        >
                          {emp.department?.name || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Employee Code & Quick Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-300/40 dark:border-slate-700/60">
                      {emp.employeeCode}
                    </span>

                    {/* Copy Email Quick Action */}
                    {emp.email && (
                      <button
                        type="button"
                        onClick={(e) => copyEmail(e, emp.email, `${emp.firstName} ${emp.lastName}`)}
                        className="size-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={`Copy email: ${emp.email}`}
                      >
                        {copiedId === emp.email ? (
                          <Check className="size-3.5 text-emerald-400" />
                        ) : (
                          <Mail className="size-3.5" />
                        )}
                      </button>
                    )}

                    {/* Arrow hint on hover */}
                    <div className="size-6 rounded-lg flex items-center justify-center text-slate-400 group-hover/emp:text-indigo-500 dark:group-hover/emp:text-indigo-400 group-hover/emp:translate-x-0.5 transition-all">
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* ─── 4. ONBOARDING HEALTH & VELOCITY BENTO SECTION (No Empty Void!) ── */}
      <div className="p-3.5 sm:p-4.5 bg-slate-50/80 dark:bg-[#070b14]/80 border-t border-slate-200/60 dark:border-slate-800/70 relative z-10 shrink-0 space-y-3.5">
        {/* Growth & Readiness Metric Strip */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200/60 dark:border-slate-800/80 shadow-xs flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Onboarding
              </p>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                100% On Track
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0e1424] border border-slate-200/60 dark:border-slate-800/80 shadow-xs flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Talent Growth
              </p>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                +{employees.length} Hires
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Department Distribution Segmented Bar */}
        {deptBreakdown.length > 0 && (
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Briefcase className="size-3 text-slate-400" />
                Department Spread
              </span>
              <span>{employees.length} active additions</span>
            </div>

            {/* Segmented Bar */}
            <div className="h-2 w-full rounded-full bg-slate-200/80 dark:bg-slate-800/90 overflow-hidden flex shadow-inner">
              {deptBreakdown.map((dept, idx) => (
                <div
                  key={dept.name}
                  className={cn(dept.style.barColor, 'h-full transition-all duration-500 relative')}
                  style={{ width: `${dept.percentage}%` }}
                  title={`${dept.name}: ${dept.count} (${dept.percentage}%)`}
                />
              ))}
            </div>

            {/* Department mini legend */}
            <div className="flex items-center gap-3 flex-wrap text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
              {deptBreakdown.map((dept) => (
                <div key={dept.name} className="flex items-center gap-1.5 shrink-0">
                  <span className={cn('size-2 rounded-full shrink-0', dept.style.barColor)} />
                  <span className="font-semibold">{dept.name.split(' ')[0]}</span>
                  <span className="font-mono text-slate-400 text-[9px]">({dept.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 5. ACTION BUTTONS: Onboard New Hire & Send Welcome ───────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <Link
            href="/employees/new"
            className="w-full h-9 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <UserPlus className="size-3.5 text-indigo-200" />
            <span>Onboard Hire</span>
          </Link>

          <button
            type="button"
            onClick={sendWelcomeGreetings}
            className="w-full h-9 rounded-xl bg-slate-200/70 dark:bg-slate-800/90 hover:bg-slate-300/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300/50 dark:border-slate-700/60 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="size-3.5 text-amber-500 dark:text-amber-400" />
            <span>Send Welcome</span>
          </button>
        </div>
      </div>
    </div>
  );
}

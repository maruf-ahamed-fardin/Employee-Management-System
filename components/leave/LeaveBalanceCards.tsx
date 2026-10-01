'use client';

import React from 'react';
import { BalanceAdjustDialog } from './BalanceAdjustDialog';
import {
  GraduationCap,
  BookOpen,
  Coffee,
  Palmtree,
  HeartPulse,
  Baby,
  Layers,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils/format';

export interface LeaveBalanceItem {
  id: string;
  leaveTypeName: string;
  allocated: number;
  used: number;
  pending?: number;
  available: number;
  carriedForward?: number;
}

interface Props {
  balances: LeaveBalanceItem[];
  canManage?: boolean;
  onRefresh?: () => void;
}

// Icon and theme mapping for leave categories
const LEAVE_THEMES: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    accentText: string;
    iconBg: string;
    barGradient: string;
  }
> = {
  'University Class': {
    icon: GraduationCap,
    accentText: 'text-blue-500 dark:text-blue-400',
    iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    barGradient: 'from-blue-600 to-indigo-500',
  },
  Exam: {
    icon: BookOpen,
    accentText: 'text-indigo-500 dark:text-indigo-400',
    iconBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    barGradient: 'from-indigo-600 to-purple-500',
  },
  'Casual Leave': {
    icon: Coffee,
    accentText: 'text-sky-500 dark:text-sky-400',
    iconBg: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    barGradient: 'from-sky-500 to-cyan-500',
  },
  'Annual Paid Leave': {
    icon: Palmtree,
    accentText: 'text-amber-500 dark:text-amber-400',
    iconBg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    barGradient: 'from-amber-500 to-[#F37021]',
  },
  'Medical / Sick Leave': {
    icon: HeartPulse,
    accentText: 'text-emerald-500 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    barGradient: 'from-emerald-500 to-teal-500',
  },
  'Parental Leave': {
    icon: Baby,
    accentText: 'text-rose-500 dark:text-rose-400',
    iconBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    barGradient: 'from-rose-500 to-pink-500',
  },
  Others: {
    icon: Layers,
    accentText: 'text-slate-400 dark:text-slate-300',
    iconBg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    barGradient: 'from-slate-500 to-slate-400',
  },
};

export function LeaveBalanceCards({ balances, canManage = false, onRefresh }: Props) {
  if (balances.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-8 text-center text-sm text-slate-400">
        No leave quotas allocated for the current fiscal year.
      </div>
    );
  }

  // Calculate overall summary metrics
  const totalAvailable = balances.reduce((sum, b) => sum + Math.max(0, b.available), 0);
  const totalAllocated = balances.reduce((sum, b) => sum + b.allocated, 0);
  const totalUsed = balances.reduce((sum, b) => sum + b.used, 0);
  const totalPending = balances.reduce((sum, b) => sum + (b.pending || 0), 0);
  const overallUsedPct = Math.min(100, Math.round((totalUsed / Math.max(totalAllocated, 1)) * 100));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* ─── CARD 1: Symmetrical Total Entitlement Hub (Completes 8-Card Grid) ─ */}
      <div className="relative overflow-hidden rounded-2xl border border-[#F37021]/30 bg-gradient-to-br from-[#1b1754] via-[#211c66] to-[#0e1628] text-white p-5 shadow-lg shadow-indigo-950/20 flex flex-col justify-between group hover:border-[#F37021]/60 transition-all duration-300">
        <div className="absolute -top-10 -right-10 size-28 rounded-full bg-[#F37021]/20 blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[#F37021]" />
              Total Quota Balance
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F37021]/20 text-[#F37021] border border-[#F37021]/30">
              FY 2026
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">
              {totalAvailable}
            </span>
            <span className="text-xs text-slate-300 font-medium">total days left</span>
          </div>

          {/* Overall Progress bar */}
          <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-[#818cf8] to-[#F37021] transition-all duration-500"
              style={{ width: `${Math.max(overallUsedPct, 6)}%` }}
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-medium text-slate-300">
          <span>Used: {totalUsed}d</span>
          {totalPending > 0 && (
            <span className="text-amber-400 font-bold">Pending: {totalPending}d</span>
          )}
          <span>Total: {totalAllocated}d</span>
        </div>
      </div>

      {/* ─── CARDS 2 to 8: Individual Color-Coded Leave Quotas ────────────────── */}
      {balances.map((b) => {
        const total = Math.max(b.allocated + (b.carriedForward || 0), 1);
        const usedPct = Math.min(100, Math.round((b.used / total) * 100));
        const pendingPct = Math.min(100 - usedPct, Math.round(((b.pending || 0) / total) * 100));
        const availableDays = Math.max(0, b.available);

        const theme = LEAVE_THEMES[b.leaveTypeName] || {
          icon: Layers,
          accentText: 'text-[#F37021]',
          iconBg: 'bg-orange-500/10 text-[#F37021] border-orange-500/20',
          barGradient: 'from-orange-500 to-amber-500',
        };
        const Icon = theme.icon;

        return (
          <div
            key={b.id}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'size-8 rounded-xl flex items-center justify-center shrink-0 border',
                      theme.iconBg
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight group-hover:text-[#F37021] transition-colors">
                    {b.leaveTypeName}
                  </span>
                </div>

                {canManage && (
                  <BalanceAdjustDialog
                    balanceId={b.id}
                    leaveTypeName={b.leaveTypeName}
                    currentAllocated={b.allocated}
                    onSuccess={onRefresh}
                  />
                )}
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className={cn('text-3xl font-black font-mono tracking-tight', theme.accentText)}>
                  {availableDays}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  days left
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
                <div
                  className={cn('transition-all duration-500 bg-gradient-to-r', theme.barGradient)}
                  style={{ width: `${usedPct}%` }}
                  title={`Used: ${b.used}d`}
                />
                <div
                  className="bg-amber-400 transition-all duration-500"
                  style={{ width: `${pendingPct}%` }}
                  title={`Pending: ${b.pending || 0}d`}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>Used: {b.used}d</span>
              {Boolean(b.pending) && (
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  Pending: {b.pending}d
                </span>
              )}
              <span className="text-slate-700 dark:text-slate-300 font-bold">
                Total: {b.allocated}d
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

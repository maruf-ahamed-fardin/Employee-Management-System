'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  BellRing,
  Users2,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CalendarCheck,
  Contact,
  Users,
} from 'lucide-react';
import { DashboardHero } from './DashboardHero';
import { StatsCards } from './StatsCards';
import { AttendanceChart } from './AttendanceChart';
import { EmployeeOverview } from './EmployeeOverview';
import { RecentActivity } from './RecentActivity';
import { CompanyNoticeBoard } from './CompanyNoticeBoard';
import { cn } from '@/lib/utils/format';

export type DashboardTab = 'overview' | 'pulse' | 'workforce';

interface DepartmentMetric {
  id: string;
  name: string;
  code: string;
  count: number;
}

interface DashboardClientViewProps {
  metrics: {
    totalEmployees: number;
    activeEmployees: number;
    departmentsCount: number;
    pendingLeaves: number;
    attendance: {
      present: number;
      late: number;
      absent: number;
      onLeave: number;
      attendanceRate: number;
    };
    recentEmployees: any[];
  };
  leaveTypes: any[];
  employees: any[];
  departments?: DepartmentMetric[];
  todayAttendance?: any[];
}

const DEPT_BADGES: Record<string, { badge: string; dot: string }> = {
  ENG: {
    badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    dot: 'bg-blue-500',
  },
  FIN: {
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  HRD: {
    badge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    dot: 'bg-rose-500',
  },
  PRD: {
    badge: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    dot: 'bg-purple-500',
  },
  MKT: {
    badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
    dot: 'bg-orange-500',
  },
  SLS: {
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500',
  },
};

export function DashboardClientView({
  metrics,
  leaveTypes,
  employees,
  departments = [],
  todayAttendance = [],
}: DashboardClientViewProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: Zap,
      badge: null,
      desc: 'KPIs, attendance trends & recent events',
    },
    {
      id: 'pulse' as const,
      label: 'Company Pulse',
      icon: BellRing,
      badge: 'Updates',
      desc: 'Notice board, holidays & peer kudos',
    },
    {
      id: 'workforce' as const,
      label: 'Workforce',
      icon: Users2,
      badge: `${metrics.totalEmployees}`,
      desc: 'Department headcounts & team directory',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Hero Welcome & Quick Action Dock ─────────────────────────────────── */}
      <DashboardHero leaveTypes={leaveTypes} employees={employees} />

      {/* ─── Segmented Navigation Switcher (Desktop & Mobile Optimized) ──────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Tab Buttons Pill Group */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full sm:w-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center justify-center sm:justify-start gap-2 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none active:scale-95',
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md shadow-slate-950/15'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                )}
              >
                <Icon
                  className={cn(
                    'size-4 shrink-0 transition-colors',
                    isActive
                      ? 'text-[#F37021] dark:text-[#F37021]'
                      : 'text-slate-400 dark:text-slate-500'
                  )}
                />
                <span className="truncate">{tab.label}</span>
                {tab.badge && (
                  <span
                    className={cn(
                      'hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold',
                      isActive
                        ? 'bg-[#F37021] text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Context Subtitle / Live Indicator */}
        <div className="hidden sm:flex items-center gap-2 pr-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {activeTab === 'overview' && 'Real-time operations & presence'}
            {activeTab === 'pulse' && 'Corporate notice board & cultural pulse'}
            {activeTab === 'workforce' && 'Staff distribution across departments'}
          </span>
        </div>
      </div>

      {/* ─── TAB 1: DAILY OVERVIEW (Clean, Breathable, Informative) ──────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top 4 Key Metric Cards */}
          <StatsCards
            totalEmployees={metrics.totalEmployees}
            presentToday={metrics.attendance.present}
            lateToday={metrics.attendance.late}
            pendingLeaves={metrics.pendingLeaves}
            attendanceRate={metrics.attendance.attendanceRate}
          />

          {/* 12-Column Balanced Bento Grid: Trends (8 cols) + Recent Joiners (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <AttendanceChart
              attendanceMetrics={metrics.attendance}
              totalEmployees={metrics.totalEmployees}
              employees={employees}
              initialTodayAttendance={todayAttendance}
            />
            <EmployeeOverview
              employees={metrics.recentEmployees as any}
              totalEmployeesCount={metrics.totalEmployees}
            />
          </div>

          {/* Full-Width Real-time System Activity Feed */}
          <RecentActivity />
        </div>
      )}

      {/* ─── TAB 2: COMPANY PULSE (Announcements, Celebrations, Kudos) ──────── */}
      {activeTab === 'pulse' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Notice Board Feed + 3-Tab Corporate Pulse Hub (Holidays, Celebrations, Kudos) */}
          <CompanyNoticeBoard employees={employees} />
        </div>
      )}

      {/* ─── TAB 3: WORKFORCE & DEPARTMENTS ──────────────────────────────────── */}
      {activeTab === 'workforce' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Workforce
                </span>
                <div className="size-9 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <Users className="size-4.5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-black font-mono text-slate-900 dark:text-white">
                {metrics.totalEmployees}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {metrics.activeEmployees} active on payroll
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Departments
                </span>
                <div className="size-9 rounded-xl flex items-center justify-center bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <Building2 className="size-4.5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-black font-mono text-slate-900 dark:text-white">
                {departments.length || metrics.departmentsCount}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Functional units at Dhaka HQ
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Today's Attendance Rate
                </span>
                <div className="size-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CalendarCheck className="size-4.5" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {metrics.attendance.attendanceRate}%
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {metrics.attendance.present} present today
              </p>
            </div>
          </div>

          {/* Department Headcount Breakdown Cards */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="size-5 text-[#F37021]" />
                  Department Headcount & Allocation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time workforce distribution across all functional business units
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/employees"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Users className="size-3.5" />
                  <span>Manage Employees</span>
                  <ArrowRight className="size-3" />
                </Link>
                <Link
                  href="/team-profile"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Contact className="size-3.5 text-[#F37021]" />
                  <span>Digital Cards</span>
                </Link>
              </div>
            </div>

            {/* Department Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const total = metrics.totalEmployees || 1;
                const percentage = Math.round((dept.count / total) * 100);
                const theme = DEPT_BADGES[dept.code] || {
                  badge: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
                  dot: 'bg-indigo-500',
                };

                return (
                  <div
                    key={dept.id}
                    className="relative overflow-hidden p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-slate-50 dark:bg-[#111827] hover:border-[#F37021]/50 dark:hover:border-[#F37021]/60 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#F37021] transition-colors flex items-center gap-2">
                        <span className={`size-2 rounded-full ${theme.dot}`} />
                        {dept.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${theme.badge}`}
                      >
                        {dept.code}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                          {dept.count}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          staff
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {percentage}% of total
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-[#F37021] transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Joiners full list */}
          <EmployeeOverview
            employees={metrics.recentEmployees as any}
            totalEmployeesCount={metrics.totalEmployees}
          />
        </div>
      )}
    </div>
  );
}

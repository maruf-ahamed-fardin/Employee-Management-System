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
}

export function DashboardClientView({
  metrics,
  leaveTypes,
  employees,
  departments = [],
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
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
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 text-white dark:text-slate-950 shadow-md shadow-slate-950/15'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
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
            <AttendanceChart />
            <EmployeeOverview employees={metrics.recentEmployees as any} />
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
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
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

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
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

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
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
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
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

                return (
                  <div
                    key={dept.id}
                    className="p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-850/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#F37021] transition-colors">
                        {dept.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {dept.code}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-3">
                      <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                        {dept.count}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {percentage}% of staff
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2.5 h-2 w-full rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-[#F37021] transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Joiners full list */}
          <EmployeeOverview employees={metrics.recentEmployees as any} />
        </div>
      )}
    </div>
  );
}

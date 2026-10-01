'use client';

import { Users, UserCheck, Clock, CalendarDays, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface DashboardStatsProps {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  pendingLeaves: number;
  attendanceRate: number;
}

export function StatsCards({
  totalEmployees = 0,
  presentToday = 0,
  lateToday = 0,
  pendingLeaves = 0,
  attendanceRate = 0,
}: DashboardStatsProps) {
  const cards = [
    {
      title: 'Total Employees',
      value: totalEmployees,
      trend: '+12% this quarter',
      trendUp: true,
      subtext: 'Active workforce across 6 depts',
      icon: Users,
      gradient: 'from-blue-600/10 via-indigo-600/5 to-transparent',
      glowColor: 'group-hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20',
    },
    {
      title: 'Present Today',
      value: presentToday,
      trend: `${attendanceRate}% attendance`,
      trendUp: true,
      subtext: `${totalEmployees - presentToday} off / on leave today`,
      icon: UserCheck,
      gradient: 'from-emerald-600/10 via-teal-600/5 to-transparent',
      glowColor: 'group-hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20',
      hasProgress: true,
      percentage: attendanceRate,
    },
    {
      title: 'Late Arrivals',
      value: lateToday,
      trend: '-2 vs yesterday',
      trendUp: false,
      subtext: 'Punched past 9:15 AM BST',
      icon: Clock,
      gradient: 'from-amber-600/10 via-orange-600/5 to-transparent',
      glowColor: 'group-hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20',
    },
    {
      title: 'Pending Leaves',
      value: pendingLeaves,
      trend: 'Action needed',
      trendUp: false,
      subtext: 'Awaiting manager sign-off',
      icon: CalendarDays,
      gradient: 'from-purple-600/10 via-pink-600/5 to-transparent',
      glowColor: 'group-hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/10 dark:hover:shadow-slate-950/40 ${c.glowColor}`}
          >
            {/* Ambient inner card gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg}`}>
                <Icon className="size-4.5" />
              </div>
            </div>

            <div className="relative z-10 mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                {c.value}
              </span>
              <span
                className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                  c.trendUp
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {c.trendUp ? (
                  <TrendingUp className="size-3 mr-1 inline" />
                ) : (
                  <TrendingDown className="size-3 mr-1 inline" />
                )}
                {c.trend}
              </span>
            </div>

            {/* Optional Progress Bar for Present Today */}
            {c.hasProgress && (
              <div className="relative z-10 mt-2.5 space-y-1">
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, c.percentage))}%` }}
                  />
                </div>
              </div>
            )}

            <p className="relative z-10 mt-2 text-xs text-slate-500 dark:text-slate-400">
              {c.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}

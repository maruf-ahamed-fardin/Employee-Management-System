import { Users, UserCheck, Clock, CalendarDays, TrendingUp } from 'lucide-react';
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
      subtext: 'Active workforce',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Present Today',
      value: presentToday,
      subtext: `${attendanceRate}% presence rate`,
      icon: UserCheck,
      color: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Late Arrivals',
      value: lateToday,
      subtext: 'Past standard 9:00 AM',
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Pending Leaves',
      value: pendingLeaves,
      subtext: 'Requires HR/Manager review',
      icon: CalendarDays,
      color: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.title} className="relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {c.title}
                </span>
                <span className={`p-2.5 rounded-xl ${c.iconBg}`}>
                  <Icon className="size-4" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {c.value}
                </span>
                <span className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="size-3 mr-0.5 inline" />
                  Live
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.subtext}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

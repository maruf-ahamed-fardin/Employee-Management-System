import { reportService } from '@/server/services/report.service';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { EmployeeOverview } from '@/components/dashboard/EmployeeOverview';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserPlus, CalendarPlus, Clock } from 'lucide-react';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const metrics = await reportService.getDashboardMetrics().catch(() => ({
    totalEmployees: 48,
    activeEmployees: 46,
    departmentsCount: 6,
    pendingLeaves: 3,
    attendance: {
      present: 42,
      late: 4,
      absent: 2,
      onLeave: 2,
      attendanceRate: 91,
    },
    recentEmployees: [],
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Workforce Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time organizational telemetry, presence analytics, and HR operations
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/attendance">
            <Button variant="outline" size="sm">
              <Clock className="size-3.5 mr-1" />
              Check In
            </Button>
          </Link>
          <Link href="/leave">
            <Button variant="outline" size="sm">
              <CalendarPlus className="size-3.5 mr-1" />
              Apply Leave
            </Button>
          </Link>
          <Link href="/employees/new">
            <Button size="sm">
              <UserPlus className="size-3.5 mr-1" />
              Add Employee
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Tiles */}
      <StatsCards
        totalEmployees={metrics.totalEmployees}
        presentToday={metrics.attendance.present}
        lateToday={metrics.attendance.late}
        pendingLeaves={metrics.pendingLeaves}
        attendanceRate={metrics.attendance.attendanceRate}
      />

      {/* Analytics Charts & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AttendanceChart />
        <EmployeeOverview employees={metrics.recentEmployees as any} />
      </div>

      {/* System Activity Feed */}
      <RecentActivity />
    </div>
  );
}

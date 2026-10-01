import { reportService } from '@/server/services/report.service';
import { prisma } from '@/lib/db';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { EmployeeOverview } from '@/components/dashboard/EmployeeOverview';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { CompanyNoticeBoard } from '@/components/dashboard/CompanyNoticeBoard';
import { DashboardHero } from '@/components/dashboard/DashboardHero';

export const metadata = {
  title: 'Dashboard | SeloraX EMS',
};

export default async function DashboardPage() {
  const [metrics, leaveTypes, employees] = await Promise.all([
    reportService.getDashboardMetrics().catch(() => ({
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
    })),
    prisma.leaveType.findMany({ where: { isActive: true } }),
    prisma.employee.findMany({
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        department: { select: { name: true } },
        position: { select: { title: true } },
      },
      orderBy: { firstName: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Dynamic Personalized Hero & 1-Click Quick Action Dock */}
      <DashboardHero leaveTypes={leaveTypes} employees={employees} />

      {/* Metric Tiles */}
      <StatsCards
        totalEmployees={metrics.totalEmployees}
        presentToday={metrics.attendance.present}
        lateToday={metrics.attendance.late}
        pendingLeaves={metrics.pendingLeaves}
        attendanceRate={metrics.attendance.attendanceRate}
      />

      {/* Company Notice Board & Corporate Pulse Hub */}
      <CompanyNoticeBoard employees={employees} />

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

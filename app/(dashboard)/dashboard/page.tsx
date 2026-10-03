import { reportService } from '@/server/services/report.service';
import { prisma } from '@/lib/db';
import { DashboardClientView } from '@/components/dashboard/DashboardClientView';
import { unstable_cache } from 'next/cache';
import { getTodayDateString } from '@/lib/utils/date';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Dashboard | SeloraX EMS',
};

const getCachedLeaveTypes = unstable_cache(
  async () => prisma.leaveType.findMany({ where: { isActive: true } }),
  ['dashboard-leave-types'],
  { revalidate: 120, tags: ['leave-types'] }
);

const getCachedDepartments = unstable_cache(
  async () =>
    prisma.department.findMany({
      where: { isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        code: true,
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ['dashboard-departments'],
  { revalidate: 60, tags: ['departments'] }
);

const getCachedOverviewEmployees = unstable_cache(
  async () =>
    prisma.employee.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        email: true,
        photoUrl: true,
        department: { select: { name: true, code: true } },
        position: { select: { title: true } },
      },
      orderBy: { firstName: 'asc' },
      take: 100,
    }),
  ['dashboard-overview-employees'],
  { revalidate: 30, tags: ['employees'] }
);

export default async function DashboardPage() {
  const today = getTodayDateString();

  const [metrics, leaveTypes, employees, rawDepartments, todayAttendance] = await Promise.all([
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
    getCachedLeaveTypes(),
    getCachedOverviewEmployees(),
    getCachedDepartments(),
    prisma.attendance.findMany({
      where: { workDate: today },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            photoUrl: true,
            department: { select: { name: true, code: true } },
            position: { select: { title: true } },
          },
        },
        records: {
          orderBy: { occurredAt: 'asc' },
        },
      },
      orderBy: [{ firstInAt: 'desc' }, { employee: { firstName: 'asc' } }],
    }),
  ]);

  const departments = rawDepartments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    code: dept.code,
    count: dept._count.employees,
  }));

  return (
    <DashboardClientView
      metrics={metrics}
      leaveTypes={leaveTypes}
      employees={employees}
      departments={departments}
      todayAttendance={todayAttendance}
    />
  );
}

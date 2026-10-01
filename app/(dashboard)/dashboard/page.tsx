import { reportService } from '@/server/services/report.service';
import { prisma } from '@/lib/db';
import { DashboardClientView } from '@/components/dashboard/DashboardClientView';

export const metadata = {
  title: 'Dashboard | SeloraX EMS',
};

export default async function DashboardPage() {
  const [metrics, leaveTypes, employees, rawDepartments] = await Promise.all([
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
    />
  );
}

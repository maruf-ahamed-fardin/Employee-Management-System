import { prisma } from '@/lib/db';
import { getTodayDateString } from '@/lib/utils/date';

export const reportService = {
  async getDashboardMetrics() {
    const today = getTodayDateString();

    const [
      totalEmployees,
      activeEmployees,
      departmentsCount,
      todayAttendance,
      pendingLeaves,
      recentEmployees,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.department.count({ where: { isActive: true } }),
      prisma.attendance.findMany({
        where: { workDate: today },
      }),
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      prisma.employee.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { department: true, position: true },
      }),
    ]);

    const presentCount = todayAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    const lateCount = todayAttendance.filter((a) => a.status === 'LATE').length;
    const onLeaveCount = todayAttendance.filter((a) => a.status === 'ON_LEAVE').length;
    const absentCount = Math.max(0, activeEmployees - presentCount - onLeaveCount);

    return {
      totalEmployees,
      activeEmployees,
      departmentsCount,
      pendingLeaves,
      attendance: {
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        onLeave: onLeaveCount,
        attendanceRate: activeEmployees > 0 ? Math.round((presentCount / activeEmployees) * 100) : 0,
      },
      recentEmployees,
    };
  },

  async getDepartmentStats() {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return departments.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      employeeCount: d._count.employees,
    }));
  },
};

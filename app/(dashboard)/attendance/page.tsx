import { prisma } from '@/lib/db';
import { getTodayDateString } from '@/lib/utils/date';
import { getSession } from '@/lib/auth/session';
import { AttendanceClient } from './AttendanceClient';

export const metadata = {
  title: 'Attendance',
};

export default async function AttendancePage() {
  const today = getTodayDateString();
  const session = await getSession();

  const [todayAttendance, attendanceList, departments, employees] = await Promise.all([
    session?.employeeId
      ? prisma.attendance.findUnique({
          where: { employeeId_workDate: { employeeId: session.employeeId, workDate: today } },
        })
      : null,
    prisma.attendance.findMany({
      where: { workDate: today },
      include: {
        employee: {
          include: { department: true, position: true },
        },
      },
      orderBy: [{ firstInAt: 'desc' }, { employee: { firstName: 'asc' } }],
    }),
    prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    }),
    prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true, employeeCode: true },
      orderBy: { firstName: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Attendance & Time Tracking
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Daily biometric punch logs, shift punctuality, and manual time corrections
        </p>
      </div>

      <AttendanceClient
        initialToday={todayAttendance}
        initialList={attendanceList as any}
        departments={departments}
        employees={employees}
        todayDate={today}
      />
    </div>
  );
}

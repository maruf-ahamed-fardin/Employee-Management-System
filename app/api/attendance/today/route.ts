import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { attendanceService } from '@/server/services/attendance.service';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    let employeeId = session?.employeeId;

    if (!employeeId && session?.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.id },
        select: { employeeId: true },
      });
      employeeId = dbUser?.employeeId || undefined;
    }

    if (!employeeId) {
      const firstEmp = await prisma.employee.findFirst({ select: { id: true } });
      employeeId = firstEmp?.id;
    }

    if (!employeeId) {
      return successResponse({
        attendance: null,
        employeeId: null,
        isCheckedIn: false,
        isCheckedOut: false,
      });
    }

    const attendance = await attendanceService.getTodayAttendance(employeeId);
    const isCheckedIn = Boolean(attendance?.firstInAt && !attendance?.lastOutAt);
    const isCheckedOut = Boolean(attendance?.firstInAt && attendance?.lastOutAt);

    return successResponse({
      attendance,
      employeeId,
      isCheckedIn,
      isCheckedOut,
      firstInAt: attendance?.firstInAt || null,
      lastOutAt: attendance?.lastOutAt || null,
      workedMinutes: attendance?.workedMinutes || 0,
      status: attendance?.status || null,
    });
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch today attendance', 500);
  }
}

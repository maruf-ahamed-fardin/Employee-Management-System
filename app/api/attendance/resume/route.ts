import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { attendanceService } from '@/server/services/attendance.service';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
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
      return errorResponse('No employee profile found to resume shift', 400);
    }

    const attendance = await attendanceService.resumeShift(employeeId);

    return successResponse(
      {
        attendance,
        employeeId,
        isCheckedIn: true,
        isCheckedOut: false,
      },
      'Shift resumed successfully! Welcome back to work.'
    );
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to resume shift', 500);
  }
}

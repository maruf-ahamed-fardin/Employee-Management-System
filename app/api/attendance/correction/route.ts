import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();

    const { employeeId, attendanceId, workDate, status, firstInAt, lastOutAt, note } = body;

    if (!employeeId && !attendanceId) {
      return errorResponse('Employee or Attendance ID required', 400);
    }

    let existing = null;
    if (attendanceId) {
      existing = await prisma.attendance.findUnique({ where: { id: attendanceId } });
    } else if (employeeId && workDate) {
      existing = await prisma.attendance.findUnique({
        where: { employeeId_workDate: { employeeId, workDate } },
      });
    }

    let workedMinutes = 0;
    if (firstInAt && lastOutAt) {
      const inTime = new Date(firstInAt).getTime();
      const outTime = new Date(lastOutAt).getTime();
      if (!isNaN(inTime) && !isNaN(outTime) && outTime > inTime) {
        workedMinutes = Math.floor((outTime - inTime) / (1000 * 60));
      }
    }

    let result;
    if (existing) {
      result = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status: status || existing.status,
          firstInAt: firstInAt !== undefined ? firstInAt : existing.firstInAt,
          lastOutAt: lastOutAt !== undefined ? lastOutAt : existing.lastOutAt,
          workedMinutes: workedMinutes || existing.workedMinutes,
          note: note !== undefined ? note : existing.note,
        },
      });

      await recordAuditLog({
        userId: session?.id,
        action: 'UPDATE',
        entityType: 'ATTENDANCE',
        entityId: existing.id,
        changes: {
          before: existing,
          after: result,
          reason: note || 'Manual attendance correction by admin/HR',
        },
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
      });
    } else {
      if (!employeeId || !workDate) {
        return errorResponse('Both employeeId and workDate are required to create a new attendance record', 400);
      }

      result = await prisma.attendance.create({
        data: {
          employeeId,
          workDate,
          status: status || 'PRESENT',
          firstInAt: firstInAt || null,
          lastOutAt: lastOutAt || null,
          workedMinutes,
          note: note || 'Manually logged by HR',
        },
      });

      await recordAuditLog({
        userId: session?.id,
        action: 'CREATE',
        entityType: 'ATTENDANCE',
        entityId: result.id,
        changes: {
          after: result,
          reason: note || 'Manual attendance log created',
        },
        ipAddress: req.headers.get('x-forwarded-for') || undefined,
      });
    }

    return successResponse(result, 'Attendance record updated successfully');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to update attendance', 400);
  }
}

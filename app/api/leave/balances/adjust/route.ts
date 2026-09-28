import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { balanceId, employeeId, leaveTypeId, adjustmentDays, reason } = body;

    const currentYear = new Date().getFullYear();

    let balance = null;
    if (balanceId) {
      balance = await prisma.leaveBalance.findUnique({
        where: { id: balanceId },
        include: { leaveType: true, employee: true },
      });
    } else if (employeeId && leaveTypeId) {
      balance = await prisma.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId,
            leaveTypeId,
            year: currentYear,
          },
        },
        include: { leaveType: true, employee: true },
      });
    }

    if (!balance) {
      return errorResponse('Leave balance record not found', 404);
    }

    const adj = Number(adjustmentDays);
    if (isNaN(adj) || adj === 0) {
      return errorResponse('Valid non-zero adjustment days required', 400);
    }

    const previousAllocated = balance.allocated;
    const newAllocated = Math.max(0, previousAllocated + adj);

    const updated = await prisma.leaveBalance.update({
      where: { id: balance.id },
      data: {
        allocated: newAllocated,
      },
    });

    await recordAuditLog({
      userId: session?.id,
      action: 'UPDATE',
      entityType: 'LEAVE_BALANCE',
      entityId: balance.id,
      changes: {
        before: { allocated: previousAllocated },
        after: { allocated: newAllocated },
        adjustmentDays: adj,
        reason: reason || 'Manual balance adjustment by HR',
      },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    });

    return successResponse(
      updated,
      `Leave balance adjusted by ${adj > 0 ? `+${adj}` : adj} days`
    );
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to adjust leave balance', 400);
  }
}

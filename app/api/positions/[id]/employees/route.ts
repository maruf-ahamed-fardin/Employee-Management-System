import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { canManagePositions } from '@/lib/auth/positions';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);
    if (!canManagePositions(session.role)) return errorResponse('You do not have permission to view position staff', 403);

    const { id } = await params;

    const employees = await prisma.employee.findMany({
      where: { positionId: id },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        email: true,
        photoUrl: true,
        status: true,
        joiningDate: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });

    return successResponse(employees);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch position staff', 500);
  }
}

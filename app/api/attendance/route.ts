import { NextRequest } from 'next/server';
import { successResponse, errorResponse, parsePagination } from '@/lib/api/response';
import { attendanceService } from '@/server/services/attendance.service';
import { punchSchema } from '@/lib/validations/attendance';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { buildPaginationMeta } from '@/lib/utils/pagination';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePagination(searchParams);
    const workDate = searchParams.get('workDate') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;
    const status = searchParams.get('status') || undefined;
    const employeeId = searchParams.get('employeeId') || undefined;

    const { items, total } = await attendanceService.getAttendanceList({
      workDate,
      departmentId,
      status,
      employeeId,
      page,
      limit,
    });

    const meta = buildPaginationMeta(page, limit, total);
    return successResponse({ items }, undefined, meta);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch attendance', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const validated = punchSchema.parse(body);

    let employeeId = validated.employeeId || session?.employeeId;

    if (!employeeId && session?.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.id },
        select: { employeeId: true },
      });
      employeeId = dbUser?.employeeId || undefined;
    }

    if (!employeeId) {
      // Find default employee or first employee
      const firstEmp = await prisma.employee.findFirst({ select: { id: true } });
      if (!firstEmp) return errorResponse('No employee found for check in', 400);
      employeeId = firstEmp.id;
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const result = await attendanceService.punch(employeeId, validated, ip);

    return successResponse(result, 'Punch recorded successfully', undefined, 201);
  } catch (err: any) {
    return errorResponse(err?.errors?.[0]?.message || err?.message || 'Failed to punch', 400);
  }
}

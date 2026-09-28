import { NextRequest } from 'next/server';
import { successResponse, errorResponse, parsePagination } from '@/lib/api/response';
import { leaveService } from '@/server/services/leave.service';
import { leaveRequestSchema } from '@/lib/validations/leave';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { buildPaginationMeta } from '@/lib/utils/pagination';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode'); // 'types', 'balances', or 'requests' (default)

    if (mode === 'types') {
      const types = await leaveService.getLeaveTypes();
      return successResponse(types);
    }

    const session = await getSession();
    const employeeId = searchParams.get('employeeId') || session?.employeeId;

    if (mode === 'balances' && employeeId) {
      const balances = await leaveService.getBalances(employeeId);
      return successResponse(balances);
    }

    const { page, limit } = parsePagination(searchParams);
    const status = searchParams.get('status') || undefined;

    const { items, total } = await leaveService.getRequests({
      employeeId: searchParams.get('employeeId') || undefined,
      status,
      page,
      limit,
    });

    const meta = buildPaginationMeta(page, limit, total);
    return successResponse({ items }, undefined, meta);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch leave data', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();

    // Check if reviewing an existing request
    if (body.requestId && body.status) {
      const reviewerId = session?.id || 'admin';
      const updated = await leaveService.reviewRequest(body.requestId, reviewerId, {
        status: body.status,
        reviewNote: body.reviewNote,
      });
      return successResponse(updated, `Leave request ${body.status.toLowerCase()}`);
    }

    // Otherwise, create new request
    const validated = leaveRequestSchema.parse(body);

    let employeeId = session?.employeeId;
    if (!employeeId) {
      const firstEmp = await prisma.employee.findFirst();
      if (!firstEmp) return errorResponse('No employee found', 400);
      employeeId = firstEmp.id;
    }

    const request = await leaveService.requestLeave(employeeId, validated);
    return successResponse(request, 'Leave request submitted successfully', undefined, 201);
  } catch (err: any) {
    return errorResponse(err?.errors?.[0]?.message || err?.message || 'Failed to process leave', 400);
  }
}

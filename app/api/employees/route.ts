import { NextRequest } from 'next/server';
import { successResponse, errorResponse, parsePagination } from '@/lib/api/response';
import { employeeService } from '@/server/services/employee.service';
import { employeeCreateSchema } from '@/lib/validations/employee';
import { buildPaginationMeta } from '@/lib/utils/pagination';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, search } = parsePagination(searchParams);
    const departmentId = searchParams.get('departmentId') || undefined;
    const status = searchParams.get('status') || undefined;

    const { items, total } = await employeeService.getEmployees({
      search,
      departmentId,
      status,
      page,
      limit,
    });

    const meta = buildPaginationMeta(page, limit, total);
    return successResponse({ items }, undefined, meta);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch employees', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = employeeCreateSchema.parse(body);

    const employee = await employeeService.createEmployee(validated);
    return successResponse(employee, 'Employee created successfully', undefined, 201);
  } catch (err: any) {
    return errorResponse(err?.errors?.[0]?.message || err?.message || 'Failed to create employee', 400);
  }
}

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { employeeService } from '@/server/services/employee.service';
import { employeeUpdateSchema } from '@/lib/validations/employee';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const employee = await employeeService.getEmployeeById(employeeId);
    return successResponse(employee);
  } catch (err: any) {
    return errorResponse(err?.message || 'Employee not found', 404);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const body = await req.json();
    const validated = employeeUpdateSchema.parse(body);

    const updated = await employeeService.updateEmployee(employeeId, validated);
    return successResponse(updated, 'Employee updated successfully');
  } catch (err: any) {
    return errorResponse(err?.errors?.[0]?.message || err?.message || 'Failed to update employee', 400);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    await employeeService.deleteEmployee(employeeId);
    return successResponse({ id: employeeId }, 'Employee deleted successfully');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to delete employee', 400);
  }
}

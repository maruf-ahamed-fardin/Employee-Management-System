import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { payrollService } from '@/server/services/payroll.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined;
    const status = searchParams.get('status') || undefined;

    const data = await payrollService.getPayrollRecords({
      month,
      year,
      status,
    });

    return successResponse(data);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch payroll', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mark as paid
    if (body.action === 'mark_paid' && body.payrollId) {
      const updated = await payrollService.markAsPaid(body.payrollId, body.paymentMethod);
      return successResponse(updated, 'Payroll marked as paid');
    }

    // Generate monthly payroll
    const month = body.month || new Date().getMonth() + 1;
    const year = body.year || new Date().getFullYear();

    const created = await payrollService.generateMonthlyPayroll(month, year);
    return successResponse(created, `Payroll for ${month}/${year} generated`, undefined, 201);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to process payroll', 400);
  }
}

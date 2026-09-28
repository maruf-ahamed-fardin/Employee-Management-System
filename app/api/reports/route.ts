import { successResponse, errorResponse } from '@/lib/api/response';
import { reportService } from '@/server/services/report.service';

export async function GET() {
  try {
    const [metrics, departmentStats] = await Promise.all([
      reportService.getDashboardMetrics(),
      reportService.getDepartmentStats(),
    ]);

    return successResponse({
      metrics,
      departmentStats,
    });
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch reports', 500);
  }
}

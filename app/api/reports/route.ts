import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { canViewReports } from '@/lib/auth/reports';
import { reportService } from '@/server/services/report.service';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);
    if (!canViewReports(session.role)) return errorResponse('You do not have permission to view reports', 403);

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

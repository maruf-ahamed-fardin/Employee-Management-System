import { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { canExportReports } from '@/lib/auth/reports';
import { createAuditLog } from '@/lib/audit';
import { REPORT_TYPES, buildReport, reportToCsv, resolveRange, type ReportType } from '@/server/services/report-builder.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);
    if (!canExportReports(session.role)) return errorResponse('You do not have permission to export reports', 403);

    const { searchParams } = new URL(req.url);
    const requested = searchParams.get('report');
    if (!REPORT_TYPES.includes(requested as ReportType)) return errorResponse('Unknown report type', 400);
    const type = requested as ReportType;

    const { from, to } = resolveRange(type, {
      range: searchParams.get('range'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
    });
    const departmentId = searchParams.get('dept') || null;

    const report = await buildReport(type, { from, to, departmentId });
    const filename = report.usesDateRange ? `selorax-${type}-${from}-to-${to}.csv` : `selorax-${type}-${to}.csv`;

    await createAuditLog({
      actorUserId: session.id,
      action: 'report.export',
      entityType: 'report',
      entityId: type,
      after: { from, to, departmentId, rows: report.table.rows.length },
    });

    return new Response(reportToCsv(report), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to export report', 500);
  }
}

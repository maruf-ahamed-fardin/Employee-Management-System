import { ShieldAlert } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { canExportReports, canViewReports } from '@/lib/auth/reports';
import { ReportsClient } from '@/components/reports/ReportsClient';
import { REPORT_TYPES, buildReport, resolveRange, type ReportType } from '@/server/services/report-builder.service';

export const metadata = {
  title: 'Reports & Analytics',
  description: 'Organizational workforce reports and analytics.',
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ report?: string; range?: string; from?: string; to?: string; dept?: string }>;
}) {
  const [raw, session] = await Promise.all([searchParams, getSession()]);

  if (!canViewReports(session?.role)) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ShieldAlert className="size-5" />
        </div>
        <p className="text-sm font-semibold text-foreground">You don&apos;t have access to reports</p>
        <p className="text-xs text-muted-foreground">Ask an administrator if you need workforce reports.</p>
      </div>
    );
  }

  const type: ReportType = REPORT_TYPES.includes(raw.report as ReportType) ? (raw.report as ReportType) : 'headcount';
  const { preset, from, to } = resolveRange(type, raw);

  const departments = await prisma.department.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
  const departmentId = departments.some((d) => d.id === raw.dept) ? raw.dept! : '';

  const report = await buildReport(type, { from, to, departmentId: departmentId || null });

  return (
    <ReportsClient
      key={`${type}-${from}-${to}`}
      report={report}
      filters={{ type, preset, from, to, departmentId, rangeExplicit: !!raw.range }}
      departments={departments}
      canExport={canExportReports(session?.role)}
    />
  );
}

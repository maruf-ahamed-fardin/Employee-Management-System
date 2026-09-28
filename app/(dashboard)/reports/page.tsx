import { reportService } from '@/server/services/report.service';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, BarChart3, Users, Clock, Calendar, TrendingUp, Building2 } from 'lucide-react';

const REPORT_TYPES = [
  { key: 'headcount', label: 'Headcount', icon: Users, description: 'Employee count by department & status' },
  { key: 'attendance', label: 'Attendance', icon: Clock, description: 'Daily attendance logs and summaries' },
  { key: 'leave', label: 'Leave', icon: Calendar, description: 'Leave requests, balances, and utilization' },
  { key: 'turnover', label: 'Turnover', icon: TrendingUp, description: 'Hiring and attrition trends over time' },
];

export const metadata = {
  title: 'Reports & Analytics',
  description: 'Organizational workforce reports and analytics.',
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ report?: string }>;
}) {
  const raw = await searchParams;
  const activeReport = raw.report ?? 'headcount';

  const [metrics, departmentStats] = await Promise.all([
    reportService.getDashboardMetrics(),
    reportService.getDepartmentStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#252175]/10 dark:bg-[#252175]/30">
            <BarChart3 className="size-6 text-[#252175] dark:text-[#F37021]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#252175] dark:text-white">
              Organizational Reports &amp; Exports
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Aggregated workforce distribution, attendance logs, and compensation summaries
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/api/reports?format=csv" download="selora-report.csv">
              <FileSpreadsheet className="size-3.5 mr-1" />
              Export CSV
            </a>
          </Button>
          <Button size="sm" asChild>
            <a href="/api/reports?format=xlsx" download="selora-report.xlsx">
              <Download className="size-3.5 mr-1" />
              Download Summary
            </a>
          </Button>
        </div>
      </div>

      {/* Report Type Navigation */}
      <nav aria-label="Report types" className="flex flex-wrap gap-2">
        {REPORT_TYPES.map((r) => {
          const Icon = r.icon;
          const isActive = activeReport === r.key;
          return (
            <Link
              key={r.key}
              href={`/reports?report=${r.key}`}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex items-center gap-2 h-9 rounded-full border px-3.5 text-sm font-medium transition-colors hover:bg-secondary ${
                isActive
                  ? 'border-[#252175]/30 bg-[#252175]/10 text-[#252175] dark:text-[#F37021] dark:bg-[#252175]/20'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="size-3.5" aria-hidden />
              {r.label}
            </Link>
          );
        })}
      </nav>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: metrics.totalEmployees, icon: Users, color: 'text-[#252175]' },
          { label: 'Active Employees', value: metrics.activeEmployees, icon: Building2, color: 'text-emerald-600' },
          { label: 'Departments', value: departmentStats.length, icon: BarChart3, color: 'text-violet-600' },
          { label: 'Pending Leaves', value: metrics.pendingLeaves, icon: Calendar, color: 'text-amber-600' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="rounded-2xl shadow-sm">
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{kpi.label}</p>
                  <Icon className={`size-4 ${kpi.color}`} aria-hidden />
                </div>
                <p className={`text-3xl font-black tabular-nums ${kpi.color}`}>{kpi.value.toLocaleString('en-US')}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Department Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Staff Distribution by Department</CardTitle>
            <CardDescription>Headcount allocation across corporate divisions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {departmentStats.map((dep) => {
              const total = metrics.totalEmployees || 1;
              const percent = Math.round((dep.employeeCount / total) * 100);

              return (
                <div key={dep.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{dep.name}</span>
                    <span className="text-slate-500">{dep.employeeCount} ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#252175] to-[#f37021] dark:from-[#4f46e5] dark:to-[#f37021] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workforce Operational KPIs</CardTitle>
            <CardDescription>Punctuality, active quotas, and attendance ratios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Average Punctuality</span>
              <span className="text-sm font-extrabold text-emerald-600">92.4%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Leave Utilization</span>
              <span className="text-sm font-extrabold text-indigo-600">34.8%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Active Contracts</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{metrics.activeEmployees}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pending Actions</span>
              <span className="text-sm font-extrabold text-amber-600">{metrics.pendingLeaves} Leaves</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports Grid */}
      <div>
        <h2 className="text-base font-semibold mb-3">Available Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORT_TYPES.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.key}
                href={`/reports?report=${r.key}`}
                className="group rounded-2xl border bg-card p-5 shadow-sm hover:border-[#252175]/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-[#252175]/10 group-hover:bg-[#252175]/20 transition-colors">
                    <Icon className="size-5 text-[#252175] dark:text-[#F37021]" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-sm">{r.label} Report</h3>
                </div>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

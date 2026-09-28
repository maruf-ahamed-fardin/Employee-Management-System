import { reportService } from '@/server/services/report.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText, PieChart } from 'lucide-react';

export const metadata = {
  title: 'Reports & Analytics',
};

export default async function ReportsPage() {
  const [metrics, departmentStats] = await Promise.all([
    reportService.getDashboardMetrics(),
    reportService.getDepartmentStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Organizational Reports & Exports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aggregated workforce distribution, attendance logs, and compensation summaries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}>
            <FileSpreadsheet className="size-3.5 mr-1" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => {}}>
            <Download className="size-3.5 mr-1" />
            Download Summary
          </Button>
        </div>
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
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Presence & Compliance KPIs */}
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
    </div>
  );
}

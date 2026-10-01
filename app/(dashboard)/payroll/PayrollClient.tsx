'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Avatar } from '@/components/ui/avatar';
import { PayslipDialog } from '@/components/payroll/PayslipDialog';
import { formatCurrency } from '@/lib/utils/date';
import { DollarSign, CheckCircle2, Clock, Users, Play, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function PayrollClient({
  initialData,
  currentMonth,
  currentYear,
}: {
  initialData: any;
  currentMonth: number;
  currentYear: number;
}) {
  const [records, setRecords] = useState<any[]>(initialData?.records || []);
  const [summary, setSummary] = useState(initialData?.summary || {});
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [generating, setGenerating] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const fetchPayroll = async (m: number, y: number) => {
    try {
      const res = await fetch(`/api/payroll?month=${m}&year=${y}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.records || []);
        setSummary(data.data.summary || {});
      }
    } catch {}
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Payroll generated for ${month}/${year}`);
        fetchPayroll(month, year);
      } else {
        toast.error(data.error || 'Failed to generate payroll');
      }
    } catch {
      toast.error('Network error generating payroll');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async (payrollId: string) => {
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_paid', payrollId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Salary disbursement marked as paid');
        fetchPayroll(month, year);
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-indigo-500/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Payroll</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatCurrency(summary.totalPayroll || 0)}
              </p>
            </div>
            <span className="p-3 rounded-2xl bg-primary/10 text-primary">
              <DollarSign className="size-6" />
            </span>
          </CardContent>
        </Card>

        <Card className="hover:border-indigo-500/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Paid Out</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(summary.paidAmount || 0)}
              </p>
            </div>
            <span className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-6" />
            </span>
          </CardContent>
        </Card>

        <Card className="hover:border-indigo-500/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Pending Approval</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(summary.pendingAmount || 0)}
              </p>
            </div>
            <span className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-6" />
            </span>
          </CardContent>
        </Card>

        <Card className="hover:border-indigo-500/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Headcount</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {summary.employeeCount || 0} Staff
              </p>
            </div>
            <span className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Users className="size-6" />
            </span>
          </CardContent>
        </Card>
      </div>

      {/* 2. Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => {
              const m = Number(e.target.value);
              setMonth(m);
              fetchPayroll(m, year);
            }}
            className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => {
              const y = Number(e.target.value);
              setYear(y);
              fetchPayroll(month, y);
            }}
            className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleGenerate} disabled={generating} size="sm">
          <Play className="size-3.5 mr-1" />
          {generating ? 'Processing...' : 'Run Monthly Payroll'}
        </Button>
      </div>

      {/* 3. Payroll Records Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Basic Salary</TableHead>
              <TableHead>Allowances</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                  No payroll generated for {month}/{year}. Click &quot;Run Monthly Payroll&quot; above.
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => {
                const fullName = `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`;
                const initials = `${r.employee?.firstName?.[0] || ''}${r.employee?.lastName?.[0] || ''}`;

                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar initials={initials || 'EM'} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">
                            {fullName || 'Staff Member'}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">
                            {r.employee?.employeeCode}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      {r.employee?.department?.name || 'Engineering'}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {formatCurrency(r.basicSalary)}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-emerald-600">
                      +{formatCurrency(r.allowances)}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-rose-500">
                      -{formatCurrency(r.deductions)}
                    </TableCell>
                    <TableCell className="text-xs font-extrabold text-primary">
                      {formatCurrency(r.netSalary)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'PAID' ? 'success' : 'warning'}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecord(r)}
                          className="h-7 text-xs font-semibold gap-1 text-primary border-primary/20 hover:bg-primary/10"
                        >
                          <Eye className="size-3" />
                          <span>Payslip</span>
                        </Button>
                        {r.status !== 'PAID' && (
                          <Button size="sm" variant="default" onClick={() => handleMarkPaid(r.id)} className="h-7 text-xs font-semibold">
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Payslip Modal */}
      <PayslipDialog
        open={Boolean(selectedRecord)}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
        record={selectedRecord}
      />
    </div>
  );
}

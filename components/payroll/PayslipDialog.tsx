'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils/date';
import { Download, Printer, CheckCircle } from 'lucide-react';

export function PayslipDialog({
  open,
  onOpenChange,
  record,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: any;
}) {
  if (!record) return null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthStr = monthNames[record.month - 1] || 'Current Month';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Salary Payslip</DialogTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                {monthStr} {record.year} Pay Period
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
              <CheckCircle className="size-3" />
              {record.status}
            </span>
          </div>
        </DialogHeader>

        {/* Printable Payslip Body */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                {record.employee?.firstName} {record.employee?.lastName}
              </p>
              <p className="text-slate-400 font-mono text-[11px]">{record.employee?.employeeCode}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-700 dark:text-slate-300">{record.employee?.department?.name || 'Engineering'}</p>
              <p className="text-slate-400">{record.employee?.position?.title || 'Staff'}</p>
            </div>
          </div>

          {/* Earnings & Deductions breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="font-bold text-slate-900 dark:text-white border-b pb-1">Earnings</p>
              <div className="flex justify-between">
                <span className="text-slate-500">Basic Salary</span>
                <span className="font-semibold">{formatCurrency(record.basicSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Allowances (Med/Trans)</span>
                <span className="font-semibold text-emerald-600">+{formatCurrency(record.allowances)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-900 dark:text-white border-b pb-1">Deductions</p>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax / Provident Fund</span>
                <span className="font-semibold text-rose-500">-{formatCurrency(record.deductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Salary Summary */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm">
            <span className="font-extrabold text-slate-900 dark:text-white">Net Take-Home Pay</span>
            <span className="font-extrabold text-xl text-primary">
              {formatCurrency(record.netSalary)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-3.5 mr-1" />
            Print
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { payrollService } from '@/server/services/payroll.service';
import { PayrollClient } from './PayrollClient';

export const metadata = {
  title: 'Payroll',
};

export default async function PayrollPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const data = await payrollService.getPayrollRecords({
    month: currentMonth,
    year: currentYear,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Payroll & Compensation
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage salary disbursements, allowances, deductions, and downloadable payslips
        </p>
      </div>

      <PayrollClient
        initialData={data}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </div>
  );
}

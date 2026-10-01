import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { ExpensesClient } from './ExpensesClient';

export const metadata = {
  title: 'Expense & Reimbursement Claims',
};

export default async function ExpensesPage() {
  const session = await getSession();

  const [employees, allExpenses, rawItems] = await Promise.all([
    prisma.employee.findMany({
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { firstName: 'asc' },
    }),
    prisma.$queryRawUnsafe<any[]>(`SELECT status, amount FROM ExpenseClaim`),
    prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        e.*,
        emp.employeeCode,
        emp.firstName,
        emp.lastName,
        emp.email,
        dept.name as departmentName
      FROM ExpenseClaim e
      JOIN Employee emp ON e.employeeId = emp.id
      LEFT JOIN Department dept ON emp.departmentId = dept.id
      ORDER BY e.createdAt DESC
    `),
  ]);

  const summary = (allExpenses || []).reduce(
    (acc, curr) => {
      acc.total += curr.amount || 0;
      if (curr.status === 'PENDING') acc.pending += curr.amount || 0;
      if (curr.status === 'APPROVED') acc.approved += curr.amount || 0;
      if (curr.status === 'PAID') acc.paid += curr.amount || 0;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, paid: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Expense Claims & Reimbursements
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Submit out-of-pocket business expenses, review receipts, and disburse payroll refunds
        </p>
      </div>

      <ExpensesClient
        initialItems={rawItems || []}
        initialSummary={summary}
        employees={employees}
        userRole={session?.role || 'employee'}
      />
    </div>
  );
}

import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Edit Employee',
};

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;

  const [employee, departments, positions, managers] = await Promise.all([
    prisma.employee.findFirst({
      where: {
        OR: [{ id: employeeId }, { employeeCode: employeeId }],
      },
    }),
    prisma.department.findMany({ where: { isActive: true }, select: { id: true, name: true } }),
    prisma.position.findMany({ where: { isActive: true }, select: { id: true, title: true, departmentId: true } }),
    prisma.employee.findMany({ where: { status: 'ACTIVE', id: { not: employeeId } }, select: { id: true, firstName: true, lastName: true } }),
  ]);

  if (!employee) notFound();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href={`/employees/${employeeId}`}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Edit Employee: {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Modify profile, salary, department or contact details
          </p>
        </div>
      </div>

      <EmployeeForm
        initialData={employee}
        departments={departments}
        positions={positions}
        managers={managers}
        isEdit
      />
    </div>
  );
}

import { prisma } from '@/lib/db';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Add New Employee',
};

export default async function NewEmployeePage() {
  const [departments, positions, managers] = await Promise.all([
    prisma.department.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.position.findMany({ where: { isActive: true }, select: { id: true, title: true, departmentId: true }, orderBy: { title: 'asc' } }),
    prisma.employee.findMany({ where: { status: 'ACTIVE' }, select: { id: true, firstName: true, lastName: true }, orderBy: { firstName: 'asc' } }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/employees"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Onboard New Employee
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fill in employee details to create employment records and digital ID card
          </p>
        </div>
      </div>

      <EmployeeForm
        departments={departments}
        positions={positions}
        managers={managers}
      />
    </div>
  );
}

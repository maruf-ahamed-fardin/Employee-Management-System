import { prisma } from '@/lib/db';
import { DepartmentsClient } from './DepartmentsClient';
import { Building2 } from 'lucide-react';

export const metadata = {
  title: 'Departments',
  description: 'Manage organizational departments, positions, and headcount for SeloraX EMS.',
};

export default async function DepartmentsPage() {
  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: { employees: true, positions: true },
      },
      head: {
        include: { position: true },
      },
    },
    orderBy: { name: 'asc' },
  });


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Departments
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage organizational units, division codes, and team allocations
        </p>
      </div>

      <DepartmentsClient initialDepartments={departments as any} />
    </div>
  );
}

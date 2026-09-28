import { prisma } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { EmployeeDirectoryClient } from './EmployeeDirectoryClient';

export const metadata = {
  title: 'Employees Directory',
};

export default async function EmployeesPage() {
  const [employees, departments] = await Promise.all([
    prisma.employee.findMany({
      include: {
        department: true,
        position: true,
        manager: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    }),
    prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Employee Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse staff profiles, digital cards, contact numbers, and corporate hierarchy
          </p>
        </div>
        <Link href="/employees/new">
          <Button size="sm">
            <UserPlus className="size-3.5 mr-1" />
            Add New Employee
          </Button>
        </Link>
      </div>

      {/* Interactive Directory Client (Search, Filters, Grid/Table Switch) */}
      <EmployeeDirectoryClient
        initialEmployees={employees as any}
        departments={departments}
      />
    </div>
  );
}

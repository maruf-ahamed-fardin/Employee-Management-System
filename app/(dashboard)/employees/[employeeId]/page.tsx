import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { EmployeeProfile } from '@/components/employees/EmployeeProfile';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { id: employeeId },
        { employeeCode: employeeId },
      ],
    },
    select: { firstName: true, lastName: true },
  });

  return {
    title: employee ? `${employee.firstName} ${employee.lastName}` : 'Employee Profile',
  };
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;

  const employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { id: employeeId },
        { employeeCode: employeeId },
      ],
    },
    include: {
      department: true,
      position: true,
      manager: true,
      tasks: {
        orderBy: { createdAt: 'desc' },
      },
      directReports: {
        include: { position: true },
      },
    },
  });

  if (!employee) notFound();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2"
        >
          <ArrowLeft className="size-3.5" />
          Back to Directory
        </Link>
      </div>

      <EmployeeProfile employee={employee} />
    </div>
  );
}

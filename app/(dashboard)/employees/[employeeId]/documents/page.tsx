import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { EmployeeDocuments } from '@/components/employees/EmployeeDocuments';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EmployeeDocumentsPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;

  const [employee, documents] = await Promise.all([
    prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, firstName: true, lastName: true },
    }),
    prisma.document.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!employee) notFound();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        href={`/employees/${employeeId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="size-3.5" />
        Back to {employee.firstName}’s Profile
      </Link>

      <EmployeeDocuments employeeId={employeeId} initialDocuments={documents} />
    </div>
  );
}

import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { canAccessEmployeeDocuments, canManageDocuments } from '@/lib/auth/documents';
import { documentService } from '@/server/services/document.service';
import { EmployeeDocuments } from '@/components/employees/EmployeeDocuments';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EmployeeDocumentsPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;

  const session = await getSession();
  if (!session) redirect('/login');
  // Same response as a missing employee, so ids can't be probed
  if (!canAccessEmployeeDocuments(session, employeeId)) notFound();

  const [employee, documents, documentTypes] = await Promise.all([
    prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, firstName: true, lastName: true, employeeCode: true },
    }),
    documentService.list({ employeeId }),
    prisma.documentType.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, code: true, isSensitive: true },
      orderBy: { name: 'asc' },
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

      <EmployeeDocuments
        employee={employee}
        initialDocuments={documents}
        documentTypes={documentTypes}
        canManage={canManageDocuments(session.role)}
      />
    </div>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FolderLock, Layers, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { canManageDocuments, documentScope } from '@/lib/auth/documents';
import { documentService } from '@/server/services/document.service';
import { Button } from '@/components/ui/button';
import { UploadDocumentModal } from '@/components/documents/UploadDocumentModal';
import { DocumentTable } from '@/components/documents/DocumentTable';

export const metadata = {
  title: 'Document Repository',
  description: 'Manage contracts, employee identification records, certifications, and compliance documents.',
};

export default async function DocumentsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const canManage = canManageDocuments(session.role);

  const [documents, documentTypes, employees] = await Promise.all([
    documentService.list(documentScope(session)),
    prisma.documentType.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, code: true, isSensitive: true },
      orderBy: { name: 'asc' },
    }),
    // Admins can file a document against anyone; everyone else only against themselves
    prisma.employee.findMany({
      where: canManage ? { status: 'ACTIVE' } : { id: session.employeeId || '__none__' },
      select: { id: true, firstName: true, lastName: true, employeeCode: true },
      orderBy: { firstName: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Hero header */}
      <div className="relative isolate rounded-3xl border bg-card shadow-[var(--shadow-card)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute inset-x-0 top-0 h-1" style={{ background: 'var(--brand-gradient)' }} />
          <div className="absolute -right-20 -top-28 size-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 size-64 rounded-full bg-brand-orange/10 blur-3xl" />
        </div>

        <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-blue">
              <FolderLock className="size-3" />
              Secure vault
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {canManage ? 'Document Repository' : 'My Documents'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {canManage
                ? 'Employee credentials, employment agreements and compliance records in one place.'
                : 'Your contracts, identity documents and certificates.'}
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              {canManage ? 'You can see every employee’s documents' : 'Only you and HR can see these files'}
            </p>
          </div>

          <div className={`grid shrink-0 gap-2 sm:flex ${canManage ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {canManage && (
              <Button variant="outline" asChild className="gap-2 bg-background/70 backdrop-blur">
                <Link href="/documents/types">
                  <Layers className="size-4" />
                  Classifications
                </Link>
              </Button>
            )}
            {employees.length > 0 && <UploadDocumentModal employees={employees} documentTypes={documentTypes} />}
          </div>
        </div>
      </div>

      <DocumentTable initialDocuments={documents} documentTypes={documentTypes} canManage={canManage} />
    </div>
  );
}

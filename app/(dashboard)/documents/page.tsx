import { prisma } from '@/lib/db';
import Link from 'next/link';
import { FileText, Layers, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadDocumentModal } from '@/components/documents/UploadDocumentModal';
import { DocumentTable } from '@/components/documents/DocumentTable';

export const metadata = {
  title: 'Document Repository',
  description: 'Manage contracts, employee identification records, certifications, and compliance documents.',
};

export default async function DocumentsPage() {
  const [documents, documentTypes, employees] = await Promise.all([
    prisma.document.findMany({
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true },
        },
        documentTypeRef: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.documentType.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    }),
    prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true, employeeCode: true },
      orderBy: { firstName: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#252175]/10 dark:bg-[#252175]/30">
              <FileText className="size-6 text-[#252175] dark:text-[#F37021]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#252175] dark:text-white">
                Document Repository
              </h1>
              <p className="text-sm text-muted-foreground">
                Centralized registry for employee credentials, employment agreements, and compliance records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/documents/types">
            <Button variant="outline" className="gap-2">
              <Layers className="size-4 text-[#F37021]" />
              Document Classifications
            </Button>
          </Link>
          <UploadDocumentModal
            employees={employees}
            documentTypes={documentTypes}
          />
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-card p-4 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-[#252175]/10 dark:bg-[#252175]/30 flex items-center justify-center text-[#252175] dark:text-[#F37021] font-bold text-xl">
            {documents.length}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Documents</p>
            <p className="text-sm font-medium text-foreground">Across all departments</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-xl">
            {
              documents.filter((d) => {
                if (!d.expiresAt) return false;
                const diff = (new Date(d.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 30;
              }).length
            }
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiring Soon</p>
            <p className="text-sm font-medium text-foreground">Within the next 30 days</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xl">
            <ShieldCheck className="size-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Security & Audit</p>
            <p className="text-sm font-medium text-foreground">Role-based access applied</p>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <DocumentTable initialDocuments={documents} />
    </div>
  );
}

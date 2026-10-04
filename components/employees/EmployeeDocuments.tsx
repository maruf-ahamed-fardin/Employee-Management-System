'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UploadDocumentModal } from '@/components/documents/UploadDocumentModal';
import { FileText, Trash2, Download, ShieldCheck, AlertCircle, FileWarning } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { toast } from 'sonner';
import { confirmDialog } from '@/components/ui/confirm';

export function EmployeeDocuments({
  employee,
  initialDocuments = [],
  documentTypes = [],
  canManage = false,
}: {
  employee: { id: string; firstName: string; lastName: string; employeeCode: string };
  initialDocuments: any[];
  documentTypes?: { id: string; name: string; code: string; isSensitive?: boolean }[];
  canManage?: boolean;
}) {
  const [documents, setDocuments] = useState<any[]>(initialDocuments);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete this document?',
      description: `"${title}" will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete Document',
      tone: 'danger',
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete document');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success('Document deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete document');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Employee Documents</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Contracts, IDs, certificates, and confidential compliance records
          </p>
        </div>
        <UploadDocumentModal
          size="sm"
          employees={[employee]}
          currentEmployeeId={employee.id}
          documentTypes={documentTypes}
          onUploaded={(doc) => setDocuments((prev) => [doc, ...prev])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.length === 0 ? (
          <Card className="col-span-full py-12 text-center text-slate-400">
            <FileText className="size-10 mx-auto opacity-40 mb-2" />
            <p className="text-sm font-semibold">No documents uploaded yet</p>
            <p className="text-xs mt-1">Upload official agreements, government IDs or passports</p>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="relative group hover:border-indigo-500/30 transition-all">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="p-2 rounded-xl bg-primary/10 text-brand-blue">
                      <FileText className="size-5" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      {doc.isSensitive && (
                        <Badge variant="destructive" className="text-[10px]">
                          <ShieldCheck className="size-2.5 mr-0.5" />
                          Confidential
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {doc.documentTypeRef?.name || doc.documentType}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3 line-clamp-1">
                    {doc.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Uploaded {formatDate(doc.createdAt)}
                  </p>
                  {doc.expiresAt && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      Expires: {formatDate(doc.expiresAt)}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {doc.hasFile ? (
                    <a
                      href={`/api/documents/${doc.id}/file?download=1`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-[#f37021] dark:hover:text-[#fb923c] hover:underline transition-colors"
                    >
                      <Download className="size-3" />
                      Download
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <FileWarning className="size-3" />
                      No file stored
                    </span>
                  )}
                  {canManage && (
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      aria-label={`Delete ${doc.title}`}
                      className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

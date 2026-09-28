'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Upload, Trash2, Download, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { toast } from 'sonner';

export function EmployeeDocuments({
  employeeId,
  initialDocuments = [],
}: {
  employeeId: string;
  initialDocuments: any[];
}) {
  const [documents, setDocuments] = useState<any[]>(initialDocuments);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newDoc, setNewDoc] = useState({
    title: '',
    documentType: 'CONTRACT',
    expiresAt: '',
    isSensitive: false,
    file: null as File | null,
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title) {
      toast.error('Document title is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          title: newDoc.title,
          documentType: newDoc.documentType,
          storageUrl: '/documents/demo.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 245000,
          expiresAt: newDoc.expiresAt || null,
          isSensitive: newDoc.isSensitive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDocuments([data.data, ...documents]);
        setUploadOpen(false);
        setNewDoc({ title: '', documentType: 'CONTRACT', expiresAt: '', isSensitive: false, file: null });
        toast.success('Document uploaded successfully!');
      } else {
        toast.error(data.error || 'Failed to upload document');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete ${title}?`)) return;
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDocuments(documents.filter((d) => d.id !== id));
        toast.success('Document deleted');
      }
    } catch {
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Employee Documents</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Contracts, IDs, certificates, and confidential compliance records
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)} size="sm">
          <Upload className="size-3.5 mr-1" />
          Upload Document
        </Button>
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
                    <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
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
                        {doc.documentType}
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
                  <a
                    href={doc.storageUrl}
                    download
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-[#f37021] dark:hover:text-[#fb923c] hover:underline transition-colors"
                  >
                    <Download className="size-3" />
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id, doc.title)}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
            <DialogDescription>Add official document to employee vault</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Document Title *</label>
              <Input
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                required
                className="mt-1"
                placeholder="e.g. Employment Contract 2026"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Document Type</label>
              <select
                value={newDoc.documentType}
                onChange={(e) => setNewDoc({ ...newDoc, documentType: e.target.value })}
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm"
              >
                <option value="CONTRACT">Employment Contract</option>
                <option value="NATIONAL_ID">National ID / NID</option>
                <option value="PASSPORT">Passport</option>
                <option value="CERTIFICATE">Degree / Certificate</option>
                <option value="OTHER">Other Document</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Expiration Date (Optional)</label>
              <Input
                type="date"
                value={newDoc.expiresAt}
                onChange={(e) => setNewDoc({ ...newDoc, expiresAt: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isSensitive"
                checked={newDoc.isSensitive}
                onChange={(e) => setNewDoc({ ...newDoc, isSensitive: e.target.checked })}
                className="size-4 rounded accent-primary"
              />
              <label htmlFor="isSensitive" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                Mark as confidential (restrict to HR & Admin)
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3">
              <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Uploading...' : 'Save Document'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

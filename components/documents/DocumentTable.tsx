'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download, Trash2, ShieldAlert, Clock, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';

export interface DocumentRow {
  id: string;
  title: string;
  documentType: string;
  storageUrl: string;
  mimeType: string;
  sizeBytes: number;
  expiresAt: string | null;
  isSensitive: boolean;
  createdAt: string | Date;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
  documentTypeRef?: {
    id: string;
    name: string;
  } | null;
}

interface Props {
  initialDocuments: DocumentRow[];
}

export function DocumentTable({ initialDocuments }: Props) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentRow[]>(initialDocuments);
  const [search, setSearch] = useState('');
  const [filterView, setFilterView] = useState<'ALL' | 'EXPIRING' | 'EXPIRED'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const now = new Date();

  const getExpiryStatus = (expiresAt: string | null) => {
    if (!expiresAt) return { label: 'No Expiry', variant: 'secondary' as const, daysLeft: null };
    const expDate = new Date(expiresAt);
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Expired', variant: 'destructive' as const, daysLeft: diffDays };
    }
    if (diffDays <= 30) {
      return {
        label: `Expires in ${diffDays}d`,
        variant: 'warning' as const,
        daysLeft: diffDays,
      };
    }
    return { label: `Valid (${expiresAt})`, variant: 'outline' as const, daysLeft: diffDays };
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      `${doc.employee.firstName} ${doc.employee.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      doc.employee.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      (doc.documentTypeRef?.name || doc.documentType).toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterView === 'EXPIRING') {
      const { daysLeft } = getExpiryStatus(doc.expiresAt);
      return daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
    }
    if (filterView === 'EXPIRED') {
      const { daysLeft } = getExpiryStatus(doc.expiresAt);
      return daysLeft !== null && daysLeft < 0;
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete document');
      toast.success('Document deleted');
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting document');
    } finally {
      setDeletingId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search documents or employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilterView('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterView === 'ALL'
                ? 'bg-white dark:bg-card text-[#252175] dark:text-[#F37021] shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Documents ({documents.length})
          </button>
          <button
            onClick={() => setFilterView('EXPIRING')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              filterView === 'EXPIRING'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-muted-foreground hover:text-amber-600'
            }`}
          >
            <Clock className="size-3.5" />
            Expiring &le; 30d
          </button>
          <button
            onClick={() => setFilterView('EXPIRED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              filterView === 'EXPIRED'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-muted-foreground hover:text-red-600'
            }`}
          >
            <AlertTriangle className="size-3.5" />
            Expired
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="size-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground">No documents found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {search
                ? 'No documents matched your search criteria.'
                : filterView === 'EXPIRING'
                ? 'No employee documents are expiring in the next 30 days.'
                : filterView === 'EXPIRED'
                ? 'There are currently no expired documents in the repository.'
                : 'Upload your company documents, staff IDs, degrees, or agreements to get started.'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold">Document Title</TableHead>
                <TableHead className="font-semibold">Employee</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Size</TableHead>
                <TableHead className="font-semibold">Status / Expiry</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.map((doc) => {
                const expiry = getExpiryStatus(doc.expiresAt);
                return (
                  <TableRow key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#252175]/10 dark:bg-[#252175]/30 flex items-center justify-center shrink-0">
                          <FileText className="size-5 text-[#252175] dark:text-[#F37021]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{doc.title}</span>
                            {doc.isSensitive && (
                              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-[10px] gap-1 px-1.5 py-0">
                                <ShieldAlert className="size-3" />
                                Private
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {doc.employee.firstName} {doc.employee.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {doc.employee.employeeCode}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="font-medium text-xs">
                        {doc.documentTypeRef?.name || doc.documentType}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {formatSize(doc.sizeBytes)}
                    </TableCell>

                    <TableCell>
                      {expiry.variant === 'destructive' ? (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <AlertTriangle className="size-3" />
                          {expiry.label}
                        </Badge>
                      ) : expiry.variant === 'warning' ? (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs">
                          <Clock className="size-3" />
                          {expiry.label}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
                          <CheckCircle2 className="size-3 text-emerald-500" />
                          {expiry.label}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-[#252175] dark:text-[#F37021] hover:bg-[#252175]/10"
                          title="Download Document"
                          onClick={() => {
                            // Simulated or real file download
                            toast.success(`Downloading ${doc.title}...`);
                            const a = document.createElement('a');
                            a.href = doc.storageUrl;
                            a.download = doc.title;
                            a.click();
                          }}
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === doc.id}
                          className="size-8 text-destructive hover:bg-destructive/10"
                          title="Delete Document"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ChevronDown, FileCheck2, Loader2, Lock, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils/format';
import { toast } from 'sonner';

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

interface DocumentTypeOption {
  id: string;
  name: string;
  code: string;
  isSensitive?: boolean;
}

interface Props {
  employees: EmployeeOption[];
  documentTypes: DocumentTypeOption[];
  /** Pre-selects the employee; with a single-entry `employees` list the picker is hidden. */
  currentEmployeeId?: string;
  onUploaded?: (doc: any) => void;
  size?: 'default' | 'sm';
}

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.doc,.docx';
const ACCEPT_PATTERN = /\.(pdf|png|jpe?g|webp|docx?)$/i;

const labelClass = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';
const selectClass =
  'h-10 w-full appearance-none rounded-xl border border-input bg-background pl-3 pr-9 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export function UploadDocumentModal({ employees, documentTypes, currentEmployeeId, onUploaded, size = 'default' }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(currentEmployeeId || (employees[0]?.id ?? ''));
  const [documentTypeId, setDocumentTypeId] = useState(documentTypes[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isSensitive, setIsSensitive] = useState(documentTypes[0]?.isSensitive ?? false);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showEmployeePicker = employees.length > 1;

  const reset = () => {
    setTitle('');
    setExpiresAt('');
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const chooseFile = (next: File | undefined) => {
    if (!next) return;
    if (!ACCEPT_PATTERN.test(next.name)) {
      setError('Unsupported file. Upload a PDF, PNG, JPG, WEBP, DOC or DOCX.');
      return;
    }
    if (next.size > MAX_BYTES) {
      setError(`That file is ${formatSize(next.size)}. The limit is 10 MB.`);
      return;
    }
    setError(null);
    setFile(next);
    // Auto-fill title with filename minus extension
    if (!title.trim()) setTitle(next.name.replace(/\.[^/.]+$/, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setError('Please choose a file to upload');
    if (!title.trim()) return setError('Please provide a document title');
    if (!employeeId) return setError('Please select an employee');

    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.set('file', file);
      form.set('employeeId', employeeId);
      form.set('title', title.trim());
      form.set('documentTypeId', documentTypeId);
      form.set('expiresAt', expiresAt);
      form.set('isSensitive', String(isSensitive));

      const res = await fetch('/api/documents', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to upload document');

      toast.success('Document uploaded successfully');
      onUploaded?.(data.data);
      setOpen(false);
      reset();
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Error uploading document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size={size} className="gap-2 shadow-md shadow-primary/25">
        <UploadCloud className={size === 'sm' ? 'size-3.5' : 'size-4'} />
        Upload Document
      </Button>

      <Dialog open={open} onOpenChange={(next) => !loading && setOpen(next)}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                <UploadCloud className="size-5 text-brand-orange" />
                Upload Document
              </DialogTitle>
              <DialogDescription>Contracts, identity cards, certificates or tax records. PDF, image or Word, up to 10 MB.</DialogDescription>
            </DialogHeader>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4 py-4">
              {/* Drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  chooseFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  'rounded-2xl border-2 border-dashed transition-colors',
                  dragging ? 'border-primary bg-primary/10' : file ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-muted/20 hover:border-primary/50'
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  id="doc-file-input"
                  className="sr-only"
                  accept={ACCEPT}
                  onChange={(e) => chooseFile(e.target.files?.[0])}
                />
                {file ? (
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <FileCheck2 className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                    </div>
                    <label htmlFor="doc-file-input" className="cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold text-brand-blue hover:bg-primary/10">
                      Replace
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (inputRef.current) inputRef.current.value = '';
                      }}
                      aria-label="Remove file"
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="doc-file-input" className="flex cursor-pointer flex-col items-center px-4 py-7 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-brand-blue">
                      <UploadCloud className="size-6" />
                    </div>
                    <span className="mt-3 text-sm font-semibold text-foreground">
                      Drop a file here, or <span className="text-brand-blue">browse</span>
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">PDF, PNG, JPG, WEBP, DOC, DOCX · max 10 MB</span>
                  </label>
                )}
              </div>

              <div>
                <Label htmlFor="doc-title" className={labelClass}>
                  Document Title
                </Label>
                <Input
                  id="doc-title"
                  placeholder="e.g. National ID Card / Offer Letter 2026"
                  className="mt-1.5"
                  value={title}
                  maxLength={150}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {showEmployeePicker && (
                <div>
                  <Label htmlFor="doc-employee" className={labelClass}>
                    Employee
                  </Label>
                  <div className="relative mt-1.5">
                    <select id="doc-employee" className={selectClass} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeCode})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="doc-type" className={labelClass}>
                    Document Type
                  </Label>
                  <div className="relative mt-1.5">
                    <select
                      id="doc-type"
                      className={selectClass}
                      value={documentTypeId}
                      onChange={(e) => {
                        setDocumentTypeId(e.target.value);
                        // Follow the classification's default; the user can still override it below
                        setIsSensitive(documentTypes.find((t) => t.id === e.target.value)?.isSensitive ?? false);
                      }}
                    >
                      {documentTypes.map((dt) => (
                        <option key={dt.id} value={dt.id}>
                          {dt.name}
                        </option>
                      ))}
                      <option value="">Other / General</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="doc-expiry" className={labelClass}>
                    Expiry Date (optional)
                  </Label>
                  <Input id="doc-expiry" type="date" className="mt-1.5" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/20 p-3">
                <input
                  type="checkbox"
                  checked={isSensitive}
                  onChange={(e) => setIsSensitive(e.target.checked)}
                  className="mt-0.5 size-4 rounded accent-[var(--primary)]"
                />
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Lock className="size-3.5 text-muted-foreground" />
                    Mark as confidential
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">Flags the document as sensitive in the repository.</span>
                </span>
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !file}>
                {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                {loading ? 'Uploading…' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

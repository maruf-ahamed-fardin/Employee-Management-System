'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react';
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
}

interface Props {
  employees: EmployeeOption[];
  documentTypes: DocumentTypeOption[];
  currentEmployeeId?: string;
}

export function UploadDocumentModal({ employees, documentTypes, currentEmployeeId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(currentEmployeeId || (employees[0]?.id ?? ''));
  const [documentTypeId, setDocumentTypeId] = useState(documentTypes[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [fileType, setFileType] = useState('application/pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);
      setFileType(file.type || 'application/octet-stream');
      if (!title) {
        // Auto-fill title with filename minus extension
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a document title');
      return;
    }
    if (!employeeId) {
      setError('Please select an employee');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedType = documentTypes.find((t) => t.id === documentTypeId);
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          title: title.trim(),
          documentTypeId: documentTypeId || undefined,
          documentType: selectedType?.code || 'OTHER',
          storageUrl: `/uploads/${fileName || 'document.pdf'}`,
          mimeType: fileType,
          sizeBytes: fileSize || 1024 * 250, // default 250kb if simulated
          expiresAt: expiresAt || null,
          isSensitive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      toast.success('Document uploaded successfully');
      setOpen(false);
      setTitle('');
      setFileName('');
      setFileSize(0);
      setExpiresAt('');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Error uploading document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#252175] hover:bg-[#1d1a5c] text-white gap-2 font-medium">
          <UploadCloud className="size-4 text-[#F37021]" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#252175] dark:text-white flex items-center gap-2">
              <UploadCloud className="size-5 text-[#F37021]" />
              Upload Employee Document
            </DialogTitle>
            <DialogDescription>
              Upload contracts, identity cards, degrees, certifications, or tax records.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mt-3 p-3 text-sm bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Employee
              </Label>
              <select
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#252175]"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Document Type
                </Label>
                <select
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#252175]"
                  value={documentTypeId}
                  onChange={(e) => setDocumentTypeId(e.target.value)}
                >
                  {documentTypes.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.name}
                    </option>
                  ))}
                  <option value="">Other / General</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Expiration Date (Optional)
                </Label>
                <Input
                  type="date"
                  className="mt-1.5"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Document Title
              </Label>
              <Input
                placeholder="e.g. National ID Card Copy / Offer Letter 2026"
                className="mt-1.5"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Select File
              </Label>
              <div className="mt-1.5 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 hover:border-[#252175]/60 transition-colors bg-muted/20">
                <input
                  type="file"
                  id="doc-file-input"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
                <label
                  htmlFor="doc-file-input"
                  className="cursor-pointer text-center flex flex-col items-center"
                >
                  <UploadCloud className="size-8 text-[#252175] dark:text-[#F37021] mb-2" />
                  <span className="text-sm font-medium text-foreground">
                    {fileName ? fileName : 'Click to choose file (PDF, Image, DOC)'}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : 'Maximum file size: 10 MB'}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isSensitive"
                checked={isSensitive}
                onChange={(e) => setIsSensitive(e.target.checked)}
                className="size-4 rounded border-gray-300 text-[#252175] focus:ring-[#252175]"
              />
              <label htmlFor="isSensitive" className="text-sm font-medium cursor-pointer">
                Mark as confidential / private (restricted access)
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#252175] hover:bg-[#1d1a5c] text-white"
            >
              {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Save & Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

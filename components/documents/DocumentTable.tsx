'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { confirmDialog } from '@/components/ui/confirm';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Eye,
  File as FileIcon,
  FileImage,
  FileText,
  FileType2,
  FileWarning,
  Files,
  Loader2,
  Lock,
  Pencil,
  Search,
  SearchX,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/format';
import { toast } from 'sonner';

export interface DocumentRow {
  id: string;
  title: string;
  documentType: string;
  documentTypeId?: string | null;
  mimeType: string;
  sizeBytes: number;
  expiresAt: string | null;
  isSensitive: boolean;
  /** False for legacy records that were saved without an actual file. */
  hasFile: boolean;
  createdAt: string | Date;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    photoUrl?: string | null;
  };
  documentTypeRef?: { id: string; name: string } | null;
}

interface Props {
  initialDocuments: DocumentRow[];
  documentTypes: { id: string; name: string; code: string }[];
  canManage: boolean;
}

type View = 'ALL' | 'EXPIRING' | 'EXPIRED' | 'CONFIDENTIAL';
type Expiry = { state: 'none' | 'valid' | 'expiring' | 'expired'; days: number | null; label: string };

const DAY_MS = 86_400_000;
const PREVIEWABLE = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

const selectClass =
  'h-10 w-full appearance-none rounded-xl border border-input bg-background pl-3 pr-9 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';
const labelClass = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';
const cardClass = 'rounded-2xl border bg-card shadow-[var(--shadow-panel)]';

const fileUrl = (id: string, download = false) => `/api/documents/${id}/file${download ? '?download=1' : ''}`;
const typeLabel = (doc: DocumentRow) =>
  doc.documentTypeRef?.name ||
  doc.documentType
    .toLowerCase()
    .split('_')
    .map((w) => (w === 'id' ? 'ID' : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileVisual(mimeType: string): { icon: LucideIcon; tone: string; label: string } {
  if (mimeType === 'application/pdf') return { icon: FileText, tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', label: 'PDF' };
  if (mimeType.startsWith('image/')) return { icon: FileImage, tone: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', label: 'Image' };
  if (mimeType.includes('word')) return { icon: FileType2, tone: 'bg-primary/10 text-brand-blue', label: 'Word' };
  return { icon: FileIcon, tone: 'bg-muted text-muted-foreground', label: 'File' };
}

function expiryOf(expiresAt: string | null, today: string): Expiry {
  if (!expiresAt) return { state: 'none', days: null, label: 'No expiry' };
  const days = Math.round((new Date(`${expiresAt}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()) / DAY_MS);
  if (days < 0) return { state: 'expired', days, label: `Expired ${-days}d ago` };
  if (days === 0) return { state: 'expiring', days, label: 'Expires today' };
  if (days <= 30) return { state: 'expiring', days, label: `${days} day${days === 1 ? '' : 's'} left` };
  return { state: 'valid', days, label: `Valid until ${formatDate(expiresAt)}` };
}

function ExpiryBadge({ expiry }: { expiry: Expiry }) {
  if (expiry.state === 'none') return <span className="text-xs text-muted-foreground">No expiry</span>;
  const styles = {
    expired: { icon: AlertTriangle, cls: 'bg-destructive/10 text-destructive ring-destructive/25' },
    expiring: { icon: Clock, cls: 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300' },
    valid: { icon: CheckCircle2, cls: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300' },
  }[expiry.state];
  const Icon = styles.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', styles.cls)}>
      <Icon className="size-3" />
      {expiry.label}
    </span>
  );
}

export function DocumentTable({ initialDocuments, documentTypes, canManage }: Props) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentRow[]>(initialDocuments);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('ALL');
  const [typeFilter, setTypeFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<DocumentRow | null>(null);
  const [edit, setEdit] = useState<{ id: string; title: string; documentTypeId: string; expiresAt: string; isSensitive: boolean } | null>(null);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  // Pick up rows added through the upload modal (which refreshes the server component)
  useEffect(() => setDocuments(initialDocuments), [initialDocuments]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const rows = useMemo(() => documents.map((doc) => ({ doc, expiry: expiryOf(doc.expiresAt, today) })), [documents, today]);

  const counts = useMemo(
    () => ({
      ALL: rows.length,
      EXPIRING: rows.filter((r) => r.expiry.state === 'expiring').length,
      EXPIRED: rows.filter((r) => r.expiry.state === 'expired').length,
      CONFIDENTIAL: rows.filter((r) => r.doc.isSensitive).length,
    }),
    [rows]
  );

  const typeOptions = useMemo(() => [...new Set(documents.map(typeLabel))].sort(), [documents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(({ doc, expiry }) => {
      if (view === 'EXPIRING' && expiry.state !== 'expiring') return false;
      if (view === 'EXPIRED' && expiry.state !== 'expired') return false;
      if (view === 'CONFIDENTIAL' && !doc.isSensitive) return false;
      if (typeFilter && typeLabel(doc) !== typeFilter) return false;
      if (!q) return true;
      return [doc.title, `${doc.employee.firstName} ${doc.employee.lastName}`, doc.employee.employeeCode, typeLabel(doc)].some((v) =>
        v.toLowerCase().includes(q)
      );
    });
  }, [rows, search, view, typeFilter]);

  const hasFilters = Boolean(search || typeFilter || view !== 'ALL');
  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setView('ALL');
  };

  const handleDelete = async (doc: DocumentRow) => {
    const confirmed = await confirmDialog({
      title: 'Delete this document?',
      description: `"${doc.title}" and its file will be permanently removed. This cannot be undone.`,
      confirmLabel: 'Delete Document',
      tone: 'danger',
    });
    if (!confirmed) return;
    setDeletingId(doc.id);
    try {
      const res = await fetch(`/api/documents?id=${doc.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete document');
      toast.success('Document deleted');
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting document');
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (doc: DocumentRow) => {
    setEditError('');
    setEdit({
      id: doc.id,
      title: doc.title,
      documentTypeId: doc.documentTypeRef?.id || doc.documentTypeId || '',
      expiresAt: doc.expiresAt || '',
      isSensitive: doc.isSensitive,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit || !edit.title.trim()) return;
    setSaving(true);
    setEditError('');
    try {
      const res = await fetch('/api/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...edit, title: edit.title.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update document');
      setDocuments((prev) => prev.map((d) => (d.id === edit.id ? data.data : d)));
      toast.success('Document updated');
      setEdit(null);
      router.refresh();
    } catch (err: any) {
      setEditError(err.message || 'Error updating document');
    } finally {
      setSaving(false);
    }
  };

  const tiles: { key: View; label: string; hint: string; icon: LucideIcon; tone: string; alert?: boolean }[] = [
    { key: 'ALL', label: 'All documents', hint: canManage ? 'Across all employees' : 'In your record', icon: Files, tone: 'bg-primary/10 text-brand-blue' },
    {
      key: 'EXPIRING',
      label: 'Expiring soon',
      hint: 'Within the next 30 days',
      icon: Clock,
      tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      alert: counts.EXPIRING > 0,
    },
    {
      key: 'EXPIRED',
      label: 'Expired',
      hint: 'Need to be renewed',
      icon: AlertTriangle,
      tone: 'bg-destructive/10 text-destructive',
      alert: counts.EXPIRED > 0,
    },
    { key: 'CONFIDENTIAL', label: 'Confidential', hint: 'Marked as sensitive', icon: Lock, tone: 'bg-brand-orange/10 text-brand-orange-hover dark:text-brand-orange' },
  ];

  const actions = (doc: DocumentRow) => {
    const canPreview = doc.hasFile && PREVIEWABLE.includes(doc.mimeType);
    const iconButton = 'size-8 text-muted-foreground hover:bg-primary/10 hover:text-brand-blue';
    return (
      <div className="flex items-center justify-end gap-0.5">
        {canPreview && (
          <Button variant="ghost" size="icon" className={iconButton} title="Preview" aria-label={`Preview ${doc.title}`} onClick={() => setPreview(doc)}>
            <Eye className="size-4" />
          </Button>
        )}
        {doc.hasFile && (
          <Button variant="ghost" size="icon" className={iconButton} title="Download" asChild>
            <a href={fileUrl(doc.id, true)} aria-label={`Download ${doc.title}`}>
              <Download className="size-4" />
            </a>
          </Button>
        )}
        {canManage && (
          <>
            <Button variant="ghost" size="icon" className={iconButton} title="Edit details" aria-label={`Edit ${doc.title}`} onClick={() => openEdit(doc)}>
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={deletingId === doc.id}
              className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Delete"
              aria-label={`Delete ${doc.title}`}
              onClick={() => handleDelete(doc)}
            >
              {deletingId === doc.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            </Button>
          </>
        )}
      </div>
    );
  };

  const titleBlock = (doc: DocumentRow) => {
    const visual = fileVisual(doc.mimeType);
    const Icon = doc.hasFile ? visual.icon : FileWarning;
    return (
      <div className="flex min-w-0 items-center gap-3">
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', doc.hasFile ? visual.tone : 'bg-amber-500/10 text-amber-600 dark:text-amber-400')}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{doc.title}</span>
            {doc.isSensitive && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-orange/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-orange-hover dark:text-brand-orange">
                <Lock className="size-2.5" />
                Confidential
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {doc.hasFile ? (
              <>
                {visual.label} · {formatSize(doc.sizeBytes)} · Uploaded {formatDate(doc.createdAt)}
              </>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">No file stored — delete and upload again</span>
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Summary tiles double as quick filters */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ key, label, hint, icon: Icon, tone, alert }) => {
          const active = view === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setView(active ? 'ALL' : key)}
              aria-pressed={active}
              className={cn(
                'group relative overflow-hidden rounded-2xl border bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5',
                active ? 'border-primary/60 shadow-[var(--shadow-card)] ring-1 ring-primary/40' : 'shadow-[var(--shadow-panel)]'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase leading-4 tracking-wider text-muted-foreground">{label}</p>
                <span className={cn('relative flex size-8 shrink-0 items-center justify-center rounded-lg', tone)}>
                  <Icon className="size-4" />
                  {alert && <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-current ring-2 ring-card" />}
                </span>
              </div>
              <p className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{counts[key]}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
            </button>
          );
        })}
      </div>

      {/* Search and filters */}
      <div className={cn(cardClass, 'flex flex-col gap-3 p-2.5 sm:flex-row sm:items-center sm:p-3')}>
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={canManage ? 'Search documents or employees...' : 'Search your documents...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="relative sm:w-56">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by document type" className={selectClass}>
            <option value="">All document types</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="flex items-center justify-between gap-3 px-1 text-xs text-muted-foreground sm:ml-auto">
          <span>
            <span className="font-semibold text-foreground">{filtered.length}</span> of {documents.length}
          </span>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline">
              <X className="size-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            {hasFilters ? <SearchX className="size-5" /> : <Files className="size-5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{hasFilters ? 'No documents match your filters' : 'No documents yet'}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hasFilters ? 'Try a different search term or clear the filters.' : 'Use “Upload Document” to add the first one.'}
            </p>
          </div>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className={cn(cardClass, 'hidden overflow-hidden md:block')}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th scope="col" className="px-6 py-3">Document</th>
                    {canManage && <th scope="col" className="px-6 py-3">Employee</th>}
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">Expiry</th>
                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(({ doc, expiry }) => (
                    <tr key={doc.id} className="transition-colors hover:bg-muted/30">
                      <td className="max-w-sm px-6 py-3.5">{titleBlock(doc)}</td>
                      {canManage && (
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar size="sm" src={doc.employee.photoUrl} initials={`${doc.employee.firstName[0] || ''}${doc.employee.lastName[0] || ''}`} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {doc.employee.firstName} {doc.employee.lastName}
                              </p>
                              <p className="text-xs tabular-nums text-muted-foreground">{doc.employee.employeeCode}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="whitespace-nowrap px-6 py-3.5">
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">{typeLabel(doc)}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <ExpiryBadge expiry={expiry} />
                      </td>
                      <td className="px-6 py-3.5">{actions(doc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {filtered.map(({ doc, expiry }) => (
              <li key={doc.id} className={cn(cardClass, 'p-4')}>
                {titleBlock(doc)}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">{typeLabel(doc)}</span>
                  <ExpiryBadge expiry={expiry} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                  {canManage ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar size="sm" src={doc.employee.photoUrl} initials={`${doc.employee.firstName[0] || ''}${doc.employee.lastName[0] || ''}`} />
                      <p className="truncate text-xs font-medium text-foreground">
                        {doc.employee.firstName} {doc.employee.lastName}
                      </p>
                    </div>
                  ) : (
                    <span />
                  )}
                  {actions(doc)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Preview */}
      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col p-0 sm:max-w-4xl">
          {preview && (
            <>
              <div className="flex items-center gap-3 border-b p-4 pr-12">
                <div className="min-w-0 flex-1">
                  <DialogTitle className="truncate text-base">{preview.title}</DialogTitle>
                  <DialogDescription className="mt-1 truncate text-xs">
                    {preview.employee.firstName} {preview.employee.lastName} · {typeLabel(preview)} · {formatSize(preview.sizeBytes)}
                  </DialogDescription>
                </div>
                <Button size="sm" variant="outline" asChild className="shrink-0 gap-1.5">
                  <a href={fileUrl(preview.id, true)}>
                    <Download className="size-3.5" />
                    Download
                  </a>
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-auto bg-muted/40">
                {preview.mimeType === 'application/pdf' ? (
                  <iframe src={fileUrl(preview.id)} title={preview.title} className="h-[70dvh] w-full" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fileUrl(preview.id)} alt={preview.title} className="mx-auto max-h-[70dvh] w-auto object-contain p-4" />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit details */}
      <Dialog open={edit !== null} onOpenChange={(open) => !open && !saving && setEdit(null)}>
        <DialogContent className="sm:max-w-md">
          {edit && (
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                  <Pencil className="size-5 text-brand-orange" />
                  Edit Document
                </DialogTitle>
                <DialogDescription>Update the title, classification or expiry. The file itself is not changed.</DialogDescription>
              </DialogHeader>

              {editError && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {editError}
                </p>
              )}

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-doc-title" className={labelClass}>
                    Document Title
                  </Label>
                  <Input
                    id="edit-doc-title"
                    className="mt-1.5"
                    value={edit.title}
                    maxLength={150}
                    onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-doc-type" className={labelClass}>
                      Document Type
                    </Label>
                    <div className="relative mt-1.5">
                      <select
                        id="edit-doc-type"
                        className={selectClass}
                        value={edit.documentTypeId}
                        onChange={(e) => setEdit({ ...edit, documentTypeId: e.target.value })}
                      >
                        {documentTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                        <option value="">Other / General</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-doc-expiry" className={labelClass}>
                      Expiry Date
                    </Label>
                    <Input
                      id="edit-doc-expiry"
                      type="date"
                      className="mt-1.5"
                      value={edit.expiresAt}
                      onChange={(e) => setEdit({ ...edit, expiresAt: e.target.value })}
                    />
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-muted/20 p-3">
                  <input
                    type="checkbox"
                    checked={edit.isSensitive}
                    onChange={(e) => setEdit({ ...edit, isSensitive: e.target.checked })}
                    className="size-4 rounded accent-[var(--primary)]"
                  />
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Lock className="size-3.5 text-muted-foreground" />
                    Confidential
                  </span>
                </label>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setEdit(null)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Briefcase,
  ChevronDown,
  ChevronRight,
  DollarSign,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  Search,
  SearchX,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/date';
import { cn } from '@/lib/utils/format';
import { toast } from 'sonner';

export interface PositionItem {
  id: string;
  title: string;
  departmentId?: string | null;
  level?: string | null;
  baseSalary?: number | null;
  isActive?: boolean;
  department?: { id: string; name: string } | null;
  _count?: { employees: number };
}

const LEVELS = ['Intern', 'Junior', 'Mid-Level', 'Senior', 'Lead / Staff', 'Director / Head'] as const;

const LEVEL_STYLES: Record<string, string> = {
  Intern: 'bg-slate-500/10 text-slate-600 ring-slate-500/20 dark:text-slate-300',
  Junior: 'bg-sky-500/10 text-sky-700 ring-sky-500/25 dark:text-sky-300',
  'Mid-Level': 'bg-primary/10 text-brand-blue ring-primary/25',
  Senior: 'bg-violet-500/10 text-violet-700 ring-violet-500/25 dark:text-violet-300',
  'Lead / Staff': 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
  'Director / Head': 'bg-brand-orange/10 text-brand-orange-hover ring-brand-orange/30 dark:text-brand-orange',
};

const DEPT_DOTS = ['bg-brand-blue', 'bg-emerald-400', 'bg-amber-400', 'bg-sky-400', 'bg-rose-400', 'bg-violet-400', 'bg-teal-400', 'bg-brand-orange'];

type SortKey = 'title' | 'level' | 'salary' | 'headcount';
interface StaffMember {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string | null;
  status: string;
}

type FormState = { id: string | null; title: string; departmentId: string; level: string; baseSalary: number };

const levelOf = (p: PositionItem) => p.level || 'Mid-Level';
const salaryOf = (p: PositionItem) => p.baseSalary || 50000;
const headcountOf = (p: PositionItem) => p._count?.employees || 0;
const isArchived = (p: PositionItem) => p.isActive === false;
const sameTitle = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

const selectClass =
  'h-10 w-full appearance-none rounded-xl border border-input bg-background pl-3 pr-9 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';

function LevelBadge({ level }: { level: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap',
        LEVEL_STYLES[level] || LEVEL_STYLES['Mid-Level']
      )}
    >
      {level}
    </span>
  );
}

function Headcount({ count, onClick }: { count: number; onClick?: () => void }) {
  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <UserPlus className="size-3.5" />
        Vacant
      </span>
    );
  }
  const content = (
    <>
      <Users className="size-3.5 text-muted-foreground" />
      {count} <span className="text-muted-foreground">staff</span>
    </>
  );
  if (!onClick) {
    return <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">{content}</span>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title="View assigned staff"
      className="-mx-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-brand-blue"
    >
      {content}
      <ChevronRight className="size-3 text-muted-foreground" />
    </button>
  );
}

export function PositionsClient({
  initialPositions = [],
  departments = [],
  canManage = false,
}: {
  initialPositions: PositionItem[];
  departments: { id: string; name: string }[];
  canManage?: boolean;
}) {
  const router = useRouter();
  const [positions, setPositions] = useState<PositionItem[]>(initialPositions);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'title', dir: 'asc' });

  // Add / Edit Modal State (id === null means "add")
  const emptyForm: FormState = { id: null, title: '', departmentId: departments[0]?.id || '', level: 'Mid-Level', baseSalary: 55000 };
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PositionItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  // Assigned Staff Modal State
  const [staffTarget, setStaffTarget] = useState<PositionItem | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const deptDot = (id?: string | null) => {
    const idx = departments.findIndex((d) => d.id === id);
    return idx === -1 ? 'bg-slate-400' : DEPT_DOTS[idx % DEPT_DOTS.length];
  };

  const activePositions = useMemo(() => positions.filter((p) => !isArchived(p)), [positions]);
  const archivedCount = positions.length - activePositions.length;
  const scopedPositions = useMemo(
    () => (showArchived ? positions.filter(isArchived) : activePositions),
    [positions, activePositions, showArchived]
  );

  // Summary tiles always describe the live (non-archived) structure
  const stats = useMemo(() => {
    const total = activePositions.length;
    const headcount = activePositions.reduce((sum, p) => sum + headcountOf(p), 0);
    const avgSalary = total ? Math.round(activePositions.reduce((sum, p) => sum + salaryOf(p), 0) / total) : 0;
    const vacant = activePositions.filter((p) => headcountOf(p) === 0).length;
    return { total, headcount, avgSalary, vacant };
  }, [activePositions]);

  const maxSalary = useMemo(() => Math.max(1, ...positions.map(salaryOf)), [positions]);

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    scopedPositions.forEach((p) => {
      counts[levelOf(p)] = (counts[levelOf(p)] || 0) + 1;
    });
    return counts;
  }, [scopedPositions]);

  const filteredPositions = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = scopedPositions.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q) && !(p.department?.name || '').toLowerCase().includes(q)) return false;
      if (selectedDept && p.departmentId !== selectedDept) return false;
      if (selectedLevel && levelOf(p) !== selectedLevel) return false;
      return true;
    });

    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sort.key) {
        case 'salary':
          return (salaryOf(a) - salaryOf(b)) * dir;
        case 'headcount':
          return (headcountOf(a) - headcountOf(b)) * dir;
        case 'level':
          return (LEVELS.indexOf(levelOf(a) as any) - LEVELS.indexOf(levelOf(b) as any)) * dir;
        default:
          return a.title.localeCompare(b.title) * dir;
      }
    });
  }, [scopedPositions, search, selectedDept, selectedLevel, sort]);

  const hasFilters = Boolean(search || selectedDept || selectedLevel);
  const clearFilters = () => {
    setSearch('');
    setSelectedDept('');
    setSelectedLevel('');
  };

  const toggleSort = (key: SortKey) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'title' ? 'asc' : 'desc' }));
  };

  const openAdd = () => {
    setFormError('');
    setForm(emptyForm);
  };

  const openEdit = (pos: PositionItem) => {
    setFormError('');
    setForm({
      id: pos.id,
      title: pos.title,
      departmentId: pos.departmentId || departments[0]?.id || '',
      level: levelOf(pos),
      baseSalary: salaryOf(pos),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !form.title.trim()) return;

    const isEdit = form.id !== null;
    const payload = {
      title: form.title.trim(),
      departmentId: form.departmentId,
      level: form.level,
      baseSalary: form.baseSalary,
    };

    const clash = positions.find(
      (p) => p.id !== form.id && (p.departmentId || '') === payload.departmentId && sameTitle(p.title, payload.title)
    );
    if (clash) {
      setFormError(
        isArchived(clash)
          ? 'This title already exists in this department as an archived position. Restore it instead.'
          : 'This title already exists in this department.'
      );
      return;
    }

    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/positions', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { id: form.id, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} position`);

      if (isEdit) {
        setPositions((prev) => prev.map((p) => (p.id === form.id ? data.data : p)));
        toast.success('Position updated successfully');
      } else {
        setPositions((prev) => [...prev, data.data]);
        toast.success(`Position "${payload.title}" created`);
      }
      setForm(null);
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || `Error ${isEdit ? 'updating' : 'creating'} position`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActive = async (pos: PositionItem, isActive: boolean) => {
    setArchivingId(pos.id);
    try {
      const res = await fetch('/api/positions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pos.id, isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${isActive ? 'restore' : 'archive'} position`);

      setPositions((prev) => prev.map((p) => (p.id === pos.id ? data.data : p)));
      toast.success(isActive ? `"${pos.title}" restored` : `"${pos.title}" archived`);
      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || `Error ${isActive ? 'restoring' : 'archiving'} position`);
    } finally {
      setArchivingId(null);
    }
  };

  const openStaff = async (pos: PositionItem) => {
    setStaffTarget(pos);
    setStaff([]);
    setStaffLoading(true);
    try {
      const res = await fetch(`/api/positions/${pos.id}/employees`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load staff');
      setStaff(data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Error loading staff');
      setStaffTarget(null);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/positions?id=${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete position');

      toast.success('Position deleted');
      setPositions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting position');
    } finally {
      setDeleting(false);
    }
  };

  const statTiles = [
    { label: 'Total Positions', value: stats.total, icon: Briefcase, tone: 'bg-primary/10 text-brand-blue' },
    { label: 'Active Staff', value: stats.headcount, icon: Users, tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' },
    { label: 'Avg. Base Salary', value: formatCurrency(stats.avgSalary), icon: DollarSign, tone: 'bg-brand-orange/10 text-brand-orange-hover dark:text-brand-orange' },
    { label: 'Vacant Roles', value: stats.vacant, icon: UserPlus, tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-300' },
  ];

  const SortHeader = ({ label, sortKey, className }: { label: string; sortKey: SortKey; className?: string }) => {
    const active = sort.key === sortKey;
    const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
    return (
      <th
        scope="col"
        aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={cn('px-5 py-3 text-left', className)}
      >
        <button
          type="button"
          onClick={() => toggleSort(sortKey)}
          className={cn(
            'inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors hover:text-foreground',
            active ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {label}
          <Icon className={cn('size-3', !active && 'opacity-50')} />
        </button>
      </th>
    );
  };

  const RowActions = ({ pos }: { pos: PositionItem }) => (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-brand-blue hover:bg-primary/10"
        title="Edit position"
        aria-label={`Edit ${pos.title}`}
        onClick={() => openEdit(pos)}
      >
        <Pencil className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={archivingId === pos.id}
        className="size-8 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10"
        title={isArchived(pos) ? 'Restore position' : 'Archive position'}
        aria-label={`${isArchived(pos) ? 'Restore' : 'Archive'} ${pos.title}`}
        onClick={() => handleSetActive(pos, isArchived(pos))}
      >
        {archivingId === pos.id ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : isArchived(pos) ? (
          <ArchiveRestore className="size-3.5" />
        ) : (
          <Archive className="size-3.5" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        title="Delete position"
        aria-label={`Delete ${pos.title}`}
        onClick={() => setDeleteTarget(pos)}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );

  const emptyState = (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {hasFilters ? <SearchX className="size-5" /> : showArchived ? <Archive className="size-5" /> : <Briefcase className="size-5" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {hasFilters ? 'No positions match your filters' : showArchived ? 'No archived positions' : 'No positions yet'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {hasFilters
            ? 'Try a different search term or clear the filters.'
            : showArchived
              ? 'Positions you archive are kept here and can be restored at any time.'
              : 'Create your first job position to get started.'}
        </p>
      </div>
      {hasFilters ? (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      ) : (
        !showArchived &&
        canManage && (
          <Button size="sm" onClick={openAdd} className="gap-1.5">
            <Plus className="size-4" />
            Add Job Position
          </Button>
        )
      )}
    </div>
  );

  const deleteBlocked = deleteTarget ? headcountOf(deleteTarget) > 0 : false;

  return (
    <div className="space-y-5">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statTiles.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-[var(--shadow-panel)]">
            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', tone)}>
              <Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="text-xl font-black tracking-tight text-foreground tabular-nums">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Actions Toolbar */}
      <div className="rounded-2xl border bg-card p-3 shadow-[var(--shadow-panel)] space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search positions or departments..."
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

          <div className="relative sm:w-52">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by department"
              className={selectClass}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-3 sm:ml-auto">
            <div className="hidden md:flex items-center rounded-xl border bg-background p-1">
              {([
                { key: 'table', icon: List, label: 'List view' },
                { key: 'grid', icon: LayoutGrid, label: 'Grid view' },
              ] as const).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-label={label}
                  aria-pressed={view === key}
                  title={label}
                  className={cn(
                    'rounded-lg p-1.5 transition-colors',
                    view === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>

            {canManage && (
              <Button onClick={openAdd} className="flex-1 sm:flex-none gap-2 font-medium shrink-0">
                <Plus className="size-4 text-brand-orange" />
                Add Job Position
              </Button>
            )}
          </div>
        </div>

        {/* Seniority quick filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-1 px-1">
          <div className="flex shrink-0 items-center rounded-full border bg-background p-0.5">
            {[
              { archived: false, label: 'Active', count: activePositions.length },
              { archived: true, label: 'Archived', count: archivedCount },
            ].map(({ archived, label, count }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setShowArchived(archived);
                  setSelectedLevel('');
                }}
                aria-pressed={showArchived === archived}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                  showArchived === archived ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
                <span className="tabular-nums text-muted-foreground/70">{count}</span>
              </button>
            ))}
          </div>
          <span className="h-5 w-px shrink-0 bg-border" />
          {['', ...LEVELS.filter((l) => levelCounts[l])].map((lvl) => {
            const active = selectedLevel === lvl;
            return (
              <button
                key={lvl || 'all'}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                aria-pressed={active}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                  active
                    ? 'border-transparent bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                )}
              >
                {lvl || 'All levels'}
                <span className={cn('tabular-nums', active ? 'text-primary-foreground/70' : 'text-muted-foreground/70')}>
                  {lvl ? levelCounts[lvl] : scopedPositions.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result summary */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          Showing <span className="font-semibold text-foreground">{filteredPositions.length}</span> of {scopedPositions.length} {showArchived ? 'archived' : 'active'} positions
        </span>
        {hasFilters && (
          <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline">
            <X className="size-3" />
            Clear filters
          </button>
        )}
      </div>

      {filteredPositions.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card">{emptyState}</div>
      ) : (
        <>
          {/* Table (desktop list view) */}
          <div className={cn('rounded-2xl border bg-card overflow-hidden shadow-[var(--shadow-panel)]', view === 'table' ? 'hidden md:block' : 'hidden')}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    {SortHeader({ label: "Designation", sortKey: "title" })}
                    <th scope="col" className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Department
                    </th>
                    {SortHeader({ label: "Seniority", sortKey: "level" })}
                    {SortHeader({ label: "Base Salary", sortKey: "salary" })}
                    {SortHeader({ label: "Headcount", sortKey: "headcount" })}
                    {canManage && (
                      <th scope="col" className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredPositions.map((pos) => (
                    <tr key={pos.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-9 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-brand-blue">
                            <Briefcase className="size-4" />
                          </div>
                          <span className={cn('font-semibold', isArchived(pos) ? 'text-muted-foreground' : 'text-foreground')}>
                            {pos.title}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <span className={cn('size-2 shrink-0 rounded-full', deptDot(pos.departmentId))} />
                          {pos.department?.name || 'Cross-Departmental'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <LevelBadge level={levelOf(pos)} />
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="w-32">
                          <p className="text-sm font-semibold tabular-nums text-foreground">
                            {formatCurrency(salaryOf(pos))}
                            <span className="ml-1 text-xs font-normal text-muted-foreground">/ mo</span>
                          </p>
                          <div className="mt-1.5 h-1 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-emerald-500/70"
                              style={{ width: `${Math.max(6, (salaryOf(pos) / maxSalary) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <Headcount count={headcountOf(pos)} onClick={canManage ? () => openStaff(pos) : undefined} />
                      </td>

                      {canManage && <td className="px-5 py-3.5">{RowActions({ pos })}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards (mobile, or grid view) */}
          <div className={cn('grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3', view === 'table' && 'md:hidden')}>
            {filteredPositions.map((pos) => (
              <div
                key={pos.id}
                className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-[var(--shadow-panel)] transition-colors hover:border-primary/40"
              >
                <div className="flex items-start gap-3">
                  <div className="size-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-brand-blue">
                    <Briefcase className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('font-semibold text-sm leading-snug', isArchived(pos) ? 'text-muted-foreground' : 'text-foreground')}>
                      {pos.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={cn('size-1.5 shrink-0 rounded-full', deptDot(pos.departmentId))} />
                      <span className="truncate">{pos.department?.name || 'Cross-Departmental'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <LevelBadge level={levelOf(pos)} />
                  <Headcount count={headcountOf(pos)} onClick={canManage ? () => openStaff(pos) : undefined} />
                </div>

                <div className="flex items-baseline justify-between border-t pt-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Base salary</span>
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    {formatCurrency(salaryOf(pos))}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">/ mo</span>
                  </span>
                </div>

                {canManage && <div className="-mb-1 -mt-2 border-t pt-2">{RowActions({ pos })}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add / Edit Position Modal */}
      <Dialog open={form !== null} onOpenChange={(open) => !open && !submitting && setForm(null)}>
        <DialogContent className="sm:max-w-md">
          {form && (
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  {form.id ? <Pencil className="size-5 text-brand-orange" /> : <Briefcase className="size-5 text-brand-orange" />}
                  {form.id ? 'Edit Position' : 'Add New Job Position'}
                </DialogTitle>
                <DialogDescription>
                  {form.id
                    ? 'Modify title, department assignment, or benchmark pay.'
                    : 'Define a standard corporate designation and compensation benchmark.'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="position-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Position Title *
                  </Label>
                  <Input
                    id="position-title"
                    value={form.title}
                    onChange={(e) => {
                      setFormError('');
                      setForm({ ...form, title: e.target.value });
                    }}
                    required
                    autoFocus
                    aria-invalid={!!formError}
                    aria-describedby={formError ? 'position-form-error' : undefined}
                    className={cn('mt-1.5', formError && 'border-destructive focus-visible:ring-destructive')}
                    placeholder="e.g. Lead Cloud Architect"
                  />
                  {formError && (
                    <p id="position-form-error" role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-destructive">
                      <AlertTriangle className="mt-px size-3.5 shrink-0" />
                      {formError}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="position-department" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Department
                  </Label>
                  <div className="relative mt-1.5">
                    <select
                      id="position-department"
                      value={form.departmentId}
                      onChange={(e) => {
                        setFormError('');
                        setForm({ ...form, departmentId: e.target.value });
                      }}
                      className={selectClass}
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Seniority Level</Label>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {LEVELS.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setForm({ ...form, level: lvl })}
                        aria-pressed={form.level === lvl}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                          form.level === lvl
                            ? 'border-transparent bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground'
                        )}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="position-salary" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Base Salary (per month)
                  </Label>
                  <div className="relative mt-1.5">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="position-salary"
                      type="number"
                      min={0}
                      step={500}
                      value={form.baseSalary}
                      onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })}
                      className="pl-9 tabular-nums"
                      required
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setForm(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                  {form.id ? 'Save Changes' : 'Create Position'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          {deleteTarget && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <AlertTriangle className="size-4" />
                  </span>
                  Delete position?
                </DialogTitle>
                <DialogDescription className="pt-2">
                  {deleteBlocked ? (
                    <>
                      <span className="font-semibold text-foreground">{deleteTarget.title}</span> still has{' '}
                      {headcountOf(deleteTarget)} staff assigned, so it cannot be deleted.{' '}
                      {isArchived(deleteTarget)
                        ? 'Reassign them to another position first.'
                        : 'Archive it to hide it from new assignments while keeping their records intact.'}
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">{deleteTarget.title}</span> will be permanently removed. This
                      action cannot be undone.
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                  {deleteBlocked ? 'Close' : 'Cancel'}
                </Button>
                {deleteBlocked && !isArchived(deleteTarget) && (
                  <Button type="button" onClick={() => handleSetActive(deleteTarget, false)} disabled={archivingId === deleteTarget.id}>
                    {archivingId === deleteTarget.id ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Archive className="size-4 mr-2" />}
                    Archive Instead
                  </Button>
                )}
                {!deleteBlocked && (
                  <Button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    variant="destructive"
                  >
                    {deleting && <Loader2 className="size-4 mr-2 animate-spin" />}
                    Delete Position
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Assigned Staff Modal */}
      <Dialog open={staffTarget !== null} onOpenChange={(open) => !open && setStaffTarget(null)}>
        <DialogContent className="sm:max-w-md">
          {staffTarget && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                  <Users className="size-5 text-brand-orange" />
                  {staffTarget.title}
                </DialogTitle>
                <DialogDescription>
                  {staffTarget.department?.name || 'Cross-Departmental'} · {headcountOf(staffTarget)} staff assigned
                </DialogDescription>
              </DialogHeader>

              {staffLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : staff.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No staff are assigned to this position.</p>
              ) : (
                <ul className="-mx-2 max-h-80 space-y-0.5 overflow-y-auto">
                  {staff.map((emp) => (
                    <li key={emp.id}>
                      <Link
                        href={`/employees/${emp.id}`}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted"
                      >
                        <Avatar size="sm" src={emp.photoUrl} initials={`${emp.firstName[0] || ''}${emp.lastName[0] || ''}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {emp.employeeCode} · {emp.email}
                          </p>
                        </div>
                        {emp.status !== 'ACTIVE' && (
                          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {emp.status}
                          </span>
                        )}
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

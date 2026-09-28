'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Briefcase, Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/date';
import { toast } from 'sonner';

export interface PositionItem {
  id: string;
  title: string;
  departmentId?: string | null;
  level?: string | null;
  baseSalary?: number | null;
  department?: { id: string; name: string } | null;
  _count?: { employees: number };
}

export function PositionsClient({
  initialPositions = [],
  departments = [],
}: {
  initialPositions: PositionItem[];
  departments: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [positions, setPositions] = useState<PositionItem[]>(initialPositions);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Add Modal State
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [level, setLevel] = useState('Mid-Level');
  const [baseSalary, setBaseSalary] = useState(55000);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editBaseSalary, setEditBaseSalary] = useState(0);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), departmentId, level, baseSalary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create position');

      const dep = departments.find((d) => d.id === departmentId);
      setPositions((prev) => [
        ...prev,
        { ...data.data, department: dep, _count: { employees: 0 } },
      ]);
      toast.success(`Position "${title}" created`);
      setAddOpen(false);
      setTitle('');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error creating position');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (pos: PositionItem) => {
    setEditingPosition(pos);
    setEditTitle(pos.title);
    setEditDepartmentId(pos.departmentId || departments[0]?.id || '');
    setEditLevel(pos.level || 'Mid-Level');
    setEditBaseSalary(pos.baseSalary || 50000);
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPosition || !editTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/positions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPosition.id,
          title: editTitle.trim(),
          departmentId: editDepartmentId,
          level: editLevel,
          baseSalary: editBaseSalary,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update position');

      setPositions((prev) =>
        prev.map((p) => (p.id === editingPosition.id ? data.data : p))
      );
      toast.success('Position updated successfully');
      setEditOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error updating position');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete position "${title}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/positions?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete position');

      toast.success('Position deleted');
      setPositions((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting position');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPositions = positions.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.department?.name || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedDept && p.departmentId !== selectedDept) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search positions or departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[#252175]"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={() => setAddOpen(true)}
          className="bg-[#252175] hover:bg-[#1d1a5c] text-white gap-2 font-medium shrink-0"
        >
          <Plus className="size-4 text-[#F37021]" />
          Add Job Position
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold">Designation Title</TableHead>
              <TableHead className="font-semibold">Department</TableHead>
              <TableHead className="font-semibold">Seniority Level</TableHead>
              <TableHead className="font-semibold">Base Salary Scale</TableHead>
              <TableHead className="font-semibold">Current Headcount</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPositions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No positions match your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredPositions.map((pos) => (
                <TableRow key={pos.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-[#252175]/10 dark:bg-[#252175]/30 flex items-center justify-center text-[#252175] dark:text-[#F37021]">
                        <Briefcase className="size-4" />
                      </div>
                      <span className="font-semibold text-sm text-foreground">{pos.title}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {pos.department?.name || 'Cross-Departmental'}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="font-medium text-xs">
                      {pos.level || 'Mid-Level'}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                    {formatCurrency(pos.baseSalary || 50000)} / mo
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground font-medium">
                    {pos._count?.employees || 0} active staff
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-[#252175] dark:text-[#F37021] hover:bg-[#252175]/10"
                        title="Edit Position"
                        onClick={() => handleOpenEdit(pos)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === pos.id}
                        className="size-8 text-destructive hover:bg-destructive/10"
                        title="Delete Position"
                        onClick={() => handleDelete(pos.id, pos.title)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Position Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#252175] dark:text-white flex items-center gap-2">
                <Briefcase className="size-5 text-[#F37021]" />
                Add New Job Position
              </DialogTitle>
              <DialogDescription>Define a standard corporate designation and compensation benchmark.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Position Title *
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1.5"
                  placeholder="e.g. Lead Cloud Architect"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Department
                </Label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#252175]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Seniority Level
                  </Label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#252175]"
                  >
                    <option value="Intern">Intern</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead / Staff">Lead / Staff</option>
                    <option value="Director / Head">Director / Head</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Base Salary ($ / mo)
                  </Label>
                  <Input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="mt-1.5"
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[#252175] hover:bg-[#1d1a5c] text-white">
                {submitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                Create Position
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Position Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#252175] dark:text-white flex items-center gap-2">
                <Pencil className="size-5 text-[#F37021]" />
                Edit Position
              </DialogTitle>
              <DialogDescription>Modify title, department assignment, or benchmark pay.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Position Title
                </Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Department
                </Label>
                <select
                  value={editDepartmentId}
                  onChange={(e) => setEditDepartmentId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#252175]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Seniority Level
                  </Label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#252175]"
                  >
                    <option value="Intern">Intern</option>
                    <option value="Junior">Junior</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead / Staff">Lead / Staff</option>
                    <option value="Director / Head">Director / Head</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Base Salary ($ / mo)
                  </Label>
                  <Input
                    type="number"
                    value={editBaseSalary}
                    onChange={(e) => setEditBaseSalary(Number(e.target.value))}
                    className="mt-1.5"
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[#252175] hover:bg-[#1d1a5c] text-white">
                {submitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

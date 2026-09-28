'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Briefcase, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/date';
import { toast } from 'sonner';

export function PositionsClient({
  initialPositions = [],
  departments = [],
}: {
  initialPositions: any[];
  departments: { id: string; name: string }[];
}) {
  const [positions, setPositions] = useState<any[]>(initialPositions);
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [level, setLevel] = useState('Mid-Level');
  const [baseSalary, setBaseSalary] = useState(55000);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, departmentId, level, baseSalary }),
      });
      const data = await res.json();
      if (data.success) {
        const dep = departments.find((d) => d.id === departmentId);
        setPositions([...positions, { ...data.data, department: dep, _count: { employees: 0 } }]);
        toast.success(`Position "${title}" created`);
        setAddOpen(false);
        setTitle('');
      } else {
        toast.error(data.error || 'Failed to create position');
      }
    } catch {
      toast.error('Network error creating position');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAddOpen(true)} size="sm">
          <Plus className="size-4 mr-1" />
          Add Position
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Designation Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Level / Seniority</TableHead>
              <TableHead>Base Salary Scale</TableHead>
              <TableHead>Headcount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((pos) => (
              <TableRow key={pos.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
                    <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Briefcase className="size-4" />
                    </span>
                    {pos.title}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                  {pos.department?.name || 'All Departments'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{pos.level || 'Mid'}</Badge>
                </TableCell>
                <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                  {formatCurrency(pos.baseSalary || 50000)} / mo
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {pos._count?.employees || 0} employees
                </TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Position Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Position</DialogTitle>
            <DialogDescription>Define a standard organizational job title</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Position Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1"
                placeholder="e.g. Lead Frontend Architect"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Seniority Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Standard Base Salary ($)</label>
              <Input
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Position'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

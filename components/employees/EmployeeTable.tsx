'use client';

import Link from 'next/link';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/date';
import { Eye, Edit3, Trash2, Plus, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

export interface EmployeeTableProps {
  employees: any[];
  onDelete?: (id: string) => void;
  onAssignTask?: (employee: any) => void;
}

export function EmployeeTable({ employees = [], onDelete, onAssignTask }: EmployeeTableProps) {
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Employee ${name} deleted`);
        if (onDelete) onDelete(id);
      } else {
        toast.error(data.error || 'Failed to delete employee');
      }
    } catch {
      toast.error('Error deleting employee');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Assigned Tasks</TableHead>
            <TableHead>Workload</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                No employees found matching criteria.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((emp) => {
              const fullName = `${emp.firstName} ${emp.lastName}`;
              const initials = `${emp.firstName[0] || ''}${emp.lastName[0] || ''}`.toUpperCase();
              const tasks = emp.tasks || [];
              const activeTasks = tasks.filter((t: any) => t.status !== 'DONE');
              const topTask = activeTasks[0] || tasks[0];

              return (
                <TableRow key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar initials={initials} src={emp.photoUrl} size="sm" />
                      <div className="min-w-0">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors block truncate"
                        >
                          {fullName}
                        </Link>
                        <p className="text-xs text-slate-400 truncate">{emp.position?.title || emp.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {emp.employeeCode}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                    {emp.department?.name || 'General'}
                  </TableCell>
                  <TableCell>
                    {topTask ? (
                      <div className="max-w-[200px]">
                        <p className="text-xs font-medium text-foreground truncate" title={topTask.title}>
                          {topTask.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {activeTasks.length} active {activeTasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No active tasks</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        activeTasks.length === 0
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : activeTasks.length <= 2
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          activeTasks.length === 0
                            ? 'bg-emerald-500'
                            : activeTasks.length <= 2
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      {activeTasks.length === 0
                        ? 'Available'
                        : activeTasks.length <= 2
                        ? 'Light Load'
                        : 'Active Load'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onAssignTask?.(emp)}
                        title="Assign Task"
                        className="h-8 gap-1 px-2 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Plus className="size-3.5" />
                        <span className="hidden sm:inline">Assign</span>
                      </Button>

                      <Link
                        href={`/employees/${emp.id}`}
                        title="View Profile"
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <Eye className="size-4" />
                      </Link>

                      <Link
                        href={`/employees/${emp.id}/edit`}
                        title="Edit Record"
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <Edit3 className="size-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(emp.id, fullName)}
                        title="Delete Employee"
                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

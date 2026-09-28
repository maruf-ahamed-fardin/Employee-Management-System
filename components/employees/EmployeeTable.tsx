'use client';

import Link from 'next/link';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils/date';
import { Eye, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export interface EmployeeTableProps {
  employees: any[];
  onDelete?: (id: string) => void;
}

export function EmployeeTable({ employees = [], onDelete }: EmployeeTableProps) {
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
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
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

              return (
                <TableRow key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar initials={initials} src={emp.photoUrl} size="sm" />
                      <div>
                        <Link
                          href={`/employees/${emp.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors"
                        >
                          {fullName}
                        </Link>
                        <p className="text-xs text-slate-400">{emp.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {emp.employeeCode}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                    {emp.department?.name || 'General'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                    {emp.position?.title || 'Staff'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(emp.joiningDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
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

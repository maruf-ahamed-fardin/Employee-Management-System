'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckSquare, Calendar, Flag, Tag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface AssignEmployeeOption {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  department?: { name: string } | null;
  position?: { title: string } | null;
}

export function AssignTaskModal({
  open,
  onOpenChange,
  targetEmployee,
  allEmployees = [],
  onTaskAssigned,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetEmployee?: AssignEmployeeOption | null;
  allEmployees?: AssignEmployeeOption[];
  onTaskAssigned?: (createdTask: any) => void;
}) {
  const [employeeId, setEmployeeId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS'>('TODO');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (targetEmployee) {
      setEmployeeId(targetEmployee.id);
    } else if (allEmployees.length > 0 && !employeeId) {
      setEmployeeId(allEmployees[0].id);
    }
  }, [targetEmployee, allEmployees, employeeId]);

  const selectedEmp =
    (targetEmployee && targetEmployee.id === employeeId ? targetEmployee : null) ||
    allEmployees.find((e) => e.id === employeeId);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setStatus('TODO');
    setCategory('General');
    setDueDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error('Please select an employee');
      return;
    }
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          category,
          dueDate: dueDate || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Task assigned to ${selectedEmp?.firstName || 'employee'}!`);
        resetForm();
        onOpenChange(false);
        if (onTaskAssigned) {
          onTaskAssigned(data.data);
        }
      } else {
        toast.error(data.error || 'Failed to assign task');
      }
    } catch {
      toast.error('Network error assigning task');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (emp?: AssignEmployeeOption | null) => {
    if (!emp) return 'EM';
    return `${emp.firstName?.[0] || ''}${emp.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <CheckSquare className="size-5" />
            <span className="text-xs font-bold tracking-wider uppercase">Task Assignment</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Assign Work to Team Member
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Directly delegate responsibilities, set deadlines, and track employee workload.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Target Employee Info or Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Assigned Employee *
            </label>
            {targetEmployee ? (
              <div className="mt-1.5 flex items-center gap-3 p-2.5 rounded-xl border border-border bg-secondary/40">
                <Avatar className="size-10 ring-2 ring-primary/20">
                  {targetEmployee.photoUrl && (
                    <AvatarImage src={targetEmployee.photoUrl} alt={targetEmployee.firstName} />
                  )}
                  <AvatarFallback className="bg-[#252175] text-[#F37021] text-xs font-bold">
                    {getInitials(targetEmployee)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">
                    {targetEmployee.firstName} {targetEmployee.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {targetEmployee.position?.title || 'Staff'} ·{' '}
                    {targetEmployee.department?.name || 'Department'}
                  </p>
                </div>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                  {targetEmployee.employeeCode}
                </span>
              </div>
            ) : (
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="mt-1.5 w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {allEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode}) —{' '}
                    {emp.department?.name || 'Staff'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Task Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Task Title *
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Audit Q4 tax withholding reports, Redesign navigation bar..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {/* Priority & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Flag className="size-3.5 text-muted-foreground" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="mt-1.5 w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="LOW">🟢 Low Priority</option>
                <option value="MEDIUM">🔵 Medium Priority</option>
                <option value="HIGH">🟡 High Priority</option>
                <option value="URGENT">🔴 Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="size-3.5 text-muted-foreground" />
                Category / Project
              </label>
              <Input
                type="text"
                placeholder="e.g. Engineering, Design, Operations..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 text-xs"
              />
            </div>
          </div>

          {/* Due Date & Initial Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="mt-1.5 w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="TODO">To Do (Not Started)</option>
                <option value="IN_PROGRESS">In Progress</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Detailed Instructions / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Add key deliverables, acceptance criteria, or context for the employee..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting} className="font-semibold gap-1.5">
              <CheckSquare className="size-4" />
              {submitting ? 'Assigning...' : 'Assign Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

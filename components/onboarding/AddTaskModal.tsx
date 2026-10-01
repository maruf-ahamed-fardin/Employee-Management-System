'use client';

import React, { useState } from 'react';
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
import { ClipboardCheck, User, Tag } from 'lucide-react';
import { toast } from 'sonner';

export function AddTaskModal({
  open,
  onOpenChange,
  employees = [],
  defaultEmployeeId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: any[];
  defaultEmployeeId?: string;
  onSuccess?: () => void;
}) {
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId || employees[0]?.id || '');
  const [type, setType] = useState('ONBOARDING');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('HR');
  const [assignedTo, setAssignedTo] = useState('HR Operations');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (defaultEmployeeId) {
      setEmployeeId(defaultEmployeeId);
    } else if (employees.length > 0 && !employeeId) {
      setEmployeeId(employees[0].id);
    }
  }, [defaultEmployeeId, employees, employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !title.trim()) {
      toast.error('Employee and task title are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          type,
          title: title.trim(),
          category,
          assignedTo: assignedTo.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to add task');

      toast.success('Task added to employee checklist');
      setTitle('');
      setNotes('');
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error adding task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ClipboardCheck className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">Add Lifecycle Task</DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Create a checklist milestone for new hire onboarding or exit clearance.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Lifecycle Stage</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'ONBOARDING', label: '🐣 New Hire Onboarding' },
                { id: 'OFFBOARDING', label: '🚪 Exit / Offboarding' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                    type === item.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Employee */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Task Milestone <span className="text-red-400">*</span>
            </label>
            <Input
              required
              placeholder="e.g. Issue Workstation & M2 Mac, Collect Signed NDA"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white text-xs focus:border-indigo-500"
            />
          </div>

          {/* Category & Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="HR">HR / Compliance</option>
                <option value="IT">IT / Equipment</option>
                <option value="FINANCE">Finance / Payroll</option>
                <option value="ADMIN">Admin / Facility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Department</label>
              <Input
                placeholder="e.g. IT Operations"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="bg-slate-950 border-slate-700 text-white text-xs focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Requires serial number logging in Assets registry."
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs shadow-md shadow-indigo-600/25"
            >
              {submitting ? 'Adding...' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { User, Tag, Laptop, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AssignAssetModal({
  open,
  onOpenChange,
  asset,
  employees = [],
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: any | null;
  employees: any[];
  onSuccess?: () => void;
}) {
  const [employeeId, setEmployeeId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (asset?.assignedToId) {
      setEmployeeId(asset.assignedToId);
    } else if (employees.length > 0) {
      setEmployeeId(employees[0].id);
    }
  }, [asset, employees]);

  if (!asset) return null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error('Please select an employee');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN',
          employeeId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to assign asset');
      }

      toast.success(`Asset assigned successfully to employee`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error assigning asset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white">Assign Asset</DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Issue hardware device to a verified employee.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Asset Brief */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">{asset.name}</span>
            <span className="font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px]">
              {asset.assetTag}
            </span>
          </div>
          {asset.model && <p className="text-slate-400">{asset.model}</p>}
          {asset.serialNumber && (
            <p className="text-slate-500 font-mono text-[10px]">SN: {asset.serialNumber}</p>
          )}
        </div>

        <form onSubmit={handleAssign} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Assignee (Employee) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="w-full h-11 pl-9 pr-3 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode}) — {emp.department?.name || 'Staff'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-2.5 text-slate-400 text-xs">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              Once assigned, this asset will automatically reflect in the employee's personal profile and audit log.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 text-xs"
            >
              {submitting ? 'Assigning...' : 'Confirm Handover'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

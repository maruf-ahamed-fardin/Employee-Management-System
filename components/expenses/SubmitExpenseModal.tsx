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
import { Receipt, DollarSign, Tag, FileText, Upload, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export function SubmitExpenseModal({
  open,
  onOpenChange,
  employees = [],
  currentEmployeeId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: any[];
  currentEmployeeId?: string;
  onSuccess?: () => void;
}) {
  const [employeeId, setEmployeeId] = useState(currentEmployeeId || employees[0]?.id || '');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('TRAVEL');
  const [notes, setNotes] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (currentEmployeeId) {
      setEmployeeId(currentEmployeeId);
    } else if (employees.length > 0 && !employeeId) {
      setEmployeeId(employees[0].id);
    }
  }, [currentEmployeeId, employees, employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !title.trim() || !amount || Number(amount) <= 0) {
      toast.error('Please enter a valid title and amount');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          title: title.trim(),
          amount: Number(amount),
          category,
          notes: notes.trim(),
          receiptName: receiptName || 'expense-receipt.pdf',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Expense claim submitted for approval!');
        setTitle('');
        setAmount('');
        setNotes('');
        setReceiptName('');
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error || 'Failed to submit claim');
      }
    } catch {
      toast.error('Network error submitting claim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Receipt className="size-5" />
            <span className="text-xs font-bold tracking-wider uppercase">Reimbursement</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Claim Business Expense
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Submit receipts for business travel, client meals, certifications, or equipment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          {/* Employee Selector (if multiple available) */}
          <div>
            <label className="text-xs font-bold text-foreground">Claiming Employee *</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-foreground">Expense Title / Purpose *</label>
            <Input
              type="text"
              required
              placeholder="e.g. Uber rides for client visit, AWS certification voucher..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground">Amount (BDT) *</label>
              <Input
                type="number"
                required
                min="1"
                step="any"
                placeholder="e.g. 4500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 text-xs"
              >
                <option value="TRAVEL">✈️ Travel & Commute</option>
                <option value="MEALS">🍽️ Client / Team Meals</option>
                <option value="TRAINING">🎓 Training & Certifications</option>
                <option value="EQUIPMENT">💻 Equipment & Hardware</option>
                <option value="MEDICAL">💊 Medical / Health</option>
                <option value="OTHER">📦 General Office / Other</option>
              </select>
            </div>
          </div>

          {/* Receipt Attachment Name */}
          <div>
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Upload className="size-3.5 text-muted-foreground" />
              Receipt / Invoice Voucher
            </label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                type="text"
                placeholder="e.g. receipt-sep-2026.pdf (or cash-memo.jpg)"
                value={receiptName}
                onChange={(e) => setReceiptName(e.target.value)}
                className="text-xs flex-1 font-mono"
              />
              <span className="text-[11px] text-muted-foreground bg-secondary px-2 py-2 rounded-lg shrink-0">
                PDF / JPG
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-foreground">Justification / Details</label>
            <textarea
              rows={2}
              placeholder="Provide context on why this business expense was incurred..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <DialogFooter className="pt-2">
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
              <Receipt className="size-3.5" />
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

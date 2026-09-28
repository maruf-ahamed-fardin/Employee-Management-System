'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  balanceId: string;
  leaveTypeName: string;
  employeeName?: string;
  currentAllocated: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function BalanceAdjustDialog({
  balanceId,
  leaveTypeName,
  employeeName,
  currentAllocated,
  trigger,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [adjustmentDays, setAdjustmentDays] = useState('1');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const days = parseFloat(adjustmentDays);
    if (isNaN(days) || days === 0) {
      toast.error('Please enter a valid non-zero adjustment');
      return;
    }
    if (!reason.trim()) {
      toast.error('Adjustment reason is required for audit trail');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/leave/balances/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          balanceId,
          adjustmentDays: days,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to adjust balance');

      toast.success(data.message || 'Leave balance updated');
      setOpen(false);
      setReason('');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error adjusting balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Adjust Leave Quota"
          >
            <SlidersHorizontal className="size-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#252175] dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="size-5 text-[#F37021]" />
              Adjust {leaveTypeName} Allowance
            </DialogTitle>
            <DialogDescription>
              {employeeName ? `Modifying quota for ${employeeName}. ` : ''}
              Current allocation: <strong className="text-foreground">{currentAllocated} days</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Adjustment Days (+/-)
              </Label>
              <Input
                type="number"
                step="0.5"
                placeholder="e.g. 2 or -1"
                className="mt-1.5"
                value={adjustmentDays}
                onChange={(e) => setAdjustmentDays(e.target.value)}
                required
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Enter a positive number to add quota (e.g. compensatory off), or negative to deduct.
              </p>
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Audit Reason
              </Label>
              <Textarea
                placeholder="e.g. Approved compensatory off for weekend product release duty"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1.5"
                rows={3}
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#252175] hover:bg-[#1d1a5c] text-white"
            >
              {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Save Adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

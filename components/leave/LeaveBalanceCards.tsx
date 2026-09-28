'use client';

import { BalanceAdjustDialog } from './BalanceAdjustDialog';

export interface LeaveBalanceItem {
  id: string;
  leaveTypeName: string;
  allocated: number;
  used: number;
  pending?: number;
  available: number;
  carriedForward?: number;
}

interface Props {
  balances: LeaveBalanceItem[];
  canManage?: boolean;
  onRefresh?: () => void;
}

export function LeaveBalanceCards({ balances, canManage = false, onRefresh }: Props) {
  if (balances.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
        No leave quotas allocated for the current fiscal year.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {balances.map((b) => {
        const total = Math.max(b.allocated + (b.carriedForward || 0), 1);
        const usedPct = Math.min(100, Math.round((b.used / total) * 100));
        const pendingPct = Math.min(100 - usedPct, Math.round(((b.pending || 0) / total) * 100));
        const availableDays = Math.max(0, b.available);

        return (
          <div
            key={b.id}
            className="rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-foreground text-sm tracking-tight">
                  {b.leaveTypeName}
                </span>
                {canManage && (
                  <BalanceAdjustDialog
                    balanceId={b.id}
                    leaveTypeName={b.leaveTypeName}
                    currentAllocated={b.allocated}
                    onSuccess={onRefresh}
                  />
                )}
              </div>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-[#252175] dark:text-[#F37021]">
                  {availableDays}
                </span>
                <span className="text-xs text-muted-foreground font-medium">days left</span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted flex">
                <div
                  className="bg-[#252175] dark:bg-[#F37021] transition-all"
                  style={{ width: `${usedPct}%` }}
                  title={`Used: ${b.used}d`}
                />
                <div
                  className="bg-amber-400 transition-all"
                  style={{ width: `${pendingPct}%` }}
                  title={`Pending: ${b.pending || 0}d`}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>Used: {b.used}d</span>
              {Boolean(b.pending) && <span className="text-amber-600">Pending: {b.pending}d</span>}
              <span>Total: {b.allocated}d</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

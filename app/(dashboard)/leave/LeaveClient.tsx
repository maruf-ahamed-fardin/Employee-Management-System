'use client';

import { useState } from 'react';
import { LeaveBalanceCards } from '@/components/leave/LeaveBalanceCards';
import { LeaveRequestModal } from '@/components/leave/LeaveRequestModal';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils/date';
import { Plus, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function LeaveClient({
  initialBalances = [],
  initialRequests = [],
  leaveTypes = [],
  userRole = 'employee',
}: {
  initialBalances: any[];
  initialRequests: any[];
  leaveTypes: any[];
  userRole: string;
}) {
  const [requests, setRequests] = useState<any[]>(initialRequests);
  const [requestOpen, setRequestOpen] = useState(false);

  const canApprove = userRole === 'superadmin' || userRole === 'admin' || userRole === 'manager';

  const handleReview = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status } : r))
        );
        toast.success(`Leave request ${status.toLowerCase()}`);
      } else {
        toast.error(data.error || 'Failed to review request');
      }
    } catch {
      toast.error('Network error reviewing request');
    }
  };

  const handleRefresh = async () => {
    try {
      const res = await fetch('/api/leave');
      const data = await res.json();
      if (data.success) {
        setRequests(data.data.items || []);
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Balances Tiles */}
      <LeaveBalanceCards
        balances={initialBalances}
        canManage={canApprove}
        onRefresh={() => window.location.reload()}
      />

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Leave Applications
        </h2>
        <Button onClick={() => setRequestOpen(true)} size="sm">
          <Plus className="size-4 mr-1" />
          Apply for Leave
        </Button>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              {canApprove && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                  No leave applications on record.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((r) => {
                const fullName = `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`;
                const initials = `${r.employee?.firstName?.[0] || ''}${r.employee?.lastName?.[0] || ''}`;

                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar initials={initials || 'EM'} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">
                            {fullName || 'Staff Member'}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">
                            {r.employee?.employeeCode}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {r.leaveType?.name || 'Annual Leave'}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(r.startDate)} → {formatDate(r.endDate)}
                    </TableCell>
                    <TableCell className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {r.days} days
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {r.reason}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.status === 'APPROVED'
                            ? 'success'
                            : r.status === 'REJECTED'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    {canApprove && (
                      <TableCell className="text-right">
                        {r.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleReview(r.id, 'APPROVED')}
                              title="Approve"
                              className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 grid place-items-center cursor-pointer"
                            >
                              <Check className="size-4" />
                            </button>
                            <button
                              onClick={() => handleReview(r.id, 'REJECTED')}
                              title="Reject"
                              className="size-7 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 grid place-items-center cursor-pointer"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Reviewed</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <LeaveRequestModal
        open={requestOpen}
        onOpenChange={setRequestOpen}
        leaveTypes={leaveTypes}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

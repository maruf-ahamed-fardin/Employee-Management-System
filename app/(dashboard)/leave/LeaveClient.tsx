'use client';

import React, { useState, useMemo } from 'react';
import { LeaveBalanceCards } from '@/components/leave/LeaveBalanceCards';
import { LeaveRequestModal } from '@/components/leave/LeaveRequestModal';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils/date';
import {
  Plus,
  Check,
  X,
  Search,
  Download,
  Calendar,
  Filter,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/format';

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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const canApprove = userRole === 'superadmin' || userRole === 'admin' || userRole === 'manager';

  const handleReview = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewingId(requestId);
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
        toast.success(`Leave request ${status.toLowerCase()} successfully!`);
      } else {
        toast.error(data.error || 'Failed to review request');
      }
    } catch {
      toast.error('Network error reviewing request');
    } finally {
      setReviewingId(null);
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

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === 'PENDING').length,
      approved: requests.filter((r) => r.status === 'APPROVED').length,
      rejected: requests.filter((r) => r.status === 'REJECTED').length,
    };
  }, [requests]);

  // Filtered Leave Applications
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Status filter
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;

      // Leave Type filter
      if (leaveTypeFilter && r.leaveType?.id !== leaveTypeFilter && r.leaveType?.name !== leaveTypeFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const empName = `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`.toLowerCase();
        const empCode = (r.employee?.employeeCode || '').toLowerCase();
        const reason = (r.reason || '').toLowerCase();
        const typeName = (r.leaveType?.name || '').toLowerCase();
        if (!empName.includes(q) && !empCode.includes(q) && !reason.includes(q) && !typeName.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [requests, statusFilter, leaveTypeFilter, searchQuery]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredRequests.length === 0) {
      toast.error('No leave records to export');
      return;
    }

    const headers = [
      'Employee Code',
      'Employee Name',
      'Department',
      'Leave Type',
      'Start Date',
      'End Date',
      'Duration (Days)',
      'Reason',
      'Status',
    ];

    const rows = filteredRequests.map((r) => {
      const code = `"${r.employee?.employeeCode || ''}"`;
      const name = `"${r.employee?.firstName || ''} ${r.employee?.lastName || ''}"`;
      const dept = `"${r.employee?.department?.name || 'General'}"`;
      const type = `"${r.leaveType?.name || ''}"`;
      const start = `"${r.startDate || ''}"`;
      const end = `"${r.endDate || ''}"`;
      const duration = r.duration || 1;
      const reason = `"${(r.reason || '').replace(/"/g, '""')}"`;
      const status = `"${r.status || ''}"`;

      return [code, name, dept, type, start, end, duration, reason, status].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `selorax_leave_requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Leave report exported to CSV!');
  };

  return (
    <div className="space-y-6">
      {/* ─── 1. Symmetrical 8-Card Quota Hub ─────────────────────────────────── */}
      <LeaveBalanceCards
        balances={initialBalances}
        canManage={canApprove}
        onRefresh={() => window.location.reload()}
      />

      {/* ─── 2. Smart Interactive Control & Filter Toolbar ──────────────────── */}
      <div className="flex flex-col gap-4 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1222] shadow-sm">
        {/* Top Row: Section Heading, Status Pill Tabs & Primary Action */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Leave Applications</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F37021]/15 text-[#F37021]">
                {filteredRequests.length}
              </span>
            </h2>
          </div>

          {/* Status Tabs Filter */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5',
                statusFilter === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-amber-600 dark:hover:text-amber-400'
              )}
            >
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Pending ({counts.pending})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('APPROVED')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                statusFilter === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
              )}
            >
              Approved ({counts.approved})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('REJECTED')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                statusFilter === 'REJECTED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-rose-600 dark:hover:text-rose-400'
              )}
            >
              Rejected ({counts.rejected})
            </button>
          </div>

          {/* Primary Action Button */}
          <Button
            onClick={() => setRequestOpen(true)}
            className="h-10 px-5 rounded-2xl bg-gradient-to-r from-[#F37021] to-[#ff8838] hover:from-[#e06114] hover:to-[#f37021] text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="size-4 mr-1.5" />
            Apply for Leave
          </Button>
        </div>

        {/* Bottom Row: Search, Type Filter & Export CSV */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by staff, ID or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F37021]"
              />
            </div>

            {/* Leave Type Dropdown Filter */}
            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
            >
              <option value="">All Leave Types</option>
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 self-end sm:self-auto"
            title="Download CSV leave report"
          >
            <Download className="size-3.5 text-[#F37021]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ─── 3. Leave Applications Display (Desktop Table + Mobile Cards) ─────── */}
      {/* 3A. Desktop Table View */}
      <div className="hidden md:block">
        <div className="rounded-3xl border border-slate-200/80 bg-white dark:bg-[#0c1222] dark:border-slate-800 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
              <TableRow>
                <TableHead className="py-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Employee
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Leave Type
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Period
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Duration
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Reason
                </TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </TableHead>
                {canApprove && (
                  <TableHead className="pr-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-44 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
                      <Clock className="size-8 text-slate-300 dark:text-slate-600 mb-1" />
                      <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                        No leave applications found
                      </p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        No requests match your current filters. Click "Apply for Leave" to submit a new request.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => {
                  const fullName = `${req.employee?.firstName || ''} ${req.employee?.lastName || ''}`;
                  const initials = `${req.employee?.firstName?.[0] || ''}${req.employee?.lastName?.[0] || ''}`;

                  return (
                    <TableRow
                      key={req.id}
                      className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-[#111827]/70 transition-colors"
                    >
                      {/* Employee Profile */}
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            initials={initials || 'EM'}
                            size="sm"
                            className="ring-2 ring-slate-100 dark:ring-slate-800"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs">
                              {fullName || 'Staff Member'}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400">
                              {req.employee?.employeeCode}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Leave Type */}
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {req.leaveType?.name || 'General'}
                        </span>
                      </TableCell>

                      {/* Period */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <Calendar className="size-3.5 text-[#F37021] shrink-0" />
                          <span>
                            {formatDate(req.startDate)} – {formatDate(req.endDate)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Duration */}
                      <TableCell>
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                          {req.duration || 1} {req.duration === 1 ? 'day' : 'days'}
                        </span>
                      </TableCell>

                      {/* Reason */}
                      <TableCell className="max-w-[200px]">
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate" title={req.reason}>
                          {req.reason || 'No details provided'}
                        </p>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={
                            req.status === 'APPROVED'
                              ? 'success'
                              : req.status === 'PENDING'
                              ? 'warning'
                              : 'destructive'
                          }
                          className="font-bold text-[10px] px-2.5 py-0.5 rounded-md"
                        >
                          {req.status}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      {canApprove && (
                        <TableCell className="pr-6 text-right">
                          {req.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={reviewingId === req.id}
                                onClick={() => handleReview(req.id, 'APPROVED')}
                                className="h-8 px-2.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-500/30 font-bold text-xs"
                                title="Approve Request"
                              >
                                <Check className="size-3.5 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={reviewingId === req.id}
                                onClick={() => handleReview(req.id, 'REJECTED')}
                                className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-500/30 font-bold text-xs"
                                title="Reject Request"
                              >
                                <X className="size-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400 italic">
                              Reviewed
                            </span>
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
      </div>

      {/* 3B. Mobile Cards View (Zero Horizontal Scroll on Phone Screens) */}
      <div className="block md:hidden space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-8 text-center text-slate-400">
            <Clock className="size-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
              No leave applications found
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Click "Apply for Leave" to create a new request.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const fullName = `${req.employee?.firstName || ''} ${req.employee?.lastName || ''}`;
            const initials = `${req.employee?.firstName?.[0] || ''}${req.employee?.lastName?.[0] || ''}`;

            return (
              <div
                key={req.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-4 shadow-sm space-y-3 hover:border-[#F37021]/40 transition-all"
              >
                {/* Header: Avatar, Name & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar initials={initials || 'EM'} size="sm" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {fullName || 'Staff Member'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {req.employee?.employeeCode}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      req.status === 'APPROVED'
                        ? 'success'
                        : req.status === 'PENDING'
                        ? 'warning'
                        : 'destructive'
                    }
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    {req.status}
                  </Badge>
                </div>

                {/* Details Strip */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {req.leaveType?.name || 'Leave'}
                    </span>
                    <span className="font-mono font-black text-[#F37021]">
                      {req.duration || 1} {req.duration === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Calendar className="size-3 text-[#F37021] shrink-0" />
                    <span>
                      {formatDate(req.startDate)} – {formatDate(req.endDate)}
                    </span>
                  </div>
                </div>

                {/* Reason Text */}
                {req.reason && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    "{req.reason}"
                  </p>
                )}

                {/* Mobile Action Buttons */}
                {canApprove && req.status === 'PENDING' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      size="sm"
                      disabled={reviewingId === req.id}
                      onClick={() => handleReview(req.id, 'APPROVED')}
                      className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      <Check className="size-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={reviewingId === req.id}
                      onClick={() => handleReview(req.id, 'REJECTED')}
                      className="flex-1 h-9 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-500/30 font-bold text-xs"
                    >
                      <X className="size-3.5 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ─── 4. Leave Request Modal ─────────────────────────────────────────── */}
      <LeaveRequestModal
        open={requestOpen}
        onOpenChange={setRequestOpen}
        leaveTypes={leaveTypes}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

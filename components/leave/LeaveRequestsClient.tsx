'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  MessageSquare,
  Loader2,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export interface LeaveRequestRow {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export function LeaveRequestsClient({
  initialRequests,
}: {
  initialRequests: LeaveRequestRow[];
}) {
  const [requests, setRequests] = useState<LeaveRequestRow[]>(initialRequests);
  const [view, setView] = useState<'WAITING' | 'APPROVED' | 'REJECTED' | 'ALL'>('WAITING');
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const filtered = requests.filter((r) => {
    if (view === 'WAITING') return r.status === 'PENDING';
    if (view === 'APPROVED') return r.status === 'APPROVED';
    if (view === 'REJECTED') return r.status === 'REJECTED';
    return true;
  });

  const waitingCount = requests.filter((r) => r.status === 'PENDING').length;

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/leave/requests/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNote }),
      });

      if (!res.ok) throw new Error(`Failed to ${action} leave request`);

      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: action === 'approve' ? 'APPROVED' : 'REJECTED',
                reviewNote,
              }
            : r
        )
      );
      setActiveReviewId(null);
      setReviewNote('');
    } catch (e: any) {
      toast.error(e.message || 'Operation failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Views Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <button
          onClick={() => setView('WAITING')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            view === 'WAITING'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground'
          }`}
        >
          <span>Waiting for You</span>
          {waitingCount > 0 && (
            <span className="rounded-full bg-[#F37021] text-white px-2 py-0.2 text-[10px] font-bold">
              {waitingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setView('APPROVED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            view === 'APPROVED'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground'
          }`}
        >
          Approved
        </button>

        <button
          onClick={() => setView('REJECTED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            view === 'REJECTED'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground'
          }`}
        >
          Rejected
        </button>

        <button
          onClick={() => setView('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            view === 'ALL'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground'
          }`}
        >
          All Requests ({requests.length})
        </button>
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card">
          <div className="size-12 rounded-2xl bg-accent text-primary flex items-center justify-center mx-auto mb-3">
            <Inbox className="size-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {view === 'WAITING' ? 'No pending requests waiting for your decision' : 'No requests here'}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {view === 'WAITING'
              ? 'New leave applications from team members will appear here.'
              : 'Check back later or adjust active status filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((req) => (
            <article
              key={req.id}
              className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-primary/40 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="size-11 rounded-2xl bg-[#252175] text-[#F37021] font-extrabold flex items-center justify-center text-sm ring-2 ring-card shadow-xs shrink-0">
                    {req.employeeName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/employees/${req.employeeId}`}
                        className="text-sm font-bold text-foreground hover:text-primary hover:underline"
                      >
                        {req.employeeName}
                      </Link>
                      <span className="text-xs text-muted-foreground font-medium">
                        · {req.department}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-accent px-2.5 py-0.5 font-semibold text-accent-foreground border border-primary/20">
                        {req.leaveType}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {req.startDate} to {req.endDate}
                      </span>
                      <span className="font-bold text-foreground">
                        ({req.days} {req.days === 1 ? 'day' : 'days'})
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground italic pt-1">
                      &ldquo;{req.reason}&rdquo;
                    </p>

                    {req.reviewNote && (
                      <p className="text-xs text-primary font-medium bg-primary/5 p-2 rounded-lg mt-2 inline-block">
                        <strong>Review Note:</strong> {req.reviewNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Badge & Action Buttons */}
                <div className="flex flex-col items-start md:items-end gap-2.5 shrink-0">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold border ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                        : req.status === 'CANCELLED'
                        ? 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                    }`}
                  >
                    {req.status}
                  </span>

                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveReviewId(activeReviewId === req.id ? null : req.id);
                        }}
                        className="text-xs font-semibold h-8"
                      >
                        <MessageSquare className="size-3.5 mr-1" />
                        <span>Decide</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Comment Box for Decision */}
              {activeReviewId === req.id && (
                <div className="border-t border-border/60 pt-3 bg-secondary/30 -mx-5 -mb-5 p-4 rounded-b-2xl space-y-3 animate-in fade-in-50 duration-150">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Decision Note / Comments (Optional)
                    </label>
                    <Input
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="e.g. Approved. Please hand over pending tasks."
                      className="text-xs h-9 bg-card"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveReviewId(null)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={processing}
                      onClick={() => handleAction(req.id, 'reject')}
                      className="text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30"
                    >
                      {processing ? <Loader2 className="size-3 animate-spin mr-1" /> : <X className="size-3.5 mr-1" />}
                      Reject Request
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      disabled={processing}
                      onClick={() => handleAction(req.id, 'approve')}
                      className="text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {processing ? <Loader2 className="size-3 animate-spin mr-1" /> : <Check className="size-3.5 mr-1" />}
                      Approve Request
                    </Button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

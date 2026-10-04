'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Clock,
  LogIn,
  LogOut,
  RotateCcw,
  CalendarPlus,
  Receipt,
  CheckSquare,
  CreditCard,
  Sparkles,
  MapPin,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaveRequestModal } from '@/components/leave/LeaveRequestModal';
import { SubmitExpenseModal } from '@/components/expenses/SubmitExpenseModal';
import { AssignTaskModal } from '@/components/employees/AssignTaskModal';
import { useAttendanceStore } from '@/stores/attendance.store';
import { formatTime, formatDuration } from '@/lib/utils/date';
import { toast } from 'sonner';
import Link from 'next/link';
import { confirmDialog } from '@/components/ui/confirm';

export function DashboardHero({
  leaveTypes = [],
  employees = [],
}: {
  leaveTypes?: any[];
  employees?: any[];
}) {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Good Day');

  // Modals state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Global synchronized attendance state
  const {
    attendance,
    isCheckedIn,
    isCheckedOut,
    isPunching,
    fetchToday,
    punch,
    resumeShift,
  } = useAttendanceStore();

  const [elapsed, setElapsed] = useState<string>('');

  // Fetch initial attendance on mount
  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  // Listen to broadcast events from LivePunchTerminal or Header
  useEffect(() => {
    const handleBroadcast = (e: any) => {
      if (e?.detail?.attendance) {
        useAttendanceStore.getState().setAttendance(e.detail.attendance);
      } else {
        fetchToday();
      }
    };
    window.addEventListener('ems:attendance-changed', handleBroadcast);
    return () => window.removeEventListener('ems:attendance-changed', handleBroadcast);
  }, [fetchToday]);

  // Live stopwatch when checked in
  useEffect(() => {
    if (!isCheckedIn || !attendance?.firstInAt) {
      setElapsed('');
      return;
    }

    const start = new Date(attendance.firstInAt).getTime();
    const update = () => {
      const diffSecs = Math.max(0, Math.floor((Date.now() - start) / 1000));
      const h = Math.floor(diffSecs / 3600);
      const m = Math.floor((diffSecs % 3600) / 60);
      const s = diffSecs % 60;
      setElapsed(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, attendance?.firstInAt]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();

      if (hours < 12) setGreeting('Good morning');
      else if (hours < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');

      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );

      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePunchAction = async () => {
    if (isCheckedIn) {
      const confirmed = await confirmDialog({
        title: 'Check out for today?',
        description: 'This ends your workday and stops the timer. You can resume the shift if you check out by mistake.',
        confirmLabel: 'Check Out',
        cancelLabel: 'Keep Working',
        tone: 'warning',
      });
      if (!confirmed) return;
    }
    const action = isCheckedIn ? 'CHECK_OUT' : 'CHECK_IN';
    await punch(action);
  };

  const displayName = user?.employeeName || user?.email?.split('@')[0] || 'Team Member';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-[#131b2e] to-[#0c1222] p-6 lg:p-7 text-white shadow-xl shadow-slate-950/20">
      {/* Background Ambient Glows */}
      <div className="absolute -right-16 -top-20 size-72 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-20 size-72 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Personalized Greeting & Live Clock */}
        <div className="space-y-2">
          {/* Status Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Dhaka HQ Operational
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono">
              <Clock className="size-3 text-indigo-400" />
              {timeStr || '16:30:00 PM'}
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">• {dateStr}</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>{greeting}, {displayName}</span>
            <span className="inline-block animate-wave origin-bottom-right">👋</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Welcome back to SeloraX EMS. Track team workloads, approve requests, and monitor presence in real time.
          </p>
        </div>

        {/* Right: Presence Station & Quick Action Dock */}
        <div className="w-full lg:w-auto flex flex-col items-start lg:items-end gap-3.5 pt-2 lg:pt-0">
          {/* Dedicated Workday Presence Pod */}
          <div className="w-full sm:w-[430px] rounded-2xl bg-slate-950/80 border border-slate-700/70 p-4 backdrop-blur-xl shadow-xl shadow-slate-950/40 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isCheckedIn
                        ? 'bg-emerald-400'
                        : isCheckedOut
                        ? 'bg-indigo-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full size-2.5 ${
                      isCheckedIn
                        ? 'bg-emerald-500'
                        : isCheckedOut
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {isCheckedIn
                    ? 'Active Workday'
                    : isCheckedOut
                    ? 'Workday Finished'
                    : 'Awaiting Check-In'}
                </span>
              </div>

              {/* Status / Stopwatch Badge */}
              {isCheckedIn ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs">
                  <Clock className="size-3 text-emerald-400 animate-pulse" />
                  <span>{elapsed || '00:00:00'}</span>
                </div>
              ) : isCheckedOut ? (
                <span className="text-[11px] font-bold text-emerald-400 font-mono">
                  {formatDuration(attendance?.workedMinutes || 0)} Worked
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-mono">
                  Shift: 09:00 – 17:00
                </span>
              )}
            </div>

            {/* Main Action Button */}
            <div>
              {isCheckedOut ? (
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <span className="flex items-center gap-2 font-bold whitespace-nowrap">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    Shift Completed Today
                  </span>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => resumeShift()}
                      disabled={isPunching}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm hover:shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                      title="Accidentally checked out? Click to resume shift"
                    >
                      <RotateCcw className={`size-3.5 ${isPunching ? 'animate-spin' : ''}`} />
                      <span>{isPunching ? 'Resuming...' : 'Resume Shift'}</span>
                    </button>
                    <Link
                      href="/attendance"
                      className="text-xs text-slate-400 hover:text-white underline font-medium whitespace-nowrap"
                    >
                      Logs →
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handlePunchAction}
                  disabled={isPunching}
                  className={`w-full flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all shadow-lg active:scale-95 cursor-pointer text-white ${
                    isCheckedIn
                      ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 hover:from-amber-400 hover:to-rose-500 shadow-rose-600/30 hover:shadow-rose-600/50 ring-2 ring-rose-400/40'
                      : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/30 hover:shadow-emerald-500/50 ring-2 ring-emerald-400/40 hover:scale-[1.01]'
                  }`}
                >
                  {isPunching ? (
                    <>
                      <Clock className="size-4 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : isCheckedIn ? (
                    <>
                      <LogOut className="size-4" />
                      <span>Check Out (End Workday)</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="size-4" />
                      <span>Check In Now</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/20 text-white ml-1">
                        Day Shift
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Bottom info & link */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-0.5">
              <span>
                {isCheckedIn
                  ? `Checked in at ${formatTime(attendance?.firstInAt)}`
                  : isCheckedOut
                  ? `Checked out at ${formatTime(attendance?.lastOutAt)}`
                  : 'HQ Biometric & Web Punch'}
              </span>
              <Link
                href="/attendance"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-0.5"
              >
                <span>Terminal</span>
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </div>

          {/* Quick Action Shortcuts Bar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setLeaveModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 text-xs font-semibold whitespace-nowrap transition-all hover:border-slate-600 hover:text-white cursor-pointer active:scale-95"
            >
              <CalendarPlus className="size-3.5 text-indigo-400" />
              <span>Apply Leave</span>
            </button>

            <button
              onClick={() => setExpenseModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 text-xs font-semibold whitespace-nowrap transition-all hover:border-slate-600 hover:text-white cursor-pointer active:scale-95"
            >
              <Receipt className="size-3.5 text-emerald-400" />
              <span>Claim Expense</span>
            </button>

            <button
              onClick={() => setTaskModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 text-xs font-semibold whitespace-nowrap transition-all hover:border-slate-600 hover:text-white cursor-pointer active:scale-95"
            >
              <CheckSquare className="size-3.5 text-sky-400" />
              <span>Assign Task</span>
            </button>

            <Link
              href="/payroll"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white text-xs font-bold whitespace-nowrap transition-all shadow-md shadow-indigo-600/25 active:scale-95 text-center"
            >
              <CreditCard className="size-3.5" />
              <span>My Payslip</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Embedded Modals for 1-Click Dock */}
      <LeaveRequestModal
        open={leaveModalOpen}
        onOpenChange={setLeaveModalOpen}
        leaveTypes={leaveTypes}
      />

      <SubmitExpenseModal
        open={expenseModalOpen}
        onOpenChange={setExpenseModalOpen}
        employees={employees}
      />

      <AssignTaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        targetEmployee={employees[0]}
        onTaskAssigned={() => {
          toast.success('Task delegated successfully');
        }}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Clock,
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
import { toast } from 'sonner';
import Link from 'next/link';

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

  // Quick punch state
  const [punching, setPunching] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

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

  const handleQuickPunch = async () => {
    setPunching(true);
    const action = isCheckedIn ? 'CHECK_OUT' : 'CHECK_IN';
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: action }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCheckedIn(!isCheckedIn);
        toast.success(
          action === 'CHECK_IN'
            ? 'Clocked in successfully! Workday started.'
            : 'Clocked out successfully! Have a great evening.'
        );
      } else {
        toast.error(data.error || 'Failed to record attendance');
      }
    } catch {
      toast.error('Network error recording punch');
    } finally {
      setPunching(false);
    }
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

        {/* Right: Quick Action Dock */}
        <div className="w-full xl:w-auto pt-2 xl:pt-0">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Quick Punch Button */}
            <button
              onClick={handleQuickPunch}
              disabled={punching}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 h-10 rounded-xl border font-bold text-xs whitespace-nowrap transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
                isCheckedIn
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 shadow-emerald-500/10'
              }`}
            >
              <Clock className={`size-4 ${punching ? 'animate-spin' : ''}`} />
              <span>{punching ? 'Recording...' : isCheckedIn ? 'Clock Out' : 'Clock In Now'}</span>
            </button>

            {/* 1-Click Action Buttons */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setLeaveModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 text-xs font-semibold whitespace-nowrap transition-all hover:border-slate-600 hover:text-white cursor-pointer active:scale-95"
              >
                <CalendarPlus className="size-3.5 text-indigo-400" />
                <span>Apply Leave</span>
              </button>

              <button
                onClick={() => setExpenseModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 text-xs font-semibold whitespace-nowrap transition-all hover:border-slate-600 hover:text-white cursor-pointer active:scale-95"
              >
                <Receipt className="size-3.5 text-emerald-400" />
                <span>Claim Expense</span>
              </button>

              <button
                onClick={() => setTaskModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 h-10 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 text-xs font-semibold whitespace-nowrap transition-all hover:border-slate-600 hover:text-white cursor-pointer active:scale-95"
              >
                <CheckSquare className="size-3.5 text-sky-400" />
                <span>Assign Task</span>
              </button>

              <Link
                href="/payroll"
                className="flex items-center justify-center gap-1.5 px-3.5 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white text-xs font-bold whitespace-nowrap transition-all shadow-md shadow-indigo-600/25 active:scale-95 text-center"
              >
                <CreditCard className="size-3.5" />
                <span>My Payslip</span>
              </Link>
            </div>
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

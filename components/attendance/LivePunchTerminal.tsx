'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  Coffee,
  Sparkles,
  Timer,
  Calendar,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime, formatDuration } from '@/lib/utils/date';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/format';

export interface LivePunchTerminalProps {
  initialAttendance?: any;
  onRefresh?: () => void;
  userRole?: string;
  employeeName?: string;
}

export function LivePunchTerminal({
  initialAttendance,
  onRefresh,
  employeeName = 'Team Member',
}: LivePunchTerminalProps) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [punching, setPunching] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isOnBreak, setIsOnBreak] = useState(false);

  const hasCheckedIn = Boolean(attendance?.firstInAt);
  const hasCheckedOut = Boolean(attendance?.lastOutAt);

  // Sync state if initialAttendance changes
  useEffect(() => {
    setAttendance(initialAttendance);
  }, [initialAttendance]);

  // Live stopwatch effect
  useEffect(() => {
    if (!hasCheckedIn || hasCheckedOut) {
      if (hasCheckedOut && attendance?.workedMinutes) {
        setElapsedSeconds(attendance.workedMinutes * 60);
      } else {
        setElapsedSeconds(0);
      }
      return;
    }

    const firstInTime = new Date(attendance.firstInAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - firstInTime) / 1000));
      setElapsedSeconds(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [hasCheckedIn, hasCheckedOut, attendance?.firstInAt, attendance?.workedMinutes]);

  const handlePunch = async (type: 'CHECK_IN' | 'CHECK_OUT') => {
    setPunching(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.success) {
        const now = new Date().toISOString();
        toast.success(
          type === 'CHECK_IN'
            ? 'Checked in successfully! Workday started.'
            : 'Checked out successfully! Have a restful evening.'
        );
        setAttendance((prev: any) => ({
          ...prev,
          firstInAt: type === 'CHECK_IN' ? now : prev?.firstInAt,
          lastOutAt: type === 'CHECK_OUT' ? now : prev?.lastOutAt,
          status: type === 'CHECK_IN' ? 'PRESENT' : prev?.status,
        }));
        if (onRefresh) onRefresh();
      } else {
        toast.error(data.error || 'Failed to record punch');
      }
    } catch {
      toast.error('Network error recording punch');
    } finally {
      setPunching(false);
    }
  };

  const handleBreakToggle = () => {
    const nextState = !isOnBreak;
    setIsOnBreak(nextState);
    if (nextState) {
      toast.info('Coffee break started! Step away and refresh. ☕');
    } else {
      toast.success('Welcome back! Resuming active work shift. ⚡');
    }
  };

  // Format elapsed time as HH : MM : SS
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  // Standard Shift: 8 hours = 28800 seconds
  const shiftTargetSeconds = 8 * 3600;
  const shiftPercent = Math.min(100, Math.round((elapsedSeconds / shiftTargetSeconds) * 100));

  // Punctuality check
  let punctualityBadge = null;
  if (attendance?.firstInAt) {
    const inDate = new Date(attendance.firstInAt);
    const inHour = inDate.getHours();
    const inMin = inDate.getMinutes();
    const isLate = inHour > 9 || (inHour === 9 && inMin > 15);

    if (isLate) {
      punctualityBadge = {
        label: 'Grace Period / Late',
        color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
      };
    } else {
      punctualityBadge = {
        label: 'On-Time Arrival',
        color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
      };
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-indigo-50/20 dark:from-[#0b101d] dark:via-[#0e1628] dark:to-[#141b30] p-6 lg:p-7 shadow-xl shadow-slate-950/5">
      {/* Background Ambient Glows */}
      <div className="absolute -top-16 -right-16 size-64 rounded-full bg-[#F37021]/10 dark:bg-[#F37021]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 size-64 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
        {/* ─── 1. Left: Shift Details & Status ───────────────────────────────── */}
        <div className="space-y-2.5 max-w-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Calendar className="size-3 text-[#F37021]" />
              Standard Shift (09:00 AM – 05:00 PM)
            </span>

            {punctualityBadge && (
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
                  punctualityBadge.color
                )}
              >
                {punctualityBadge.label}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Executive Time Terminal</span>
            <span className="size-2.5 rounded-full bg-[#F37021] animate-pulse" />
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Biometric presence tracking with live active duty timer and automatic shift calculation.
          </p>
        </div>

        {/* ─── 2. Center: Digital Stopwatch & Progress Meter ────────────────── */}
        <div className="flex-1 max-w-md mx-auto xl:mx-0 w-full rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#070b14]/80 p-4 sm:p-5 backdrop-blur-md shadow-inner text-center">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 px-1 font-semibold">
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  'size-2 rounded-full',
                  hasCheckedOut
                    ? 'bg-slate-400'
                    : hasCheckedIn
                    ? isOnBreak
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400 animate-pulse'
                    : 'bg-slate-400'
                )}
              />
              {hasCheckedOut
                ? 'Workday Completed'
                : hasCheckedIn
                ? isOnBreak
                  ? 'On Break ☕'
                  : 'Active Session Live'
                : 'Not Clocked In'}
            </span>
            <span className="font-mono">{shiftPercent}% Target</span>
          </div>

          {/* Large Live Digital Ticker */}
          <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider text-slate-900 dark:text-white py-1.5">
            <span className="inline-block min-w-[2ch]">{pad(hours)}</span>
            <span className="text-[#F37021] animate-pulse mx-1">:</span>
            <span className="inline-block min-w-[2ch]">{pad(minutes)}</span>
            <span className="text-[#F37021] animate-pulse mx-1">:</span>
            <span className="inline-block min-w-[2ch] text-[#F37021]">{pad(seconds)}</span>
          </div>

          {/* Visual Shift Progress Bar */}
          <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000',
                hasCheckedOut
                  ? 'bg-slate-500'
                  : isOnBreak
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 via-[#818cf8] to-[#F37021]'
              )}
              style={{ width: `${Math.max(shiftPercent, 4)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 px-1 font-mono">
            <span>09:00 AM Start</span>
            <span>8h Shift Goal</span>
            <span>05:00 PM End</span>
          </div>
        </div>

        {/* ─── 3. Right: Metrics & Punch Actions ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row xl:flex-col items-center justify-between gap-4">
          {/* Quick Timestamps Pill */}
          <div className="flex items-center justify-around w-full gap-4 py-2 px-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                First In
              </span>
              <span className="text-xs font-black font-mono text-slate-800 dark:text-slate-200">
                {formatTime(attendance?.firstInAt)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-800" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Last Out
              </span>
              <span className="text-xs font-black font-mono text-slate-800 dark:text-slate-200">
                {formatTime(attendance?.lastOutAt)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-800" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Logged
              </span>
              <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                {formatDuration(attendance?.workedMinutes || Math.floor(elapsedSeconds / 60))}
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto xl:w-full">
            {!hasCheckedIn ? (
              <button
                type="button"
                onClick={() => handlePunch('CHECK_IN')}
                disabled={punching}
                className="w-full h-12 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="size-4.5" />
                <span>{punching ? 'Recording Punch...' : 'Clock In Now'}</span>
              </button>
            ) : !hasCheckedOut ? (
              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={handleBreakToggle}
                  className={cn(
                    'h-12 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0',
                    isOnBreak
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                  )}
                  title="Toggle coffee or lunch break"
                >
                  <Coffee className="size-4" />
                  <span>{isOnBreak ? 'Resume Work' : 'Break'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePunch('CHECK_OUT')}
                  disabled={punching}
                  className="flex-1 h-12 px-5 rounded-2xl bg-gradient-to-r from-[#F37021] to-rose-600 hover:from-[#ff8838] hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="size-4.5" />
                  <span>{punching ? 'Recording...' : 'Clock Out (Finish)'}</span>
                </button>
              </div>
            ) : (
              <div className="w-full h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle2 className="size-5" />
                <span>Shift Fully Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

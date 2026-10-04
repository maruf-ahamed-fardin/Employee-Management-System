'use client';

import React, { useEffect, useState } from 'react';
import { useAttendanceStore } from '@/stores/attendance.store';
import { Clock, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { formatTime, formatDuration } from '@/lib/utils/date';
import Link from 'next/link';

export function HeaderPunchWidget() {
  const {
    attendance,
    isCheckedIn,
    isCheckedOut,
    isPunching,
    fetchToday,
    punch,
    hasLoaded,
  } = useAttendanceStore();

  const [elapsed, setElapsed] = useState<string>('');

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

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

  if (!hasLoaded) return null;

  if (isCheckedOut) {
    return (
      <Link
        href="/attendance"
        title="Shift completed for today"
        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-colors"
      >
        <CheckCircle2 className="size-3.5 text-emerald-500" />
        <span>Completed ({formatDuration(attendance?.workedMinutes || 0)})</span>
      </Link>
    );
  }

  if (isCheckedIn) {
    return (
      <div className="hidden sm:inline-flex items-center gap-2 p-1 pl-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          {elapsed || '00:00:00'}
        </span>
        <button
          onClick={() => punch('CHECK_OUT')}
          disabled={isPunching}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-sans font-bold text-[11px] transition-all cursor-pointer border border-rose-500/30"
          title="Click to Check Out"
        >
          <LogOut className={`size-3 ${isPunching ? 'animate-spin' : ''}`} />
          <span>{isPunching ? 'Checking out...' : 'Check Out'}</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => punch('CHECK_IN')}
      disabled={isPunching}
      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
      title="Click to Check In for your workday"
    >
      <Clock className={`size-3.5 ${isPunching ? 'animate-spin' : ''}`} />
      <span>{isPunching ? 'Checking in...' : 'Check In'}</span>
    </button>
  );
}

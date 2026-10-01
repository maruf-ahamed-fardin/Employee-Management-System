'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  SunMedium,
  Moon,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime, formatDuration } from '@/lib/utils/date';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/format';

export type ShiftType = 'DAY' | 'NIGHT';

interface ShiftConfig {
  type: ShiftType;
  title: string;
  shortLabel: string;
  timeRange: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  graceMinutes: number;
  breakTitle: string;
  breakTimeRange: string;
  breakStartHour: number;
  breakEndHour: number;
  badgeTone: string;
}

const SHIFT_CONFIGS: Record<ShiftType, ShiftConfig> = {
  DAY: {
    type: 'DAY',
    title: 'Standard Day Shift',
    shortLabel: 'Day Shift',
    timeRange: '09:00 AM – 05:00 PM',
    startHour: 9,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
    graceMinutes: 15,
    breakTitle: 'Lunch & Prayer (Zohr) Break',
    breakTimeRange: '01:00 PM – 02:00 PM',
    breakStartHour: 13,
    breakEndHour: 14,
    badgeTone: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  NIGHT: {
    type: 'NIGHT',
    title: 'Overnight Operations Shift',
    shortLabel: 'Night Shift',
    timeRange: '09:00 PM – 05:00 AM',
    startHour: 21,
    startMinute: 0,
    endHour: 5,
    endMinute: 0,
    graceMinutes: 15,
    breakTitle: 'Midnight Meal & Prayer (Isha/Tahajjud)',
    breakTimeRange: '01:00 AM – 02:00 AM',
    breakStartHour: 1,
    breakEndHour: 2,
    badgeTone: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  },
};

const COFFEE_BREAK_MAX = 2;
const COFFEE_BREAK_MINUTES = 15;

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

  // Day & Night Shift State (Defaults auto-based on local hour)
  const [selectedShift, setSelectedShift] = useState<ShiftType>('DAY');

  // Flexible Coffee Break State (15m x 2 times a day)
  const [coffeeBreaksUsed, setCoffeeBreaksUsed] = useState<number>(0);
  const [isCoffeeBreakActive, setIsCoffeeBreakActive] = useState<boolean>(false);
  const [coffeeSecondsLeft, setCoffeeSecondsLeft] = useState<number>(COFFEE_BREAK_MINUTES * 60);

  // Clock tick
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const hasCheckedIn = Boolean(attendance?.firstInAt);
  const hasCheckedOut = Boolean(attendance?.lastOutAt);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentShiftConfig = SHIFT_CONFIGS[selectedShift];

  // Auto detect initial shift or restore saved preference
  useEffect(() => {
    try {
      const savedShift = localStorage.getItem('selorax_active_shift') as ShiftType;
      if (savedShift && (savedShift === 'DAY' || savedShift === 'NIGHT')) {
        setSelectedShift(savedShift);
      } else {
        const curH = new Date().getHours();
        // Day shift: 8:00 AM - 7:59 PM; Night shift: 8:00 PM - 7:59 AM
        setSelectedShift(curH >= 8 && curH < 20 ? 'DAY' : 'NIGHT');
      }

      const storedCoffee = localStorage.getItem(`selorax_coffee_${todayStr}`);
      if (storedCoffee) {
        setCoffeeBreaksUsed(Math.min(COFFEE_BREAK_MAX, parseInt(storedCoffee, 10) || 0));
      }
    } catch {}
  }, [todayStr]);

  const handleShiftChange = (shift: ShiftType) => {
    setSelectedShift(shift);
    try {
      localStorage.setItem('selorax_active_shift', shift);
    } catch {}
    toast.info(
      shift === 'DAY'
        ? 'Switched to Standard Day Shift (09:00 AM – 05:00 PM) ☀️'
        : 'Switched to Overnight Operations Shift (09:00 PM – 05:00 AM) 🌙'
    );
  };

  // Sync state if initialAttendance changes
  useEffect(() => {
    setAttendance(initialAttendance);
  }, [initialAttendance]);

  // Clock tick every second for current time and auto lunch/prayer check
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if current time is within Shift's Fixed Break Window
  const fixedBreakStatus = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const currentMins = hours * 60 + minutes;

    const startMins = currentShiftConfig.breakStartHour * 60;
    const endMins = currentShiftConfig.breakEndHour * 60;

    const isActive =
      currentShiftConfig.breakStartHour < currentShiftConfig.breakEndHour
        ? currentMins >= startMins && currentMins < endMins
        : currentMins >= startMins || currentMins < endMins;

    if (isActive) {
      return {
        status: 'ACTIVE',
        label: `${selectedShift === 'DAY' ? 'Lunch & Prayer' : 'Midnight Meal & Prayer'} Break Active`,
        detail: `Auto scheduled break in progress (${currentShiftConfig.breakTimeRange})`,
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse',
      };
    } else if (
      selectedShift === 'DAY'
        ? currentMins < startMins
        : currentMins < startMins && currentMins >= 21 * 60
    ) {
      return {
        status: 'UPCOMING',
        label: `Scheduled ${selectedShift === 'DAY' ? 'Lunch & Prayer' : 'Midnight Break'}`,
        detail: `Slot: ${currentShiftConfig.breakTimeRange}`,
        badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      };
    } else {
      return {
        status: 'COMPLETED',
        label: `${selectedShift === 'DAY' ? 'Lunch & Prayer' : 'Midnight Break'} Recorded`,
        detail: `Fixed 1h break (${currentShiftConfig.breakTimeRange}) slot`,
        badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      };
    }
  }, [currentTime, currentShiftConfig, selectedShift]);

  // Coffee break countdown timer
  useEffect(() => {
    if (!isCoffeeBreakActive) return;

    const interval = setInterval(() => {
      setCoffeeSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCoffeeBreakActive(false);
          toast.success('15-minute coffee break completed! Welcome back to work. ⚡');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCoffeeBreakActive]);

  // Live work stopwatch
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
            ? `Checked in successfully! ${currentShiftConfig.shortLabel} started.`
            : 'Checked out successfully! Have a restful time.'
        );
        setAttendance((prev: any) => ({
          ...prev,
          firstInAt: type === 'CHECK_IN' ? now : prev?.firstInAt,
          lastOutAt: type === 'CHECK_OUT' ? now : prev?.lastOutAt,
          status: type === 'CHECK_IN' ? 'PRESENT' : prev?.status,
        }));
        if (type === 'CHECK_OUT') {
          setIsCoffeeBreakActive(false);
        }
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

  // Start a flexible 15-min coffee break
  const handleStartCoffeeBreak = () => {
    if (coffeeBreaksUsed >= COFFEE_BREAK_MAX) {
      toast.error(
        `Daily coffee break limit reached! You have already used all ${COFFEE_BREAK_MAX} breaks (15 min each) today.`
      );
      return;
    }

    const nextUsed = coffeeBreaksUsed + 1;
    setCoffeeBreaksUsed(nextUsed);
    try {
      localStorage.setItem(`selorax_coffee_${todayStr}`, String(nextUsed));
    } catch {}

    setCoffeeSecondsLeft(COFFEE_BREAK_MINUTES * 60);
    setIsCoffeeBreakActive(true);
    toast.info(`Coffee break #${nextUsed} started! 15 minutes timer active. Refresh & relax! ☕`);
  };

  const handleEndCoffeeBreakEarly = () => {
    setIsCoffeeBreakActive(false);
    toast.success('Resumed work early! Active shift running. ⚡');
  };

  // Format elapsed time as HH : MM : SS
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  // Format coffee countdown MM : SS
  const coffeeMins = Math.floor(coffeeSecondsLeft / 60);
  const coffeeSecs = coffeeSecondsLeft % 60;

  // Standard Shift: 8 hours = 28800 seconds
  const shiftTargetSeconds = 8 * 3600;
  const shiftPercent = Math.min(100, Math.round((elapsedSeconds / shiftTargetSeconds) * 100));

  // Punctuality check based on selected shift
  let punctualityBadge = null;
  if (attendance?.firstInAt) {
    const inDate = new Date(attendance.firstInAt);
    const inHour = inDate.getHours();
    const inMin = inDate.getMinutes();

    let isLate = false;
    if (selectedShift === 'DAY') {
      isLate = inHour > 9 || (inHour === 9 && inMin > 15);
    } else {
      // Night shift: 9:00 PM (21:00), grace till 21:15
      isLate = inHour > 21 || (inHour === 21 && inMin > 15);
    }

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

  const isAnyBreakActive = isCoffeeBreakActive || fixedBreakStatus.status === 'ACTIVE';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-indigo-50/20 dark:from-[#0b101d] dark:via-[#0e1628] dark:to-[#141b30] p-6 lg:p-7 shadow-xl shadow-slate-950/5 space-y-6">
      {/* Background Ambient Glows */}
      <div
        className={cn(
          'absolute -top-16 -right-16 size-64 rounded-full blur-3xl pointer-events-none transition-colors duration-700',
          selectedShift === 'DAY'
            ? 'bg-[#F37021]/10 dark:bg-[#F37021]/15'
            : 'bg-indigo-600/15 dark:bg-indigo-500/20'
        )}
      />
      <div className="absolute -bottom-16 -left-16 size-64 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none" />

      {/* ─── SECTION 1: MAIN TERMINAL ROW (Shift Toggle, Timer & Punch Actions) ─ */}
      <div className="relative z-10 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
        {/* Left: Shift Details & Day/Night Toggle */}
        <div className="space-y-3 max-w-md">
          {/* Day & Night Shift Switcher Pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-[#070b14] border border-slate-200 dark:border-slate-800 shadow-inner">
              <button
                type="button"
                onClick={() => handleShiftChange('DAY')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95',
                  selectedShift === 'DAY'
                    ? 'bg-gradient-to-r from-amber-500 to-[#F37021] text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <SunMedium className="size-3.5" />
                <span>Day (09 AM – 05 PM)</span>
              </button>

              <button
                type="button"
                onClick={() => handleShiftChange('NIGHT')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95',
                  selectedShift === 'NIGHT'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Moon className="size-3.5" />
                <span>Night (09 PM – 05 AM)</span>
              </button>
            </div>

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

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{currentShiftConfig.title}</span>
              <span
                className={cn(
                  'size-2.5 rounded-full animate-pulse',
                  selectedShift === 'DAY' ? 'bg-[#F37021]' : 'bg-indigo-400'
                )}
              />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Biometric time terminal with automatic {selectedShift === 'DAY' ? 'lunch/prayer' : 'midnight meal/prayer'} breaks and dual-shift rosters.
            </p>
          </div>
        </div>

        {/* Center: Digital Stopwatch & Progress Meter */}
        <div className="flex-1 max-w-md mx-auto xl:mx-0 w-full rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#070b14]/80 p-4 sm:p-5 backdrop-blur-md shadow-inner text-center">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 px-1 font-semibold">
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  'size-2 rounded-full',
                  hasCheckedOut
                    ? 'bg-slate-400'
                    : hasCheckedIn
                    ? isAnyBreakActive
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400 animate-pulse'
                    : 'bg-slate-400'
                )}
              />
              {hasCheckedOut
                ? `${currentShiftConfig.shortLabel} Completed`
                : hasCheckedIn
                ? isCoffeeBreakActive
                  ? 'Coffee Break (15m) Active ☕'
                  : fixedBreakStatus.status === 'ACTIVE'
                  ? `${selectedShift === 'DAY' ? 'Lunch & Prayer' : 'Midnight Break'} Active`
                  : 'Active Session Live'
                : 'Not Clocked In'}
            </span>
            <span className="font-mono">{shiftPercent}% Target</span>
          </div>

          {/* Large Live Digital Ticker */}
          <div className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider text-slate-900 dark:text-white py-1.5">
            <span className="inline-block min-w-[2ch]">{pad(hours)}</span>
            <span
              className={cn(
                'animate-pulse mx-1',
                selectedShift === 'DAY' ? 'text-[#F37021]' : 'text-indigo-400'
              )}
            >
              :
            </span>
            <span className="inline-block min-w-[2ch]">{pad(minutes)}</span>
            <span
              className={cn(
                'animate-pulse mx-1',
                selectedShift === 'DAY' ? 'text-[#F37021]' : 'text-indigo-400'
              )}
            >
              :
            </span>
            <span
              className={cn(
                'inline-block min-w-[2ch]',
                selectedShift === 'DAY' ? 'text-[#F37021]' : 'text-indigo-400'
              )}
            >
              {pad(seconds)}
            </span>
          </div>

          {/* Visual Shift Progress Bar */}
          <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000',
                hasCheckedOut
                  ? 'bg-slate-500'
                  : isAnyBreakActive
                  ? 'bg-amber-500'
                  : selectedShift === 'DAY'
                  ? 'bg-gradient-to-r from-emerald-500 via-[#818cf8] to-[#F37021]'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400'
              )}
              style={{ width: `${Math.max(shiftPercent, 4)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 px-1 font-mono">
            <span>{currentShiftConfig.timeRange.split('–')[0]?.trim()} Start</span>
            <span>8h Target</span>
            <span>{currentShiftConfig.timeRange.split('–')[1]?.trim()} End</span>
          </div>
        </div>

        {/* Right: Timestamps & Punch Actions */}
        <div className="flex flex-col sm:flex-row xl:flex-col items-center justify-between gap-4">
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
          <div className="w-full sm:w-auto xl:w-full">
            {!hasCheckedIn ? (
              <button
                type="button"
                onClick={() => handlePunch('CHECK_IN')}
                disabled={punching}
                className={cn(
                  'w-full h-12 px-6 rounded-2xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50',
                  selectedShift === 'DAY'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/25'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-600/25'
                )}
              >
                <LogIn className="size-4.5" />
                <span>{punching ? 'Recording Punch...' : `Clock In (${currentShiftConfig.shortLabel})`}</span>
              </button>
            ) : !hasCheckedOut ? (
              <button
                type="button"
                onClick={() => handlePunch('CHECK_OUT')}
                disabled={punching}
                className="w-full h-12 px-6 rounded-2xl bg-gradient-to-r from-[#F37021] to-rose-600 hover:from-[#ff8838] hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="size-4.5" />
                <span>{punching ? 'Recording...' : `Clock Out (${currentShiftConfig.shortLabel})`}</span>
              </button>
            ) : (
              <div className="w-full h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle2 className="size-5" />
                <span>{currentShiftConfig.shortLabel} Fully Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: BREAK MANAGEMENT (Fixed Shift Break & Flexible Coffee) ─ */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Auto & Fixed Shift Break */}
          <div
            className={cn(
              'relative overflow-hidden rounded-2xl border p-4 transition-all duration-300',
              fixedBreakStatus.status === 'ACTIVE'
                ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 ring-2 ring-emerald-500/20'
                : 'bg-white/70 dark:bg-[#070b14]/70 border-slate-200/80 dark:border-slate-800'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'size-10 rounded-xl flex items-center justify-center shrink-0 border',
                    selectedShift === 'DAY'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  )}
                >
                  {selectedShift === 'DAY' ? (
                    <SunMedium className="size-5" />
                  ) : (
                    <Moon className="size-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {currentShiftConfig.breakTitle}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Auto · Fixed 60m
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Official slot: <strong>{currentShiftConfig.breakTimeRange}</strong>
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0',
                  fixedBreakStatus.badgeClass
                )}
              >
                {fixedBreakStatus.label}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="font-medium">{fixedBreakStatus.detail}</span>
              <span className="text-[11px] font-mono font-semibold text-slate-500">
                1h 00m Standard Slot
              </span>
            </div>
          </div>

          {/* Card B: Flexible Coffee Break Quota (15 min each, 2 times a day) */}
          <div
            className={cn(
              'relative overflow-hidden rounded-2xl border p-4 transition-all duration-300',
              isCoffeeBreakActive
                ? 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/40 ring-2 ring-amber-500/20'
                : 'bg-white/70 dark:bg-[#070b14]/70 border-slate-200/80 dark:border-slate-800'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Coffee className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Flexible Coffee Breaks
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                      15 min · 2/day
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Self-timed refreshment breaks: <strong>{coffeeBreaksUsed} of {COFFEE_BREAK_MAX} used</strong>
                  </p>
                </div>
              </div>

              {/* Slot Indicator Pills */}
              <div className="flex items-center gap-1.5 shrink-0">
                {[1, 2].map((slot) => {
                  const isUsed = coffeeBreaksUsed >= slot;
                  const isCurrent = isCoffeeBreakActive && coffeeBreaksUsed === slot;
                  return (
                    <span
                      key={slot}
                      className={cn(
                        'size-7 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all',
                        isCurrent
                          ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                          : isUsed
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      )}
                      title={`Break slot ${slot} (${COFFEE_BREAK_MINUTES}m)`}
                    >
                      {isUsed && !isCurrent ? <Check className="size-3" /> : `#${slot}`}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Coffee Break Action / Live Countdown */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              {isCoffeeBreakActive ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Break Active:
                    </span>
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      {pad(coffeeMins)}:{pad(coffeeSecs)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleEndCoffeeBreakEarly}
                    className="px-3 py-1 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all hover:opacity-90 cursor-pointer active:scale-95"
                  >
                    Resume Work ⚡
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {coffeeBreaksUsed >= COFFEE_BREAK_MAX
                      ? 'All coffee allowances used for today'
                      : `${COFFEE_BREAK_MAX - coffeeBreaksUsed} break${
                          COFFEE_BREAK_MAX - coffeeBreaksUsed > 1 ? 's' : ''
                        } available (15m each)`}
                  </span>

                  <button
                    type="button"
                    onClick={handleStartCoffeeBreak}
                    disabled={!hasCheckedIn || hasCheckedOut || coffeeBreaksUsed >= COFFEE_BREAK_MAX}
                    className={cn(
                      'px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95',
                      coffeeBreaksUsed >= COFFEE_BREAK_MAX || !hasCheckedIn || hasCheckedOut
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                    )}
                  >
                    <Coffee className="size-3.5" />
                    <span>Take Coffee Break</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

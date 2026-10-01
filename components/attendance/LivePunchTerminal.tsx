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
  Check,
  RotateCcw,
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

const COFFEE_BREAK_MAX = 2;
const COFFEE_BREAK_MINUTES = 15;

export function LivePunchTerminal({
  initialAttendance,
  onRefresh,
  employeeName = 'Team Member',
}: LivePunchTerminalProps) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [punching, setPunching] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Flexible Coffee Break State (15m x 2 times a day)
  const [coffeeBreaksUsed, setCoffeeBreaksUsed] = useState<number>(0);
  const [isCoffeeBreakActive, setIsCoffeeBreakActive] = useState<boolean>(false);
  const [coffeeSecondsLeft, setCoffeeSecondsLeft] = useState<number>(COFFEE_BREAK_MINUTES * 60);

  // Auto/Fixed Lunch & Prayer State (1:00 PM – 2:00 PM)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const hasCheckedIn = Boolean(attendance?.firstInAt);
  const hasCheckedOut = Boolean(attendance?.lastOutAt);

  // Initialize and persist coffee breaks in localStorage by today's date
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`selorax_coffee_${todayStr}`);
      if (stored) {
        setCoffeeBreaksUsed(Math.min(COFFEE_BREAK_MAX, parseInt(stored, 10) || 0));
      }
    } catch {}
  }, [todayStr]);

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

  // Check if current time is within Fixed Lunch & Prayer window (13:00 – 14:00)
  const lunchPrayerStatus = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const currentMins = hours * 60 + minutes;

    const startMins = 13 * 60; // 01:00 PM
    const endMins = 14 * 60; // 02:00 PM

    if (currentMins >= startMins && currentMins < endMins) {
      const remainingMins = endMins - currentMins;
      return {
        status: 'ACTIVE',
        label: 'Lunch & Prayer Break Active',
        detail: `Auto break in progress (${remainingMins}m remaining until 02:00 PM)`,
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse',
      };
    } else if (currentMins < startMins) {
      const minsUntil = startMins - currentMins;
      const hoursUntil = Math.floor(minsUntil / 60);
      const mUntil = minsUntil % 60;
      return {
        status: 'UPCOMING',
        label: 'Fixed Lunch & Prayer Break',
        detail: `Scheduled: 01:00 PM – 02:00 PM (in ${hoursUntil > 0 ? `${hoursUntil}h ` : ''}${mUntil}m)`,
        badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      };
    } else {
      return {
        status: 'COMPLETED',
        label: 'Lunch & Prayer Completed',
        detail: 'Fixed break (01:00 PM – 02:00 PM) recorded',
        badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      };
    }
  }, [currentTime]);

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
            ? 'Checked in successfully! Workday started.'
            : 'Checked out successfully! Have a restful evening.'
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

  const isAnyBreakActive = isCoffeeBreakActive || lunchPrayerStatus.status === 'ACTIVE';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-indigo-50/20 dark:from-[#0b101d] dark:via-[#0e1628] dark:to-[#141b30] p-6 lg:p-7 shadow-xl shadow-slate-950/5 space-y-6">
      {/* Background Ambient Glows */}
      <div className="absolute -top-16 -right-16 size-64 rounded-full bg-[#F37021]/10 dark:bg-[#F37021]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 size-64 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl pointer-events-none" />

      {/* ─── SECTION 1: MAIN TERMINAL ROW (Timer & Punch Actions) ─────────────── */}
      <div className="relative z-10 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
        {/* Left: Shift Details & Status */}
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
            Biometric presence tracking with automatic lunch/prayer breaks and flexible coffee allowances.
          </p>
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
                ? 'Workday Completed'
                : hasCheckedIn
                ? isCoffeeBreakActive
                  ? 'Coffee Break (15m) Active ☕'
                  : lunchPrayerStatus.status === 'ACTIVE'
                  ? 'Lunch & Prayer Break Active 🕌'
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
                  : isAnyBreakActive
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
                className="w-full h-12 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <LogIn className="size-4.5" />
                <span>{punching ? 'Recording Punch...' : 'Clock In Now'}</span>
              </button>
            ) : !hasCheckedOut ? (
              <button
                type="button"
                onClick={() => handlePunch('CHECK_OUT')}
                disabled={punching}
                className="w-full h-12 px-6 rounded-2xl bg-gradient-to-r from-[#F37021] to-rose-600 hover:from-[#ff8838] hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <LogOut className="size-4.5" />
                <span>{punching ? 'Recording...' : 'Clock Out (Finish Workday)'}</span>
              </button>
            ) : (
              <div className="w-full h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle2 className="size-5" />
                <span>Shift Fully Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: BREAK MANAGEMENT (Fixed Lunch/Prayer & Flexible Coffee) ─ */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 pt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: Auto & Fixed Lunch & Prayer (Namaj) Break (01:00 PM – 02:00 PM) */}
          <div
            className={cn(
              'relative overflow-hidden rounded-2xl border p-4 transition-all duration-300',
              lunchPrayerStatus.status === 'ACTIVE'
                ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 ring-2 ring-emerald-500/20'
                : 'bg-white/70 dark:bg-[#070b14]/70 border-slate-200/80 dark:border-slate-800'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                  <SunMedium className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Lunch & Prayer (Zohr) Break
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Auto · Fixed 60m
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Fixed official window: <strong>01:00 PM – 02:00 PM</strong>
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0',
                  lunchPrayerStatus.badgeClass
                )}
              >
                {lunchPrayerStatus.label}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="font-medium">{lunchPrayerStatus.detail}</span>
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

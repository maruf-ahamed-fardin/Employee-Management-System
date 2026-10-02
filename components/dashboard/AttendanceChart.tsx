'use client';

import React, { useState } from 'react';
import {
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface DayMetric {
  id: string;
  day: string;
  date: string;
  present: number;
  total: number;
  onTime: number;
  late: number;
  absent: number;
  rate: number;
  peakHour: string;
  isToday?: boolean;
}

const weeklyData: DayMetric[] = [
  { id: 'mon', day: 'Mon', date: 'Sep 28', present: 43, total: 45, onTime: 39, late: 4, absent: 2, rate: 95.5, peakHour: '09:12 AM' },
  { id: 'tue', day: 'Tue', date: 'Sep 29', present: 45, total: 45, onTime: 43, late: 2, absent: 0, rate: 100.0, peakHour: '08:55 AM' },
  { id: 'wed', day: 'Wed', date: 'Sep 30', present: 45, total: 45, onTime: 42, late: 3, absent: 0, rate: 100.0, peakHour: '09:04 AM' },
  { id: 'thu', day: 'Thu', date: 'Oct 01', present: 42, total: 45, onTime: 38, late: 4, absent: 3, rate: 93.3, peakHour: '09:25 AM' },
  { id: 'fri', day: 'Fri', date: 'Oct 02', present: 44, total: 45, onTime: 40, late: 4, absent: 1, rate: 97.8, peakHour: '09:10 AM', isToday: true },
  { id: 'sat', day: 'Sat', date: 'Oct 03', present: 14, total: 15, onTime: 13, late: 1, absent: 1, rate: 93.3, peakHour: '10:00 AM' },
];

const hourlyFlowToday = [
  { time: '08:00 AM', count: 5, pct: 23, label: 'Early Birds' },
  { time: '08:30 AM', count: 14, pct: 64, label: 'Morning Surge' },
  { time: '09:00 AM', count: 22, pct: 100, label: 'Peak Check-in', isPeak: true },
  { time: '09:30 AM', count: 3, pct: 14, label: 'Late Shift' },
  { time: '10:00 AM', count: 1, pct: 5, label: 'Exceptions' },
];

export function AttendanceChart() {
  const [selectedDayId, setSelectedDayId] = useState<string>('fri');
  const [viewMode, setViewMode] = useState<'weekly' | 'hourly'>('weekly');

  const selectedDay = weeklyData.find((d) => d.id === selectedDayId) || weeklyData[4];

  return (
    <div className="col-span-full lg:col-span-8 rounded-2xl sm:rounded-3xl border border-white/10 dark:border-white/8 bg-[#0c1222]/85 backdrop-blur-2xl p-3.5 sm:p-6 shadow-xl shadow-black/40 flex flex-col justify-between relative overflow-hidden group">
      {/* Background Subtle Gradient Glow Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 size-72 rounded-full bg-[#f37021]/10 blur-3xl" />

      {/* ─── 1. Header Bar: Title, Live Pulse & View Switcher ─────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-white/5 relative z-10">
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 sm:size-10 rounded-xl bg-gradient-to-br from-[#252175] to-[#f37021]/70 p-0.5 shadow-md shadow-[#252175]/30 ring-1 ring-white/15 shrink-0 flex items-center justify-center text-white">
              <Activity className="size-4 sm:size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  Attendance Velocity
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Weekly presence & punctuality telemetry
              </p>
            </div>
          </div>

          <span className="sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            96.4%
          </span>
        </div>

        {/* View Switcher: Weekly Equalizer vs Today's Inflow */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            96.4% Live Optimal
          </span>

          <div className="flex items-center gap-1 bg-white/5 p-0.5 sm:p-1 rounded-xl border border-white/10 text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer text-center ${
                viewMode === 'weekly'
                  ? 'bg-[#182238] text-white shadow-sm border border-white/15'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly Equalizer
            </button>
            <button
              type="button"
              onClick={() => setViewMode('hourly')}
              className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer text-center ${
                viewMode === 'hourly'
                  ? 'bg-[#182238] text-white shadow-sm border border-white/15'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Today&apos;s Inflow
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. Compact Executive HUD Strip ─────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2.5 py-2.5 sm:py-3.5 relative z-10">
        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md">
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Avg Attendance
          </span>
          <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1">
            <span className="text-sm sm:text-lg font-black font-mono text-white">96.4%</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 font-mono">+2.1%</span>
          </div>
        </div>

        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md">
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Punctuality
          </span>
          <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1">
            <span className="text-sm sm:text-lg font-black font-mono text-emerald-400">92.8%</span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono hidden sm:inline">on-time</span>
          </div>
        </div>

        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md">
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Peak Arrival
          </span>
          <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1">
            <span className="text-sm sm:text-lg font-black font-mono text-[#f37021]">09:00 AM</span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono hidden sm:inline">22 staff</span>
          </div>
        </div>

        <div className="hidden sm:block p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md">
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Core Overlap
          </span>
          <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1">
            <span className="text-sm sm:text-lg font-black font-mono text-indigo-400">10A – 4P</span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">100% cap</span>
          </div>
        </div>
      </div>

      {/* ─── 3. Main Equalizer Canvas ───────────────────────────────────────── */}
      <div className="my-1 sm:my-2 p-2.5 sm:p-5 rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md relative z-10">
        {viewMode === 'weekly' ? (
          <div className="space-y-3 sm:space-y-4">
            {/* Equalizer Grid Canvas */}
            <div className="h-44 sm:h-52 w-full flex items-end justify-between gap-1.5 sm:gap-4 px-1 sm:px-4 relative">
              {/* Background Guideline Marks (Clean & Non-overlapping) */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between h-full select-none">
                <div className="border-b border-white/[0.04] w-full flex items-center justify-between pb-1">
                  <span className="hidden sm:inline text-[9px] font-mono text-slate-600">100%</span>
                  <span className="text-[9px] font-mono text-slate-600/70 ml-auto">Target Line (95%)</span>
                </div>
                <div className="border-b border-white/[0.04] w-full pb-1">
                  <span className="hidden sm:inline text-[9px] font-mono text-slate-600">75%</span>
                </div>
                <div className="border-b border-white/[0.04] w-full pb-1">
                  <span className="hidden sm:inline text-[9px] font-mono text-slate-600">50%</span>
                </div>
                <div className="border-b border-white/[0.04] w-full pb-1">
                  <span className="hidden sm:inline text-[9px] font-mono text-slate-600">25%</span>
                </div>
              </div>

              {/* Dynamic Vertical Equalizer Columns */}
              {weeklyData.map((d) => {
                const isSelected = d.id === selectedDayId;
                const onTimePct = (d.onTime / d.total) * 100;
                const latePct = (d.late / d.total) * 100;

                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDayId(d.id)}
                    className="flex-1 flex flex-col items-center justify-end h-full group/bar cursor-pointer relative z-10 touch-manipulation select-none"
                  >
                    {/* Floating Pill on Hover / Selected */}
                    <div
                      className={`mb-1.5 sm:mb-2 transition-all duration-200 ${
                        isSelected
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 group-hover/bar:opacity-100 group-hover/bar:scale-100 scale-90'
                      }`}
                    >
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-[#141b2d] text-white border border-white/20 shadow-xl whitespace-nowrap">
                        {d.rate}%
                      </span>
                    </div>

                    {/* Vertical Pill Track */}
                    <div
                      className={`w-7 sm:w-10 md:w-12 h-28 sm:h-36 rounded-xl sm:rounded-2xl bg-white/[0.03] border transition-all duration-300 relative flex flex-col justify-end p-0.5 sm:p-1 overflow-hidden ${
                        isSelected
                          ? 'border-indigo-400/70 bg-white/[0.08] shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-2 ring-indigo-500/25'
                          : 'border-white/5 group-hover/bar:border-white/20 group-hover/bar:bg-white/[0.05]'
                      }`}
                    >
                      {/* Late Cap (Orange Neon) */}
                      {d.late > 0 && (
                        <div
                          style={{ height: `${latePct}%` }}
                          className="w-full rounded-t-lg sm:rounded-t-xl bg-gradient-to-t from-[#f37021] to-amber-400 shadow-[0_0_10px_rgba(243,112,33,0.5)] transition-all duration-500 mb-0.5"
                          title={`Late: ${d.late} staff`}
                        />
                      )}

                      {/* On-Time Main Column (Indigo to Cyan Glow) */}
                      <div
                        style={{ height: `${onTimePct}%` }}
                        className="w-full rounded-b-lg sm:rounded-b-xl bg-gradient-to-t from-[#252175] via-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-500 flex flex-col justify-between items-center py-1"
                        title={`On-time: ${d.onTime} staff`}
                      >
                        {/* Glowing cap highlight dot */}
                        <span className="size-1 rounded-full bg-white/90 shadow-[0_0_6px_#fff]" />
                      </div>
                    </div>

                    {/* Bottom Label & Date Badge */}
                    <div className="mt-2 text-center">
                      <p
                        className={`text-[11px] sm:text-xs font-bold transition-colors ${
                          isSelected ? 'text-white' : 'text-slate-400 group-hover/bar:text-slate-200'
                        }`}
                      >
                        {d.day}
                      </p>
                      <span
                        className={`text-[9px] sm:text-[10px] font-mono block mt-0.5 ${
                          d.isToday
                            ? 'text-emerald-400 font-bold px-1 rounded-full bg-emerald-500/10 border border-emerald-500/20'
                            : 'text-slate-500'
                        }`}
                      >
                        {d.isToday ? 'TODAY' : d.date.split(' ')[1]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Day Tactical Telemetry Card (Fully Mobile-Friendly) */}
            <div className="mt-2.5 sm:mt-4 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center justify-between sm:justify-start gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="size-7 sm:size-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono text-xs">
                    {selectedDay.day}
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs leading-none">
                      {selectedDay.date} Telemetry
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Peak check-in at <span className="text-[#f37021] font-mono font-bold">{selectedDay.peakHour}</span>
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {selectedDay.present}/{selectedDay.total} Active
                </span>
              </div>

              {/* 3 Telemetry Badges */}
              <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-4 text-xs font-mono pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <div className="flex items-center justify-center sm:justify-start gap-1 p-1 sm:p-0 rounded bg-white/[0.02] sm:bg-transparent">
                  <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                  <span className="text-white font-bold">{selectedDay.onTime}</span>
                  <span className="text-slate-400 text-[10px]">On-Time</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 p-1 sm:p-0 rounded bg-white/[0.02] sm:bg-transparent">
                  <AlertCircle className="size-3 text-[#f37021] shrink-0" />
                  <span className="text-white font-bold">{selectedDay.late}</span>
                  <span className="text-slate-400 text-[10px]">Late</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 p-1 sm:p-0 rounded bg-white/[0.02] sm:bg-transparent">
                  <Clock className="size-3 text-indigo-400 shrink-0" />
                  <span className="text-emerald-400 font-bold">{selectedDay.rate}%</span>
                  <span className="text-slate-400 text-[10px]">Rate</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Hourly Arrival Flow View for Today */
          <div className="space-y-3 py-1 sm:py-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1.5 border-b border-white/5 text-[11px]">
              <span>Interval (Morning Punch)</span>
              <span>Inflow Volume</span>
            </div>

            <div className="space-y-2.5">
              {hourlyFlowToday.map((h) => (
                <div key={h.time} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`size-1.5 rounded-full ${
                          h.isPeak ? 'bg-[#f37021] animate-pulse' : 'bg-indigo-400'
                        }`}
                      />
                      <span className="font-mono font-bold text-white text-[11px]">{h.time}</span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">({h.label})</span>
                    </div>
                    <span className="font-mono font-bold text-white text-[11px]">
                      {h.count} staff{' '}
                      {h.isPeak && (
                        <span className="text-[9px] text-[#f37021] font-sans font-bold ml-1">
                          ★ PEAK
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Horizontal Glowing Bar */}
                  <div className="h-2.5 w-full rounded-full bg-white/[0.04] p-0.5 border border-white/5">
                    <div
                      style={{ width: `${h.pct}%` }}
                      className={`h-full rounded-full transition-all duration-700 ${
                        h.isPeak
                          ? 'bg-gradient-to-r from-indigo-500 via-[#f37021] to-amber-400 shadow-[0_0_12px_rgba(243,112,33,0.6)]'
                          : 'bg-gradient-to-r from-[#252175] to-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── 4. Legend & High-Tech Footer ─────────────────────────────────── */}
      <div className="pt-2 sm:pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 relative z-10">
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            <span className="font-medium text-slate-200">On-Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#f37021] shadow-[0_0_8px_rgba(243,112,33,0.6)]" />
            <span className="font-medium text-slate-200">Late (&gt;15m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-600" />
            <span className="text-slate-400">Absent</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 self-end sm:self-auto">
          <Zap className="size-3 text-emerald-400" />
          <span>Biometric Live Feed</span>
        </div>
      </div>
    </div>
  );
}

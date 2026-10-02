'use client';

import React, { useState } from 'react';
import {
  Activity,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
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
    <div className="col-span-full lg:col-span-8 rounded-3xl border border-white/10 dark:border-white/8 bg-[#0c1222]/80 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl shadow-black/40 flex flex-col justify-between relative overflow-hidden group">
      {/* Background Subtle Gradient Glow Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 size-72 rounded-full bg-[#f37021]/10 blur-3xl" />

      {/* ─── 1. Header Bar: Title, Live Pulse & View Switcher ─────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 sm:size-11 rounded-2xl bg-gradient-to-br from-[#252175] to-[#f37021]/70 p-0.5 shadow-lg shadow-[#252175]/30 ring-1 ring-white/15 shrink-0 flex items-center justify-center text-white">
            <Activity className="size-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Workforce Velocity Equalizer
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                96.4% Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive presence & punctuality telemetry across all departments
            </p>
          </div>
        </div>

        {/* View Switcher: Weekly Equalizer vs Today's Inflow */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-[#182238] text-white shadow-sm border border-white/15'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Velocity
          </button>
          <button
            type="button"
            onClick={() => setViewMode('hourly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewMode === 'hourly'
                ? 'bg-[#182238] text-white shadow-sm border border-white/15'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today&apos;s Inflow
          </button>
        </div>
      </div>

      {/* ─── 2. Executive Quick-Metric HUD Strip ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-4 relative z-10">
        <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Avg Attendance
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-black font-mono text-white">96.4%</span>
            <span className="text-[10px] font-bold text-emerald-400 font-mono">+2.1%</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Punctuality Score
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-black font-mono text-emerald-400">92.8%</span>
            <span className="text-[10px] text-slate-500 font-mono">on-time</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Peak Arrival
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-black font-mono text-[#f37021]">09:00 AM</span>
            <span className="text-[10px] text-slate-500 font-mono">22 staff</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Core Overlap
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-black font-mono text-indigo-400">10A – 4P</span>
            <span className="text-[10px] text-slate-500 font-mono">100% cap</span>
          </div>
        </div>
      </div>

      {/* ─── 3. Main Equalizer Canvas (Linear Dynamic Bars) ────────────────── */}
      <div className="my-2 p-3 sm:p-5 rounded-2xl border border-white/5 bg-black/20 backdrop-blur-md relative z-10">
        {viewMode === 'weekly' ? (
          <div className="space-y-4">
            {/* Equalizer Grid Canvas */}
            <div className="h-52 w-full flex items-end justify-between gap-2 sm:gap-4 px-1 sm:px-4 relative">
              {/* Background Guideline Marks */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between h-full text-[10px] font-mono text-slate-600/70 select-none">
                <div className="border-b border-white/[0.04] w-full flex items-center justify-between pb-1">
                  <span>100%</span>
                  <span className="text-[9px] text-slate-500">Target Line</span>
                </div>
                <div className="border-b border-white/[0.04] w-full pb-1">
                  <span>75%</span>
                </div>
                <div className="border-b border-white/[0.04] w-full pb-1">
                  <span>50%</span>
                </div>
                <div className="border-b border-white/[0.04] w-full pb-1">
                  <span>25%</span>
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
                    className="flex-1 flex flex-col items-center justify-end h-full group/bar cursor-pointer relative z-10"
                  >
                    {/* Floating Pill on Hover / Selected */}
                    <div
                      className={`mb-2 transition-all duration-200 ${
                        isSelected
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 group-hover/bar:opacity-100 group-hover/bar:scale-100 scale-90'
                      }`}
                    >
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#141b2d] text-white border border-white/20 shadow-xl whitespace-nowrap">
                        {d.rate}%
                      </span>
                    </div>

                    {/* Vertical Pill Track */}
                    <div
                      className={`w-6 sm:w-10 md:w-12 h-36 rounded-2xl bg-white/[0.03] border transition-all duration-300 relative flex flex-col justify-end p-1 overflow-hidden ${
                        isSelected
                          ? 'border-indigo-400/60 bg-white/[0.06] shadow-[0_0_20px_rgba(99,102,241,0.25)] ring-2 ring-indigo-500/20'
                          : 'border-white/5 group-hover/bar:border-white/20 group-hover/bar:bg-white/[0.05]'
                      }`}
                    >
                      {/* Late Cap (Orange Neon) */}
                      {d.late > 0 && (
                        <div
                          style={{ height: `${latePct}%` }}
                          className="w-full rounded-t-xl bg-gradient-to-t from-[#f37021] to-amber-400 shadow-[0_0_10px_rgba(243,112,33,0.5)] transition-all duration-500 mb-0.5"
                          title={`Late: ${d.late} staff`}
                        />
                      )}

                      {/* On-Time Main Column (Indigo to Cyan Glow) */}
                      <div
                        style={{ height: `${onTimePct}%` }}
                        className="w-full rounded-b-xl bg-gradient-to-t from-[#252175] via-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-500 flex flex-col justify-between items-center py-1"
                        title={`On-time: ${d.onTime} staff`}
                      >
                        {/* Glowing cap highlight dot */}
                        <span className="size-1 rounded-full bg-white/90 shadow-[0_0_6px_#fff]" />
                      </div>
                    </div>

                    {/* Bottom Label & Date Badge */}
                    <div className="mt-3 text-center">
                      <p
                        className={`text-xs font-bold transition-colors ${
                          isSelected ? 'text-white' : 'text-slate-400 group-hover/bar:text-slate-200'
                        }`}
                      >
                        {d.day}
                      </p>
                      <span
                        className={`text-[10px] font-mono block mt-0.5 ${
                          d.isToday
                            ? 'text-emerald-400 font-bold px-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20'
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

            {/* Selected Day Tactical Telemetry Card */}
            <div className="mt-4 p-3 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono">
                  {selectedDay.day}
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <span>{selectedDay.date} Telemetry</span>
                    <span className="text-[10px] font-mono px-1.5 rounded bg-white/10 text-slate-300">
                      {selectedDay.present}/{selectedDay.total} Staff Active
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Peak check-in recorded at{' '}
                    <span className="text-[#f37021] font-mono font-bold">{selectedDay.peakHour}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono self-end sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span className="text-white font-bold">{selectedDay.onTime}</span>
                  <span className="text-slate-500 text-[10px]">On-Time</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 text-[#f37021]" />
                  <span className="text-white font-bold">{selectedDay.late}</span>
                  <span className="text-slate-500 text-[10px]">Late</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-slate-400" />
                  <span className="text-emerald-400 font-bold">{selectedDay.rate}%</span>
                  <span className="text-slate-500 text-[10px]">Rate</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Hourly Arrival Flow View for Today */
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/5">
              <span>Time Interval (Morning Check-in)</span>
              <span>Inflow Volume</span>
            </div>

            <div className="space-y-3">
              {hourlyFlowToday.map((h) => (
                <div key={h.time} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full ${
                          h.isPeak ? 'bg-[#f37021] animate-pulse' : 'bg-indigo-400'
                        }`}
                      />
                      <span className="font-mono font-bold text-white">{h.time}</span>
                      <span className="text-[11px] text-slate-400">({h.label})</span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      {h.count} staff{' '}
                      {h.isPeak && (
                        <span className="text-[10px] text-[#f37021] font-sans font-bold ml-1">
                          ★ PEAK
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Horizontal Glowing Bar */}
                  <div className="h-3 w-full rounded-full bg-white/[0.04] p-0.5 border border-white/5">
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
      <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            <span className="text-[11px] font-medium text-slate-200">On-Time Presence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#f37021] shadow-[0_0_8px_rgba(243,112,33,0.6)]" />
            <span className="text-[11px] font-medium text-slate-200">Late Arrival (&gt;15m)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Zap className="size-3 text-emerald-400" />
          <span>Biometric Telemetry Live Sync</span>
        </div>
      </div>
    </div>
  );
}

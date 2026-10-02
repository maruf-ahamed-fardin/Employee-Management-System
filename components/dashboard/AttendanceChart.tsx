'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  ArrowRight,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface DayMetric {
  day: string;
  fullDay: string;
  date: string;
  present: number;
  total: number;
  onTime: number;
  late: number;
  absent: number;
  rate: number;
  isToday?: boolean;
}

const splineData: DayMetric[] = [
  { day: 'Mon', fullDay: 'Monday', date: 'Sep 28', present: 43, total: 45, onTime: 39, late: 4, absent: 2, rate: 95.5 },
  { day: 'Tue', fullDay: 'Tuesday', date: 'Sep 29', present: 45, total: 45, onTime: 43, late: 2, absent: 0, rate: 100.0 },
  { day: 'Wed', fullDay: 'Wednesday', date: 'Sep 30', present: 46, total: 45, onTime: 43, late: 3, absent: 0, rate: 100.0 },
  { day: 'Thu', fullDay: 'Thursday', date: 'Oct 01', present: 42, total: 45, onTime: 38, late: 4, absent: 3, rate: 93.3 },
  { day: 'Fri', fullDay: 'Friday', date: 'Oct 02', present: 44, total: 45, onTime: 40, late: 4, absent: 1, rate: 97.8, isToday: true },
  { day: 'Sat', fullDay: 'Saturday', date: 'Oct 03', present: 14, total: 15, onTime: 13, late: 1, absent: 1, rate: 93.3 },
  { day: 'Sun', fullDay: 'Sunday', date: 'Oct 04', present: 10, total: 10, onTime: 10, late: 0, absent: 0, rate: 100.0 },
];

const liveClockIns = [
  {
    name: 'Anika Akter',
    role: 'Lead Product Designer',
    dept: 'Design',
    time: '08:52 AM',
    status: 'on-time',
    initials: 'AA',
    avatarBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  {
    name: 'Maruf Ahamed',
    role: 'Senior Full Stack Engineer',
    dept: 'Engineering',
    time: '08:58 AM',
    status: 'on-time',
    initials: 'MA',
    avatarBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  {
    name: 'Mahmudur Rahman',
    role: 'Senior Financial Analyst',
    dept: 'Finance',
    time: '09:05 AM',
    status: 'on-time',
    initials: 'MR',
    avatarBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    name: 'Tanvir Ahmed',
    role: 'Lead Product Designer',
    dept: 'Design',
    time: '09:22 AM',
    status: 'late',
    lateBy: '+7m',
    initials: 'TA',
    avatarBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    name: 'Nusrat Jahan',
    role: 'Head of People & Culture',
    dept: 'HR',
    time: '08:45 AM',
    status: 'on-time',
    initials: 'NJ',
    avatarBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
];

export function AttendanceChart() {
  const [selectedDay, setSelectedDay] = useState<DayMetric>(splineData[4]); // Friday (Today)
  const [activeSignal, setActiveSignal] = useState<'all' | 'present' | 'late'>('all');

  // Custom Stripe-Style Floating Glass Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DayMetric;
      return (
        <div className="rounded-2xl border border-white/15 bg-[#090d16]/95 backdrop-blur-2xl p-3 shadow-2xl min-w-[180px] space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-bold text-white font-mono flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              {data.fullDay}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
              {data.rate}%
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Present</span>
              <span className="font-bold text-white">{data.present} staff</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">On-Time</span>
              <span className="font-bold text-emerald-400">{data.onTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Late (&gt;15m)</span>
              <span className="font-bold text-[#f37021]">{data.late}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="col-span-full lg:col-span-8 rounded-3xl border border-white/10 dark:border-white/8 bg-[#090d16]/90 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl shadow-black/50 flex flex-col justify-between relative overflow-hidden group">
      {/* Background Soft Glow Orbs */}
      <div className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 size-72 rounded-full bg-[#f37021]/10 blur-3xl" />

      {/* ─── 1. Header Bar: Title, Live Telemetry Badge & Action ──────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 sm:size-11 rounded-2xl bg-gradient-to-br from-[#252175] to-[#f37021]/80 p-0.5 shadow-lg shadow-[#252175]/30 ring-1 ring-white/15 shrink-0 flex items-center justify-center text-white">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Workforce Velocity & Live Presence
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                44 Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Weekly attendance spline & real-time team arrival telemetry
            </p>
          </div>
        </div>

        <Link
          href="/attendance"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>Attendance Directory</span>
          <ArrowRight className="size-3 text-[#f37021]" />
        </Link>
      </div>

      {/* ─── 2. Dual-Zone Split: Stripe Spline (Left) + Live Ticker (Right) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-4 relative z-10 items-stretch">
        {/* Left Zone: Stripe/Vercel Luminous Spline Curve (7 Cols on Desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
          {/* Micro HUD Metrics */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-4 sm:gap-6">
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                  Avg Rate
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg sm:text-xl font-black font-mono text-white">96.4%</span>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">+2.1%</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                  On-Time Score
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg sm:text-xl font-black font-mono text-emerald-400">92.8%</span>
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">arr.</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                  Peak Inflow
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg sm:text-xl font-black font-mono text-[#f37021]">09:00 AM</span>
                </div>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveSignal(activeSignal === 'all' ? 'present' : 'all')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeSignal === 'all' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveSignal('present')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  activeSignal === 'present' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Present
              </button>
            </div>
          </div>

          {/* Luminous Razor-Sharp Spline Chart */}
          <div className="h-44 sm:h-52 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={splineData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  {/* Subtle Whisper-Light Gradient (No Heavy Solid Blobs) */}
                  <linearGradient id="stripeSplineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.22} />
                    <stop offset="60%" stopColor="#6366f1" stopOpacity={0.04} />
                    <stop offset="100%" stopColor="#0d1527" stopOpacity={0.00} />
                  </linearGradient>

                  <linearGradient id="lateSplineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f37021" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#f37021" stopOpacity={0.00} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="day"
                  stroke="currentColor"
                  className="text-slate-400 font-mono"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={6}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-slate-500 font-mono"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 50]}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Primary Present Spline */}
                {(activeSignal === 'all' || activeSignal === 'present') && (
                  <Area
                    type="monotone"
                    dataKey="present"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#stripeSplineGrad)"
                    activeDot={{
                      r: 5,
                      fill: '#ffffff',
                      stroke: '#06b6d4',
                      strokeWidth: 3,
                      className: 'drop-shadow-[0_0_8px_#22d3ee]',
                    }}
                  />
                )}

                {/* Secondary Late Curve */}
                {(activeSignal === 'all' || activeSignal === 'late') && (
                  <Area
                    type="monotone"
                    dataKey="late"
                    stroke="#f37021"
                    strokeWidth={1.75}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#lateSplineGrad)"
                    activeDot={{
                      r: 4,
                      fill: '#fb923c',
                      stroke: '#431407',
                      strokeWidth: 2,
                    }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Spline Legend */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <span className="text-slate-300 font-medium">Workforce Presence</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#f37021]" />
                <span className="text-slate-400">Late Check-in</span>
              </span>
            </div>

            <span className="text-[10px] font-mono text-emerald-400">Peak: Wed (46)</span>
          </div>
        </div>

        {/* Right Zone: Live "Who's In Office" Real-Time Clock-in Ticker (5 Cols on Desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-tight">
                Live Clock-In Activity
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Today</span>
          </div>

          {/* Real-time Employee Clock-in Feed */}
          <div className="space-y-2 py-2 flex-1">
            {liveClockIns.map((person) => (
              <div
                key={person.name}
                className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all group/item cursor-default"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`size-8 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 font-mono ${person.avatarBg}`}
                  >
                    {person.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate group-hover/item:text-primary transition-colors">
                      {person.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {person.dept} · {person.role}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[11px] font-mono font-bold text-white">
                    {person.time}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono mt-0.5 ${
                      person.status === 'on-time'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#f37021]/15 text-[#f37021] border border-[#f37021]/30'
                    }`}
                  >
                    {person.status === 'on-time' ? 'On-Time' : person.lateBy || 'Late'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Roster Summary */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users className="size-3 text-cyan-400" />
              <span>44 of 45 in office</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">1 on approved leave</span>
          </div>
        </div>
      </div>

      {/* ─── 3. Executive Footer: Biometric Health & Shift Indicator ────────── */}
      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>Biometric Sync: ZKTeco Engine Active</span>
          </div>
          <span className="text-white/20">·</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="size-3 text-[#f37021]" />
            <span>Standard Shift: 09:00 AM – 06:00 PM BST</span>
          </div>
        </div>

        <Link
          href="/attendance"
          className="text-primary hover:text-white font-semibold text-[11px] flex items-center gap-1 transition-colors self-end sm:self-auto"
        >
          <span>View Detailed Punch Logs</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}

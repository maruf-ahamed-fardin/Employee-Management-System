'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Sparkles,
  ArrowRight,
  Clock,
  Users,
  CheckCircle2,
  Zap,
  Building2,
  ShieldCheck,
} from 'lucide-react';

interface MetricRing {
  id: 'presence' | 'punctuality' | 'capacity';
  label: string;
  value: number;
  displayValue: string;
  sublabel: string;
  color: string;
  gradientId: string;
  filterId: string;
  r: number;
  strokeWidth: number;
  circumference: number;
}

const ringsConfig: MetricRing[] = [
  {
    id: 'presence',
    label: 'Total Presence',
    value: 96.4,
    displayValue: '44 / 45 Active',
    sublabel: '96.4% Staff Checked-In',
    color: '#06b6d4',
    gradientId: 'radial-cyan-grad',
    filterId: 'glow-cyan',
    r: 92,
    strokeWidth: 10,
    circumference: 2 * Math.PI * 92, // ~578.05
  },
  {
    id: 'punctuality',
    label: 'Punctuality Rate',
    value: 92.8,
    displayValue: '41 On-Time',
    sublabel: '92.8% Arrived < 09:15 AM',
    color: '#6366f1',
    gradientId: 'radial-indigo-grad',
    filterId: 'glow-indigo',
    r: 74,
    strokeWidth: 10,
    circumference: 2 * Math.PI * 74, // ~464.96
  },
  {
    id: 'capacity',
    label: 'Core Shift Capacity',
    value: 88.0,
    displayValue: '10A – 4P Overlap',
    sublabel: '88% Peak Shift Coverage',
    color: '#f37021',
    gradientId: 'radial-orange-grad',
    filterId: 'glow-orange',
    r: 56,
    strokeWidth: 10,
    circumference: 2 * Math.PI * 56, // ~351.86
  },
];

const departmentsData = [
  { name: 'Engineering & Dev', active: 18, total: 18, rate: 100, onTime: 17, late: 1, color: 'from-cyan-400 to-blue-500' },
  { name: 'Product & UX Design', active: 8, total: 8, rate: 100, onTime: 8, late: 0, color: 'from-indigo-400 to-purple-500' },
  { name: 'Marketing & Sales', active: 8, total: 9, rate: 89, onTime: 7, late: 1, color: 'from-[#f37021] to-amber-500' },
  { name: 'People & Operations', active: 7, total: 7, rate: 100, onTime: 7, late: 0, color: 'from-emerald-400 to-teal-500' },
  { name: 'Finance & Strategy', active: 3, total: 3, rate: 100, onTime: 3, late: 0, color: 'from-purple-400 to-pink-500' },
];

export function AttendanceChart() {
  const [activeRingId, setActiveRingId] = useState<'presence' | 'punctuality' | 'capacity'>('presence');

  const activeRing = ringsConfig.find((r) => r.id === activeRingId) || ringsConfig[0];

  return (
    <div className="col-span-full lg:col-span-8 rounded-3xl border border-white/10 dark:border-white/8 bg-[#090d16]/90 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl shadow-black/50 flex flex-col justify-between relative overflow-hidden group">
      {/* Background Soft Ambient Glows */}
      <div className="pointer-events-none absolute -top-28 -left-20 size-80 rounded-full bg-cyan-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 size-80 rounded-full bg-[#f37021]/10 blur-3xl" />

      {/* ─── 1. Header Bar with Cockpit Telemetry Badge ───────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 sm:size-11 rounded-2xl bg-gradient-to-br from-[#252175] via-[#4338ca] to-[#f37021]/80 p-0.5 shadow-lg shadow-[#252175]/40 ring-1 ring-white/20 shrink-0 flex items-center justify-center text-white">
            <Activity className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Workforce Biometric & Attendance HUD
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Concentric multi-ring telemetry and real-time team distribution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-xs">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Synced
          </span>

          <Link
            href="/attendance"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/10 transition-colors"
          >
            <span>Live Punch Log</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* ─── 2. Main Visual Canvas: Multi-Ring Radial Gauge + Department Feed ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4 relative z-10 items-center">
        {/* Left: Concentric 3-Ring Radial Gauge (Tesla / Apple Watch style) */}
        <div className="md:col-span-6 lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative size-60 sm:size-64 flex items-center justify-center">
            {/* SVG Concentric Rings */}
            <svg
              className="size-full -rotate-90 transform overflow-visible"
              viewBox="0 0 240 240"
            >
              <defs>
                {/* Cyan Gradient */}
                <linearGradient id="radial-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>

                {/* Indigo Gradient */}
                <linearGradient id="radial-indigo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>

                {/* SeloraX Orange Gradient */}
                <linearGradient id="radial-orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f37021" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>

                {/* Neon Glow Filters */}
                <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#06b6d4" floodOpacity="0.6" />
                </filter>
                <filter id="glow-indigo" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.6" />
                </filter>
                <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f37021" floodOpacity="0.7" />
                </filter>
              </defs>

              {/* 3 Dark Background Inset Tracks */}
              {ringsConfig.map((ring) => (
                <circle
                  key={`bg-${ring.id}`}
                  cx="120"
                  cy="120"
                  r={ring.r}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.06"
                  strokeWidth={ring.strokeWidth}
                />
              ))}

              {/* 3 Active Glowing Concentric Arcs */}
              {ringsConfig.map((ring) => {
                const isSelected = ring.id === activeRingId;
                const offset = ring.circumference * (1 - ring.value / 100);

                return (
                  <circle
                    key={`active-${ring.id}`}
                    cx="120"
                    cy="120"
                    r={ring.r}
                    fill="none"
                    stroke={`url(#${ring.gradientId})`}
                    strokeWidth={isSelected ? ring.strokeWidth + 2 : ring.strokeWidth}
                    strokeDasharray={ring.circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    filter={`url(#${ring.filterId})`}
                    className="transition-all duration-700 ease-out cursor-pointer hover:opacity-100"
                    opacity={isSelected ? 1 : 0.8}
                    onClick={() => setActiveRingId(ring.id)}
                  />
                );
              })}
            </svg>

            {/* Glowing Digital HUD Center Core */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                {activeRing.value}%
              </span>
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 mt-0.5">
                {activeRing.id === 'presence'
                  ? 'WORKFORCE'
                  : activeRing.id === 'punctuality'
                  ? 'ON-TIME'
                  : 'CAPACITY'}
              </span>
              <span
                style={{ color: activeRing.color }}
                className="text-[11px] font-mono font-bold mt-1"
              >
                {activeRing.displayValue}
              </span>
            </div>
          </div>

          {/* Interactive Metric Switcher Pills under the Radial HUD */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            {ringsConfig.map((r) => {
              const isSelected = r.id === activeRingId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRingId(r.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 text-white border border-white/20 shadow-md'
                      : 'text-slate-400 hover:text-slate-200 bg-white/[0.02] border border-white/5'
                  }`}
                >
                  <span
                    style={{ backgroundColor: r.color }}
                    className="size-2 rounded-full shadow-[0_0_6px_currentColor]"
                  />
                  <span>{r.label.split(' ')[0]}</span>
                  <span className="font-mono text-slate-300 font-bold">{r.value}%</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Live Department Distribution & Attendance Breakdown */}
        <div className="md:col-span-6 lg:col-span-7 space-y-3 p-3 sm:p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-slate-300">
              <Building2 className="size-3.5 text-[#f37021]" />
              Department Attendance Velocity
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">
              44 / 45 Checked In
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {departmentsData.map((dept) => (
              <div key={dept.name} className="space-y-1 group/row">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-1.5 rounded-full bg-cyan-400 group-hover/row:scale-125 transition-transform" />
                    <span className="font-medium text-slate-200 truncate group-hover/row:text-white transition-colors">
                      {dept.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                    <span className="text-slate-400 text-[11px]">
                      {dept.active}/{dept.total} staff
                    </span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        dept.rate === 100
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {dept.rate}%
                    </span>
                  </div>
                </div>

                {/* Sleek Gradient Capsule Progress Bar */}
                <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden flex">
                  <div
                    style={{ width: `${dept.rate}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${dept.color} shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-all duration-700`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Real-Time Shift Telemetry Note */}
          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="size-3 text-[#f37021]" />
              <span>Core Overlap Hours: 10:00 AM – 4:00 PM BST</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold hidden sm:inline">
              100% Coverage
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. Executive Footer: Biometric Health & Shift Indicator ────────── */}
      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>Biometric Engine: Active & Enforced</span>
          </div>
          <span className="text-white/20">·</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Zap className="size-3 text-[#f37021]" />
            <span>Auto-Calculated Payroll Shift</span>
          </div>
        </div>

        <Link
          href="/attendance"
          className="text-primary hover:text-white font-semibold text-[11px] flex items-center gap-1 transition-colors self-end sm:self-auto"
        >
          <span>Deep-dive Analytics</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}

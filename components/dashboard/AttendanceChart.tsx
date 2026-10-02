'use client';

import React, { useState } from 'react';
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
  Activity,
  Users,
  Clock,
  Sparkles,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

interface DayData {
  day: string;
  fullDay: string;
  present: number;
  late: number;
  onTime: number;
  absent: number;
  rate: number;
  isWeekend?: boolean;
}

const workWeekData: DayData[] = [
  { day: 'Mon', fullDay: 'Monday', present: 43, late: 4, onTime: 39, absent: 2, rate: 95.5 },
  { day: 'Tue', fullDay: 'Tuesday', present: 45, late: 2, onTime: 43, absent: 1, rate: 97.8 },
  { day: 'Wed', fullDay: 'Wednesday', present: 46, late: 3, onTime: 43, absent: 0, rate: 100.0 },
  { day: 'Thu', fullDay: 'Thursday', present: 44, late: 5, onTime: 39, absent: 2, rate: 95.5 },
  { day: 'Fri', fullDay: 'Friday', present: 43, late: 4, onTime: 39, absent: 3, rate: 93.4 },
];

const fullWeekData: DayData[] = [
  ...workWeekData,
  { day: 'Sat', fullDay: 'Saturday (Shift)', present: 14, late: 1, onTime: 13, absent: 0, rate: 93.3, isWeekend: true },
  { day: 'Sun', fullDay: 'Sunday (Roster)', present: 10, late: 0, onTime: 10, absent: 0, rate: 100.0, isWeekend: true },
];

const departmentBreakdown = [
  { name: 'Engineering & Dev', total: 18, present: 17, onTime: 16, late: 1, rate: 94.4, color: 'from-indigo-500 to-blue-600' },
  { name: 'Product & UX Design', total: 8, present: 8, onTime: 8, late: 0, rate: 100.0, color: 'from-purple-500 to-pink-500' },
  { name: 'Marketing & Growth', total: 9, present: 8, onTime: 7, late: 1, rate: 88.9, color: 'from-[#f37021] to-amber-500' },
  { name: 'Operations & HR', total: 7, present: 7, onTime: 7, late: 0, rate: 100.0, color: 'from-emerald-500 to-teal-600' },
  { name: 'Sales & BD', total: 6, present: 5, onTime: 4, late: 1, rate: 83.3, color: 'from-cyan-500 to-blue-500' },
];

export function AttendanceChart() {
  const [viewMode, setViewMode] = useState<'trends' | 'departments'>('trends');
  const [includeWeekend, setIncludeWeekend] = useState(false);
  const [activeMetric, setActiveMetric] = useState<'all' | 'present' | 'late'>('all');

  const chartData = includeWeekend ? fullWeekData : workWeekData;

  // Custom Glassmorphic Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as DayData;
      return (
        <div className="rounded-2xl border border-white/15 bg-slate-950/90 backdrop-blur-2xl p-3.5 shadow-2xl min-w-[190px] space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="size-3 text-[#f37021]" />
              {dataPoint.fullDay}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
              {dataPoint.rate}% Rate
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="size-2 rounded-full bg-indigo-400" />
                Present
              </span>
              <span className="font-bold text-white font-mono">{dataPoint.present} staff</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="size-2 rounded-full bg-emerald-400" />
                On-Time
              </span>
              <span className="font-bold text-emerald-400 font-mono">{dataPoint.onTime} staff</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="size-2 rounded-full bg-[#f37021]" />
                Late
              </span>
              <span className="font-bold text-[#f37021] font-mono">{dataPoint.late} staff</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="col-span-full lg:col-span-8 rounded-3xl border border-border/80 bg-card/70 backdrop-blur-2xl shadow-xl shadow-[#252175]/5 dark:shadow-black/40 overflow-hidden flex flex-col justify-between transition-all">
      {/* ─── Top Header with Status Pill and Mode Switcher ─────────────────── */}
      <div className="p-4 sm:p-6 border-b border-border/60 bg-gradient-to-b from-primary/5 via-transparent to-transparent space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 sm:size-11 rounded-2xl bg-gradient-to-br from-[#252175] to-[#f37021]/80 text-white flex items-center justify-center shadow-lg shadow-[#252175]/20 ring-1 ring-white/20 shrink-0">
              <Activity className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  Workforce Velocity & Attendance
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  96.4% Peak
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time workforce presence, punctuality and department flow
              </p>
            </div>
          </div>

          {/* View Toggles (Trends Curve vs Department Spectrum) */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted/50 p-1 rounded-xl border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('trends')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'trends'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp className="size-3.5 text-primary" />
              <span>Trends</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('departments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'departments'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="size-3.5 text-[#f37021]" />
              <span>Teams</span>
            </button>
          </div>
        </div>

        {/* ─── Executive Micro-KPI Bar ─────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
          <div className="p-2.5 sm:p-3 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground font-medium">
              <span>Avg. Daily</span>
              <Users className="size-3 text-indigo-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base sm:text-xl font-black text-foreground font-mono">44.2</span>
              <span className="text-[10px] text-emerald-500 font-bold hidden sm:inline">+3.8%</span>
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground font-medium">
              <span>Punctuality</span>
              <CheckCircle2 className="size-3 text-emerald-400" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base sm:text-xl font-black text-emerald-500 font-mono">92.8%</span>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">on-time</span>
            </div>
          </div>

          <div className="p-2.5 sm:p-3 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground font-medium">
              <span>Peak Day</span>
              <Sparkles className="size-3 text-[#f37021]" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base sm:text-xl font-black text-foreground font-mono">Wed</span>
              <span className="text-[10px] text-[#f37021] font-bold hidden sm:inline">46 check-ins</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content Area (Chart or Department Breakdown) ─────────────── */}
      <div className="p-4 sm:p-6 flex-1">
        {viewMode === 'trends' ? (
          <div className="space-y-4">
            {/* Filter controls: Metric filter + Weekday toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveMetric('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeMetric === 'all'
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  All Signals
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('present')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeMetric === 'present'
                      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <span className="inline-block size-1.5 rounded-full bg-indigo-400 mr-1.5" />
                  Present
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('late')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    activeMetric === 'late'
                      ? 'bg-[#f37021]/15 text-[#f37021] border border-[#f37021]/30'
                      : 'text-muted-foreground hover:bg-muted/40'
                  }`}
                >
                  <span className="inline-block size-1.5 rounded-full bg-[#f37021] mr-1.5" />
                  Late Arrivals
                </button>
              </div>

              {/* Mon-Fri vs 7-Days toggle */}
              <button
                type="button"
                onClick={() => setIncludeWeekend((prev) => !prev)}
                className="text-[11px] text-muted-foreground hover:text-foreground font-medium underline-offset-4 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{includeWeekend ? 'Showing: 7 Days (Incl. Weekend)' : 'Showing: Workdays (Mon–Fri)'}</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-muted/60 border">
                  Switch
                </span>
              </button>
            </div>

            {/* Glowing Chart Canvas */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -22, bottom: 0 }}>
                  <defs>
                    {/* Vibrant Indigo Present Gradient */}
                    <linearGradient id="luminousPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.45} />
                      <stop offset="60%" stopColor="#4338ca" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#312e81" stopOpacity={0} />
                    </linearGradient>

                    {/* SeloraX Orange Late Gradient */}
                    <linearGradient id="luminousLate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f37021" stopOpacity={0.4} />
                      <stop offset="60%" stopColor="#ea580c" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#9a3412" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="currentColor"
                    className="text-border/40"
                  />
                  <XAxis
                    dataKey="day"
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={6}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 50]}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Primary Present Area with Luminous Glow */}
                  {(activeMetric === 'all' || activeMetric === 'present') && (
                    <Area
                      type="monotone"
                      dataKey="present"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#luminousPresent)"
                      activeDot={{
                        r: 6,
                        fill: '#818cf8',
                        stroke: '#1e1b4b',
                        strokeWidth: 2.5,
                        className: 'shadow-lg',
                      }}
                    />
                  )}

                  {/* Secondary Late Area */}
                  {(activeMetric === 'all' || activeMetric === 'late') && (
                    <Area
                      type="monotone"
                      dataKey="late"
                      stroke="#f37021"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#luminousLate)"
                      activeDot={{
                        r: 5,
                        fill: '#fb923c',
                        stroke: '#431407',
                        strokeWidth: 2,
                      }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* Department Presence Breakdown View */
          <div className="space-y-3.5 py-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-1 border-b border-border/50">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Department</span>
              <div className="flex items-center gap-8">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Present</span>
                <span className="font-semibold uppercase tracking-wider text-[10px]">Punctuality</span>
              </div>
            </div>

            {departmentBreakdown.map((dept) => (
              <div key={dept.name} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2 rounded-full bg-primary shrink-0" />
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {dept.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ({dept.present}/{dept.total})
                    </span>
                  </div>
                  <div className="flex items-center gap-6 font-mono text-xs shrink-0">
                    <span className="font-bold text-foreground">{dept.present} staff</span>
                    <span className="w-12 text-right font-bold text-emerald-500">{dept.rate}%</span>
                  </div>
                </div>

                {/* Multi-segmented Progress Bar */}
                <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(dept.onTime / dept.total) * 100}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-primary rounded-l-full"
                    title={`On-time: ${dept.onTime}`}
                  />
                  {dept.late > 0 && (
                    <div
                      style={{ width: `${(dept.late / dept.total) * 100}%` }}
                      className="h-full bg-[#f37021]"
                      title={`Late: ${dept.late}`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Bottom Footer Bar with Micro Telemetry ──────────────────────── */}
      <div className="px-4 sm:px-6 py-3 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            <span className="text-[11px] font-medium text-foreground">Present Workforce</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#f37021] shadow-[0_0_8px_rgba(243,112,33,0.6)]" />
            <span className="text-[11px] font-medium text-foreground">Late Arrivals (&gt;15m)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <Clock className="size-3 text-[#f37021]" />
          <span>Core Overlap Hours: 10:00 AM – 4:00 PM</span>
        </div>
      </div>
    </div>
  );
}

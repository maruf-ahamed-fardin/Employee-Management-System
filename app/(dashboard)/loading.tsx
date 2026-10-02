import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      {/* ─── Linear Top Laser Telemetry Bar ─────────────────────────────── */}
      <div className="h-[2px] w-full overflow-hidden bg-white/5 relative rounded-full">
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#f37021] to-[#6366f1] shadow-[0_0_12px_rgba(243,112,33,0.6)] animate-scan-beam" />
      </div>

      {/* ─── Linear Header Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-7 w-48 sm:w-60 rounded-xl bg-white/8 linear-shimmer" />
            <div className="h-5 w-20 rounded-full bg-[#f37021]/15 border border-[#f37021]/30 linear-shimmer" />
          </div>
          <div className="h-3.5 w-64 sm:w-80 rounded-lg bg-white/5 linear-shimmer" />
        </div>

        <div className="flex items-center gap-3">
          {/* Live pulsing telemetry chip */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[10px] font-semibold tracking-wider uppercase text-emerald-400">
              Live Sync
            </span>
          </div>

          <div className="hidden sm:flex gap-2">
            <div className="h-8 w-24 rounded-xl border border-white/8 bg-white/5 linear-shimmer" />
            <div className="h-8 w-28 rounded-xl border border-white/8 bg-white/5 linear-shimmer" />
          </div>
        </div>
      </div>

      {/* ─── 4 Linear Obsidian KPI Metric Cards ──────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { color: 'border-blue-500/30 bg-blue-500/10 text-blue-400', progress: 'w-3/4 bg-blue-500/50' },
          { color: 'border-[#f37021]/30 bg-[#f37021]/10 text-[#f37021]', progress: 'w-1/2 bg-[#f37021]/50' },
          { color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400', progress: 'w-4/5 bg-emerald-500/50' },
          { color: 'border-purple-500/30 bg-purple-500/10 text-purple-400', progress: 'w-2/3 bg-purple-500/50' },
        ].map((card, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl border border-white/8 bg-[#0c111d]/50 backdrop-blur-xl p-4 sm:p-5 shadow-xs overflow-hidden linear-shimmer flex flex-col justify-between h-32 sm:h-36 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"
          >
            <div className="flex items-center justify-between">
              <div className={`size-8 sm:size-9 rounded-xl border ${card.color} flex items-center justify-center bg-white/5`} />
              <div className="h-4 w-12 rounded-full bg-white/5 border border-white/5" />
            </div>

            <div className="space-y-2 mt-auto">
              <div className="h-6 w-20 sm:w-24 rounded-lg bg-white/10" />
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 rounded-md bg-white/5" />
                <div className="h-3 w-8 rounded bg-white/5" />
              </div>
              <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                <div className={`h-full ${card.progress} rounded-full`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Linear Obsidian Workspace Table / List Skeleton ─────────────── */}
      <div className="rounded-2xl border border-white/8 bg-[#0c111d]/50 backdrop-blur-xl overflow-hidden shadow-xs relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent">
        {/* Skeleton Filter Strip */}
        <div className="p-3.5 sm:p-4 border-b border-white/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="h-8 w-full rounded-xl bg-white/5 border border-white/8 linear-shimmer" />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-7 w-20 rounded-lg bg-white/5 border border-white/5 linear-shimmer" />
            <div className="h-7 w-20 rounded-lg bg-white/5 border border-white/5 linear-shimmer" />
            <div className="h-7 w-24 rounded-lg bg-white/5 border border-white/5 linear-shimmer" />
          </div>
        </div>

        {/* Skeleton Rows (Linear Style) */}
        <div className="divide-y divide-white/5">
          {[
            { titleW: 'w-48 sm:w-64', catW: 'w-16', timeW: 'w-16' },
            { titleW: 'w-56 sm:w-72', catW: 'w-20', timeW: 'w-14' },
            { titleW: 'w-40 sm:w-56', catW: 'w-14', timeW: 'w-20' },
            { titleW: 'w-52 sm:w-68', catW: 'w-18', timeW: 'w-16' },
            { titleW: 'w-44 sm:w-60', catW: 'w-16', timeW: 'w-12' },
          ].map((row, i) => (
            <div
              key={i}
              className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 linear-shimmer"
            >
              {/* Left: Circle + Title + Tag */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-4.5 rounded-full border border-white/20 shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className={`h-3.5 ${row.titleW} rounded-full bg-white/10`} />
                  <div className="h-2.5 w-32 rounded-full bg-white/5" />
                </div>
                <div className={`h-4.5 ${row.catW} rounded-md bg-white/5 border border-white/5 hidden md:block shrink-0`} />
              </div>

              {/* Right: Assignee + Priority + Date */}
              <div className="flex items-center gap-3 sm:gap-4 pl-7 sm:pl-0 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-white/10 border border-white/10" />
                  <div className="h-3 w-16 rounded bg-white/5 hidden sm:block" />
                </div>
                <div className="h-4 w-12 rounded-full bg-white/5 border border-white/5" />
                <div className={`h-3 ${row.timeW} rounded bg-white/5`} />
                <div className="h-6 w-16 rounded-lg bg-white/5 border border-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

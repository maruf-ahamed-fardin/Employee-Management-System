export default function DashboardLoading() {
  return (
    <div className="space-y-6 select-none">
      {/* Sleek top laser telemetry beam */}
      <div className="h-[2px] w-full overflow-hidden bg-border/40 relative rounded-full">
        <div className="h-full w-2/5 bg-gradient-to-r from-transparent via-[#f37021] to-[#6366f1] animate-scan-beam" />
      </div>

      {/* Header with live radar telemetry indicator */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-56 sm:w-72 bg-muted/80 rounded-xl shimmer-box" />
            <div className="h-6 w-20 bg-primary/10 border border-primary/20 rounded-full shimmer-box" />
          </div>
          <div className="h-4 w-72 sm:w-96 bg-muted/50 rounded-lg shimmer-box" />
        </div>

        <div className="flex items-center gap-3">
          {/* Live pulsing telemetry chip */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[11px] font-medium tracking-wider uppercase">
              Live Sync
            </span>
          </div>

          <div className="hidden sm:flex gap-2">
            <div className="h-9 w-28 rounded-xl border border-border/70 bg-card/60 shimmer-box" />
            <div className="h-9 w-32 rounded-xl border border-border/70 bg-card/60 shimmer-box" />
          </div>
        </div>
      </div>

      {/* 4 Premium Glassmorphic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { color: 'border-indigo-500/30 bg-indigo-500/5', bar: 'w-3/4 bg-indigo-500/60' },
          { color: 'border-emerald-500/30 bg-emerald-500/5', bar: 'w-4/5 bg-emerald-500/60' },
          { color: 'border-[#f37021]/30 bg-[#f37021]/5', bar: 'w-1/2 bg-[#f37021]/60' },
          { color: 'border-purple-500/30 bg-purple-500/5', bar: 'w-2/3 bg-purple-500/60' },
        ].map((card, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-border/70 bg-card/50 backdrop-blur-xl p-5 relative overflow-hidden shadow-sm shimmer-card flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div
                className={`size-10 rounded-xl border ${card.color} flex items-center justify-center shimmer-box`}
              />
              <div className="h-5 w-16 rounded-full bg-muted/60 shimmer-box" />
            </div>

            <div className="space-y-2 mt-auto">
              <div className="h-7 w-24 bg-muted/80 rounded-lg shimmer-box" />
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-28 bg-muted/50 rounded-md shimmer-box" />
                <div className="h-3 w-10 bg-muted/40 rounded shimmer-box" />
              </div>
              <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className={`h-full ${card.bar} rounded-full`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column Split: Analytics Equalizer + Workforce Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Attendance & Metrics Chart Preview (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border/70 bg-card/50 backdrop-blur-xl p-6 relative overflow-hidden shadow-sm shimmer-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="h-5 w-48 bg-muted/80 rounded-md shimmer-box" />
              <div className="h-3.5 w-64 bg-muted/40 rounded shimmer-box" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-16 rounded-lg bg-muted/60 shimmer-box" />
              <div className="h-8 w-16 rounded-lg bg-muted/40 shimmer-box" />
              <div className="h-8 w-20 rounded-lg bg-muted/40 shimmer-box" />
            </div>
          </div>

          {/* Animated Equalizer / Bar Chart Skeleton */}
          <div className="h-52 w-full pt-8 pb-2 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-border/40">
            {[45, 78, 92, 60, 85, 40, 75, 95, 68, 82, 55, 90].map((h, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
              >
                <div
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 120}ms`,
                  }}
                  className={`w-full max-w-[28px] rounded-t-lg bg-gradient-to-t ${
                    i % 3 === 0
                      ? 'from-[#f37021]/30 to-[#f37021]/70'
                      : 'from-primary/20 to-primary/60'
                  } animate-chart-pulse`}
                />
                <div className="h-2 w-4 bg-muted/40 rounded-full" />
              </div>
            ))}
          </div>

          {/* Chart footer stats */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-primary" />
                <div className="h-3 w-16 bg-muted/50 rounded" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-[#f37021]" />
                <div className="h-3 w-16 bg-muted/50 rounded" />
              </div>
            </div>
            <div className="h-4 w-32 bg-muted/40 rounded shimmer-box" />
          </div>
        </div>

        {/* Right: Team Pulse / Recent Activity Skeleton (1 col) */}
        <div className="rounded-2xl border border-border/70 bg-card/50 backdrop-blur-xl p-6 relative overflow-hidden shadow-sm shimmer-card space-y-5">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 bg-muted/80 rounded-md shimmer-box" />
            <div className="h-4 w-12 bg-muted/40 rounded shimmer-box" />
          </div>

          <div className="space-y-4 pt-1">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-border/40 bg-muted/10 shimmer-box"
              >
                <div className="size-9 rounded-full bg-muted/80 shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-3.5 w-24 bg-muted/80 rounded" />
                  <div className="h-2.5 w-36 bg-muted/50 rounded" />
                </div>
                <div className="h-4 w-12 bg-muted/40 rounded-full shrink-0" />
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="h-9 w-full rounded-xl border border-border/60 bg-muted/20 shimmer-box" />
          </div>
        </div>
      </div>
    </div>
  );
}


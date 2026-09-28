export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded-xl" />
          <div className="h-4 w-96 bg-muted/60 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-muted rounded-xl" />
          <div className="h-10 w-36 bg-muted rounded-xl" />
        </div>
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl border bg-card/60 p-4 space-y-3">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border bg-card/60 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-9 w-64 bg-muted rounded-xl" />
          <div className="h-9 w-32 bg-muted rounded-xl" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 w-full bg-muted/40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  Info,
  Loader2,
  Percent,
  Printer,
  RotateCcw,
  Search,
  SearchX,
  Sparkles,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/format';
import type {
  RangePreset,
  ReportBreakdown,
  ReportData,
  ReportKpi,
  ReportTimeSeries,
  ReportType,
} from '@/server/services/report-builder.service';

const REPORT_TABS: { key: ReportType; label: string; icon: LucideIcon }[] = [
  { key: 'headcount', label: 'Headcount', icon: Users },
  { key: 'attendance', label: 'Attendance', icon: Clock },
  { key: 'leave', label: 'Leave', icon: Calendar },
  { key: 'turnover', label: 'Turnover', icon: TrendingUp },
];

const PRESETS: { key: Exclude<RangePreset, 'custom'>; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: 'ytd', label: 'This year' },
  { key: '12m', label: '12 months' },
];

const KPI_ICONS: Record<ReportKpi['icon'], LucideIcon> = {
  users: Users,
  check: CheckCircle2,
  clock: Clock,
  alert: AlertCircle,
  calendar: Calendar,
  trend: TrendingUp,
  percent: Percent,
  in: UserPlus,
  out: UserMinus,
};

// Series colors, stepped separately for the light and dark card surfaces
const PALETTES: Record<ReportTimeSeries['palette'], string> = {
  brand: '[--c0:#4f46e5] [--c1:#f97316] dark:[--c0:#6366f1] dark:[--c1:#ea580c]',
  attendance:
    '[--c0:#1baf7a] [--c1:#eda100] [--c2:#2a78d6] [--c3:#e34948] dark:[--c0:#199e70] dark:[--c1:#c98500] dark:[--c2:#3987e5] dark:[--c3:#e66767]',
};

const cardClass = 'rounded-2xl border bg-card shadow-[var(--shadow-panel)]';

const selectClass =
  'h-10 w-full appearance-none rounded-xl border border-input bg-background pl-3 pr-9 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';

const formatDay = (date: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));

interface Filters {
  type: ReportType;
  preset: RangePreset;
  from: string;
  to: string;
  departmentId: string;
  /** Whether the range came from the URL (so it should follow the user across tabs) */
  rangeExplicit: boolean;
}

function buildQuery(f: Filters, overrides: Partial<Filters> = {}) {
  const next = { ...f, ...overrides };
  const params = new URLSearchParams({ report: next.type });
  if (next.rangeExplicit) {
    params.set('range', next.preset);
    if (next.preset === 'custom') {
      params.set('from', next.from);
      params.set('to', next.to);
    }
  }
  if (next.departmentId) params.set('dept', next.departmentId);
  return params.toString();
}

// ─── Column chart (stacked or grouped) ────────────────────────────────────────

function niceTop(max: number) {
  if (max <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(max / 4)));
  const unit = [1, 2, 2.5, 5, 10].map((m) => m * step).find((s) => s * 4 >= max) || step * 10;
  return unit * 4;
}

function ColumnChart({ chart }: { chart: ReportTimeSeries }) {
  const [active, setActive] = useState<number | null>(null);
  const { series, points, stacked } = chart;

  const valueOf = (point: (typeof points)[number], key: string) => Number(point[key]) || 0;
  const totalOf = (point: (typeof points)[number]) => series.reduce((sum, s) => sum + valueOf(point, s.key), 0);
  const peak = Math.max(0, ...points.map((p) => (stacked ? totalOf(p) : Math.max(...series.map((s) => valueOf(p, s.key))))));
  const top = niceTop(peak);
  const ticks = [4, 3, 2, 1, 0].map((i) => (top / 4) * i);
  const labelEvery = Math.max(1, Math.ceil(points.length / 7));
  const activePoint = active !== null ? points[active] : null;

  return (
    <section className={cn(cardClass, 'p-4 sm:p-6', PALETTES[chart.palette])}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-x-6">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground">{chart.title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{chart.description}</p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {series.map((s, i) => (
            <li key={s.key} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-2.5 rounded-[3px]" style={{ background: `var(--c${i})` }} />
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      {peak === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 text-center sm:h-56">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <BarChart3 className="size-5" />
          </div>
          <p className="text-sm text-muted-foreground">Nothing recorded in this period.</p>
        </div>
      ) : (
        <div className="mt-5 flex gap-2 sm:gap-3">
          {/* Y axis */}
          <div className="flex h-44 flex-col justify-between text-right text-[11px] tabular-nums text-muted-foreground sm:h-56" aria-hidden>
            {ticks.map((t) => (
              <span key={t} className="-my-2 leading-4">
                {Number.isInteger(t) ? t : t.toFixed(1)}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative h-44 sm:h-56" onMouseLeave={() => setActive(null)}>
              {/* Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between" aria-hidden>
                {ticks.map((t) => (
                  <div key={t} className={cn('h-px w-full', t === 0 ? 'bg-foreground/25' : 'bg-border')} />
                ))}
              </div>

              {/* Columns */}
              <div className="absolute inset-0 flex items-stretch">
                {points.map((point, index) => {
                  const lastFilled = stacked ? series.map((s) => valueOf(point, s.key) > 0).lastIndexOf(true) : -1;
                  return (
                    <div
                      key={point.label}
                      tabIndex={0}
                      role="img"
                      aria-label={`${point.label}: ${series.map((s) => `${s.label} ${valueOf(point, s.key)}`).join(', ')}`}
                      onMouseEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      onBlur={() => setActive(null)}
                      className={cn(
                        'flex min-w-0 flex-1 justify-center px-px outline-none transition-colors',
                        active === index && 'bg-foreground/[0.04]'
                      )}
                    >
                      {stacked ? (
                        <div className="flex h-full w-full max-w-6 flex-col-reverse gap-0.5">
                          {series.map((s, i) => {
                            const value = valueOf(point, s.key);
                            if (value === 0) return null;
                            return (
                              <div
                                key={s.key}
                                className={cn('w-full shrink-0', i === lastFilled && 'rounded-t-[4px]')}
                                style={{ height: `${(value / top) * 100}%`, background: `var(--c${i})` }}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-end justify-center gap-0.5">
                          {series.map((s, i) => (
                            <div
                              key={s.key}
                              className="w-full max-w-6 rounded-t-[4px]"
                              style={{ height: `${(valueOf(point, s.key) / top) * 100}%`, background: `var(--c${i})` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tooltip */}
              {activePoint && active !== null && (
                <div
                  className="pointer-events-none absolute bottom-full z-10 mb-2 w-40 rounded-xl border bg-popover/95 p-3 text-popover-foreground shadow-[var(--shadow-card)] backdrop-blur sm:w-44"
                  style={{
                    left: `${((active + 0.5) / points.length) * 100}%`,
                    transform: `translateX(-${Math.min(85, Math.max(15, ((active + 0.5) / points.length) * 100))}%)`,
                  }}
                >
                  <p className="text-xs font-semibold text-foreground">{activePoint.label}</p>
                  <ul className="mt-2 space-y-1">
                    {series.map((s, i) => (
                      <li key={s.key} className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="size-2 rounded-[2px]" style={{ background: `var(--c${i})` }} />
                          {s.label}
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">{valueOf(activePoint, s.key)}</span>
                      </li>
                    ))}
                  </ul>
                  {stacked && (
                    <p className="mt-2 flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                      Total
                      <span className="font-semibold tabular-nums text-foreground">{totalOf(activePoint)}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* X axis */}
            <div className="mt-2 flex h-4" aria-hidden>
              {points.map((point, index) => (
                <div key={point.label} className="relative min-w-0 flex-1">
                  {(index % labelEvery === 0 || active === index) && (
                    <span
                      className={cn(
                        'absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px]',
                        active !== index && index % (labelEvery * 2) !== 0 && 'hidden sm:inline',
                        active === index ? 'z-10 bg-card px-1 font-semibold text-foreground' : 'text-muted-foreground',
                        active !== null && active !== index && Math.abs(active - index) < labelEvery && 'invisible'
                      )}
                    >
                      {point.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Horizontal bar list ──────────────────────────────────────────────────────

function BarList({ breakdown }: { breakdown: ReportBreakdown }) {
  const max = Math.max(1, ...breakdown.items.map((i) => i.value));
  const total = breakdown.items.reduce((sum, i) => sum + i.value, 0);

  return (
    <section className={cn(cardClass, 'p-4 sm:p-6')}>
      <h2 className="text-base font-bold tracking-tight text-foreground">{breakdown.title}</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">{breakdown.description}</p>

      {total === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Nothing to show for this period.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {breakdown.items.map((item) => (
            <li key={item.label} title={`${item.label}: ${item.value} ${breakdown.unit}`}>
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="truncate font-semibold text-foreground">{item.label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  <span className="font-semibold text-foreground">{item.value}</span> · {Math.round((item.value / total) * 100)}%
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-r-[4px] bg-muted">
                <div
                  className="h-full rounded-r-[4px] bg-primary transition-[width] duration-500"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Detail table ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function DataTable({ table }: { table: ReportData['table'] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? table.rows.filter((row) => table.columns.some((c) => String(row[c.key]).toLowerCase().includes(q))) : table.rows;
    if (!sort) return filtered;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const [x, y] = [a[sort.key], b[sort.key]];
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
    });
  }, [table, query, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = rows.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const toggleSort = (key: string, numeric?: boolean) => {
    setPage(0);
    setSort((prev) => (prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: numeric ? 'desc' : 'asc' }));
  };

  return (
    <section className={cardClass}>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground">{table.title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {rows.length === table.rows.length ? `${rows.length} rows` : `${rows.length} of ${table.rows.length} rows`}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center print:hidden">
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search this table..."
              aria-label={`Search ${table.title}`}
              className="pl-9"
            />
          </div>
          {/* Column headers are hidden on phones, so sorting moves into a menu */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="relative flex-1">
              <select
                value={sort?.key || ''}
                onChange={(e) => {
                  const column = table.columns.find((c) => c.key === e.target.value);
                  setPage(0);
                  setSort(column ? { key: column.key, dir: column.numeric ? 'desc' : 'asc' } : null);
                }}
                aria-label="Sort by"
                className={selectClass}
              >
                <option value="">Default order</option>
                {table.columns.map((c) => (
                  <option key={c.key} value={c.key}>
                    Sort by {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {sort && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label={sort.dir === 'asc' ? 'Sorted ascending, switch to descending' : 'Sorted descending, switch to ascending'}
                onClick={() => setSort({ key: sort.key, dir: sort.dir === 'asc' ? 'desc' : 'asc' })}
              >
                {sort.dir === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 border-t px-6 py-12 text-center">
          <SearchX className="size-5 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">{query ? 'No rows match your search' : 'No records for these filters'}</p>
          <p className="text-xs text-muted-foreground">
            {query ? 'Try a different search term.' : 'Try a wider date range or a different department.'}
          </p>
        </div>
      ) : (
        <>
        {/* Phones: one card per row */}
        <ul className="divide-y border-t md:hidden print:hidden">
          {visible.map((row, i) => (
            <li key={`${current}-${i}`} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-semibold text-foreground">{row[table.columns[1].key]}</p>
                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
                  {row[table.columns[0].key]}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                {table.columns.slice(2).map((c) => (
                  <div key={c.key} className="min-w-0">
                    <dt className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</dt>
                    <dd className={cn('mt-0.5 truncate text-sm text-foreground', c.numeric && 'tabular-nums')}>{row[c.key]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto border-t md:block print:block">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                {table.columns.map((c) => {
                  const active = sort?.key === c.key;
                  const Icon = !active ? ArrowUpDown : sort!.dir === 'asc' ? ArrowUp : ArrowDown;
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                      className={cn('whitespace-nowrap px-6 py-3', c.numeric ? 'text-right' : 'text-left')}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key, c.numeric)}
                        className={cn(
                          'inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors hover:text-foreground',
                          active ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {c.label}
                        <Icon className={cn('size-3 print:hidden', !active && 'opacity-50')} />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((row, i) => (
                <tr key={`${current}-${i}`} className="transition-colors hover:bg-muted/30">
                  {table.columns.map((c, ci) => (
                    <td
                      key={c.key}
                      className={cn(
                        'whitespace-nowrap px-6 py-3.5',
                        c.numeric ? 'text-right tabular-nums' : 'text-left',
                        ci <= 1 ? 'font-medium text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground sm:px-6 print:hidden">
          <span>
            Page <span className="font-semibold text-foreground">{current + 1}</span> of {pageCount}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)} aria-label="Next page">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ReportsClient({
  report,
  filters,
  departments,
  canExport,
}: {
  report: ReportData;
  filters: Filters;
  departments: { id: string; name: string }[];
  canExport: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [customFrom, setCustomFrom] = useState(filters.from);
  const [customTo, setCustomTo] = useState(filters.to);

  const navigate = (overrides: Partial<Filters>) => {
    startTransition(() => router.push(`/reports?${buildQuery(filters, overrides)}`, { scroll: false }));
  };

  const applyCustom = (from: string, to: string) => {
    setCustomFrom(from);
    setCustomTo(to);
    if (from && to && from <= to) navigate({ preset: 'custom', from, to, rangeExplicit: true });
  };

  const departmentName = departments.find((d) => d.id === filters.departmentId)?.name;
  const hasFilters = filters.rangeExplicit || !!filters.departmentId;
  const exportHref = `/api/reports/export?${buildQuery({ ...filters, rangeExplicit: true })}`;
  const customInvalid = !!customFrom && !!customTo && customFrom > customTo;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* The app shell is a fixed-height scroll container; let it flow across pages when printing */}
      <style>{`@media print {
        aside, header, body nav { display: none !important; }
        .h-screen, .overflow-hidden, .overflow-y-auto { height: auto !important; overflow: visible !important; }
        main { padding: 0 !important; }
      }`}</style>

      {/* Hero header */}
      <div className="relative isolate rounded-3xl border bg-card shadow-[var(--shadow-card)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl print:hidden">
          <div className="absolute inset-x-0 top-0 h-1" style={{ background: 'var(--brand-gradient)' }} />
          <div className="absolute -right-20 -top-28 size-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 size-64 rounded-full bg-brand-orange/10 blur-3xl" />
        </div>

        <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-blue">
              <Sparkles className="size-3" />
              Workforce analytics
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{report.title} report</h1>
            <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                <Calendar className="size-3.5 text-muted-foreground" />
                {report.usesDateRange ? `${formatDay(filters.from)} – ${formatDay(filters.to)}` : `As of ${formatDay(filters.to)}`}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                <Building2 className="size-3.5 text-muted-foreground" />
                {departmentName || 'All departments'}
              </span>
            </div>
          </div>

          <div className={cn('grid shrink-0 gap-2 sm:flex print:hidden', canExport ? 'grid-cols-2' : 'grid-cols-1')}>
            <Button variant="outline" onClick={() => window.print()} className="gap-2 bg-background/70 backdrop-blur">
              <Printer className="size-4" />
              Print / PDF
            </Button>
            {canExport && (
              <Button asChild className="gap-2 shadow-md shadow-primary/25">
                <a href={exportHref} download>
                  <FileSpreadsheet className="size-4" />
                  Export CSV
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Report tabs + filters */}
      <div className={cn(cardClass, 'space-y-3 p-2.5 sm:p-3 print:hidden')}>
        <nav aria-label="Report types" className="flex gap-1 overflow-x-auto rounded-xl bg-muted/60 p-1 [scrollbar-width:none]">
          {REPORT_TABS.map(({ key, label, icon: Icon }) => {
            const active = filters.type === key;
            return (
              <Link
                key={key}
                href={`/reports?${buildQuery(filters, { type: key })}`}
                scroll={false}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-w-fit flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-all sm:px-4',
                  active
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:bg-background hover:text-foreground'
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {report.usesDateRange ? (
            <>
              <div className="flex gap-1 overflow-x-auto rounded-xl border bg-background p-1 [scrollbar-width:none]">
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => navigate({ preset: p.key, rangeExplicit: true })}
                    aria-pressed={filters.preset === p.key}
                    className={cn(
                      'min-w-fit flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors lg:flex-none lg:py-1.5',
                      filters.preset === p.key ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 lg:flex">
                <Input
                  type="date"
                  value={customFrom}
                  max={customTo || undefined}
                  onChange={(e) => applyCustom(e.target.value, customTo)}
                  aria-label="From date"
                  aria-invalid={customInvalid}
                  className={cn('lg:w-40', customInvalid && 'border-destructive')}
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={customTo}
                  min={customFrom || undefined}
                  onChange={(e) => applyCustom(customFrom, e.target.value)}
                  aria-label="To date"
                  aria-invalid={customInvalid}
                  className={cn('lg:w-40', customInvalid && 'border-destructive')}
                />
              </div>
            </>
          ) : (
            <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <Info className="size-3.5 shrink-0" />
              Headcount is a snapshot of today, so it has no date range.
            </p>
          )}

          <div className="flex items-center gap-2 lg:ml-auto">
            <div className="relative flex-1 lg:w-52 lg:flex-none">
              <select
                value={filters.departmentId}
                onChange={(e) => navigate({ departmentId: e.target.value })}
                aria-label="Filter by department"
                className={selectClass}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {hasFilters && (
              <Button variant="ghost" size="icon" title="Reset filters" aria-label="Reset filters" onClick={() => router.push(`/reports?report=${filters.type}`, { scroll: false })}>
                <RotateCcw className="size-4" />
              </Button>
            )}
            {pending && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-label="Loading" />}
          </div>
        </div>
        {customInvalid && <p className="px-1 text-xs font-medium text-destructive">The start date must be on or before the end date.</p>}
      </div>

      <div className={cn('space-y-4 transition-opacity sm:space-y-5', pending && 'opacity-60')} aria-busy={pending}>
        {/* KPI tiles: the first one is the headline figure */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {report.kpis.map((kpi, index) => {
            const Icon = KPI_ICONS[kpi.icon];
            const hero = index === 0;
            return (
              <div
                key={kpi.label}
                className={cn(
                  'relative isolate overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] sm:p-5',
                  hero
                    ? 'col-span-2 border-transparent bg-primary text-primary-foreground shadow-lg shadow-primary/25 lg:col-span-1'
                    : 'bg-card shadow-[var(--shadow-panel)]'
                )}
              >
                {hero && <div aria-hidden className="absolute -right-8 -top-10 -z-10 size-32 rounded-full bg-white/15 blur-2xl" />}
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      'text-[11px] font-semibold uppercase leading-4 tracking-wider',
                      hero ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}
                  >
                    {kpi.label}
                  </p>
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg',
                      hero ? 'bg-white/15 text-primary-foreground' : 'bg-primary/10 text-brand-blue'
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                </div>
                <p className={cn('mt-3 font-black tracking-tight', hero ? 'text-4xl lg:text-3xl' : 'text-2xl sm:text-3xl')}>{kpi.value}</p>
                {kpi.hint && (
                  <p className={cn('mt-1.5 text-[11px] leading-snug', hero ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                    {kpi.hint}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {report.timeSeries && <ColumnChart chart={report.timeSeries} />}

        {report.breakdowns.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
            {report.breakdowns.map((b) => (
              <BarList key={b.title} breakdown={b} />
            ))}
          </div>
        )}

        <DataTable key={`${report.type}-${filters.from}-${filters.to}-${filters.departmentId}`} table={report.table} />

        {report.notes.length > 0 && (
          <ul className="space-y-1 px-1 text-[11px] leading-relaxed text-muted-foreground">
            {report.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <Info className="mt-0.5 size-3 shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

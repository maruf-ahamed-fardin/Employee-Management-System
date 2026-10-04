import { prisma } from '@/lib/db';
import { getTodayDateString } from '@/lib/utils/date';
import { getAttendanceSettings } from '@/lib/settings';
import { isCalendarDate } from '@/lib/utils/calendar-date';

export const REPORT_TYPES = ['headcount', 'attendance', 'leave', 'turnover'] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const RANGE_PRESETS = ['7d', '30d', '90d', 'ytd', '12m', 'custom'] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

export interface ReportFilters {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  departmentId: string | null;
}

export interface ReportKpi {
  label: string;
  value: string;
  hint?: string;
  icon: 'users' | 'check' | 'clock' | 'alert' | 'calendar' | 'trend' | 'percent' | 'in' | 'out';
}

export interface ReportBreakdown {
  title: string;
  description: string;
  unit: string;
  items: { label: string; value: number }[];
}

export interface ReportTimeSeries {
  title: string;
  description: string;
  stacked: boolean;
  palette: 'brand' | 'attendance';
  unit: string;
  series: { key: string; label: string }[];
  points: ({ label: string } & Record<string, number | string>)[];
}

export interface ReportColumn {
  key: string;
  label: string;
  numeric?: boolean;
}

export type ReportRow = Record<string, string | number>;

export interface ReportData {
  type: ReportType;
  title: string;
  description: string;
  usesDateRange: boolean;
  kpis: ReportKpi[];
  timeSeries: ReportTimeSeries | null;
  breakdowns: ReportBreakdown[];
  table: { title: string; columns: ReportColumn[]; rows: ReportRow[] };
  notes: string[];
}

// ─── Date helpers (all dates are YYYY-MM-DD strings, compared lexicographically) ───

const DAY_MS = 86_400_000;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MAX_RANGE_DAYS = 731;

const toUtc = (date: string) => new Date(`${date}T00:00:00Z`);
const toDateString = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (date: string, days: number) => toDateString(new Date(toUtc(date).getTime() + days * DAY_MS));
const isDateString = (value?: string | null): value is string => isCalendarDate(value);
const shortDay = (date: string) => `${MONTHS[Number(date.slice(5, 7)) - 1]} ${Number(date.slice(8, 10))}`;
const monthLabel = (month: string) => `${MONTHS[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;
const longDay = (date: string) => `${shortDay(date)}, ${date.slice(0, 4)}`;

function eachDay(from: string, to: string): string[] {
  const days: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return days;
}

function eachMonth(from: string, to: string): string[] {
  const months: string[] = [];
  let [y, m] = [Number(from.slice(0, 4)), Number(from.slice(5, 7))];
  const end = to.slice(0, 7);
  for (;;) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    if (key > end) break;
    months.push(key);
    m += 1;
    if (m > 12) [y, m] = [y + 1, 1];
  }
  return months;
}

export function defaultPreset(type: ReportType): RangePreset {
  return type === 'turnover' ? '12m' : '30d';
}

/** Turns the URL's range/from/to into a concrete, clamped date window. */
export function resolveRange(
  type: ReportType,
  params: { range?: string | null; from?: string | null; to?: string | null }
): { preset: RangePreset; from: string; to: string } {
  const today = getTodayDateString();
  const requested = RANGE_PRESETS.includes(params.range as RangePreset) ? (params.range as RangePreset) : defaultPreset(type);

  if (requested === 'custom' && isDateString(params.from) && isDateString(params.to)) {
    let [from, to] = params.from <= params.to ? [params.from, params.to] : [params.to, params.from];
    if ((toUtc(to).getTime() - toUtc(from).getTime()) / DAY_MS > MAX_RANGE_DAYS) from = addDays(to, -MAX_RANGE_DAYS);
    return { preset: 'custom', from, to };
  }

  const preset = requested === 'custom' ? defaultPreset(type) : requested;
  const from =
    preset === '7d'
      ? addDays(today, -6)
      : preset === '30d'
        ? addDays(today, -29)
        : preset === '90d'
          ? addDays(today, -89)
          : preset === 'ytd'
            ? `${today.slice(0, 4)}-01-01`
            : addDays(today, -364);
  return { preset, from, to: today };
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const pct = (part: number, whole: number) => (whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : '—');
const titleCase = (value?: string | null) =>
  (value || 'Unspecified')
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
const fullName = (e: { firstName: string; lastName: string }) => `${e.firstName} ${e.lastName}`;

function tally<T>(items: T[], keyOf: (item: T) => string, valueOf: (item: T) => number = () => 1) {
  const map = new Map<string, number>();
  for (const item of items) map.set(keyOf(item), (map.get(keyOf(item)) || 0) + valueOf(item));
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function fetchEmployees(departmentId: string | null, includeDeleted = false) {
  return prisma.employee.findMany({
    where: {
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(departmentId ? { departmentId } : {}),
    },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      gender: true,
      employmentType: true,
      status: true,
      joiningDate: true,
      deactivatedAt: true,
      deletedAt: true,
      department: { select: { name: true } },
      position: { select: { title: true } },
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  });
}

type ReportEmployee = Awaited<ReturnType<typeof fetchEmployees>>[number];

/** The day an employee stopped being on the books, if any. */
const exitDateOf = (e: ReportEmployee) => {
  const exit = e.deactivatedAt ?? e.deletedAt;
  return exit ? toDateString(exit) : null;
};
const employedOn = (e: ReportEmployee, date: string) => {
  const exit = exitDateOf(e);
  return e.joiningDate <= date && (!exit || exit > date);
};

// ─── Headcount ────────────────────────────────────────────────────────────────

async function buildHeadcount(filters: ReportFilters): Promise<ReportData> {
  const today = getTodayDateString();
  const [employees, departments] = await Promise.all([
    fetchEmployees(filters.departmentId),
    prisma.department.findMany({
      where: { isActive: true, deletedAt: null, ...(filters.departmentId ? { id: filters.departmentId } : {}) },
      select: { name: true },
    }),
  ]);

  const count = (status: string) => employees.filter((e) => e.status === status).length;
  const tenureYears = employees.map((e) => Math.max(0, toUtc(today).getTime() - toUtc(e.joiningDate).getTime()) / (365.25 * DAY_MS));
  const avgTenure = tenureYears.length ? tenureYears.reduce((a, b) => a + b, 0) / tenureYears.length : 0;

  const byDepartment = tally(employees, (e) => e.department.name);
  for (const d of departments) if (!byDepartment.some((item) => item.label === d.name)) byDepartment.push({ label: d.name, value: 0 });

  return {
    type: 'headcount',
    title: 'Headcount',
    description: 'Who is on the books today, by department, contract type and status',
    usesDateRange: false,
    kpis: [
      { label: 'Total employees', value: String(employees.length), icon: 'users' },
      { label: 'Active', value: String(count('ACTIVE')), hint: pct(count('ACTIVE'), employees.length) + ' of total', icon: 'check' },
      { label: 'On probation', value: String(count('PROBATION')), icon: 'clock' },
      { label: 'Inactive', value: String(count('INACTIVE')), icon: 'alert' },
      { label: 'Average tenure', value: `${avgTenure.toFixed(1)} yrs`, icon: 'calendar' },
    ],
    timeSeries: null,
    breakdowns: [
      { title: 'By department', description: 'Headcount in each department', unit: 'employees', items: byDepartment },
      {
        title: 'By employment type',
        description: 'Full-time, part-time, contract and intern split',
        unit: 'employees',
        items: tally(employees, (e) => titleCase(e.employmentType)),
      },
      { title: 'By status', description: 'Current employment status', unit: 'employees', items: tally(employees, (e) => titleCase(e.status)) },
      { title: 'By gender', description: 'As recorded on the employee profile', unit: 'employees', items: tally(employees, (e) => titleCase(e.gender)) },
    ],
    table: {
      title: 'Employee roster',
      columns: [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Employee' },
        { key: 'department', label: 'Department' },
        { key: 'position', label: 'Position' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
        { key: 'joined', label: 'Joined' },
      ],
      rows: employees.map((e) => ({
        code: e.employeeCode,
        name: fullName(e),
        department: e.department.name,
        position: e.position.title,
        type: titleCase(e.employmentType),
        status: titleCase(e.status),
        joined: e.joiningDate,
      })),
    },
    notes: [`Snapshot as of ${longDay(today)}.`],
  };
}

// ─── Attendance ───────────────────────────────────────────────────────────────

async function getWorkingWeekdays(): Promise<Set<number>> {
  const { workingDays } = await getAttendanceSettings();
  return new Set(workingDays.map((n) => WEEKDAYS.indexOf(n)).filter((i) => i >= 0));
}

async function buildAttendance(filters: ReportFilters): Promise<ReportData> {
  const today = getTodayDateString();
  const { from, to } = filters;

  const employees = await fetchEmployees(filters.departmentId);
  const ids = employees.map((e) => e.id);

  const [rows, leaves, holidays, workingWeekdays] = await Promise.all([
    prisma.attendance.findMany({
      where: { employeeId: { in: ids }, workDate: { gte: from, lte: to } },
      select: { employeeId: true, workDate: true, status: true, workedMinutes: true, lateMinutes: true },
    }),
    prisma.leaveRequest.findMany({
      where: { employeeId: { in: ids }, status: 'APPROVED', startDate: { lte: to }, endDate: { gte: from } },
      select: { employeeId: true, startDate: true, endDate: true },
    }),
    prisma.holiday.findMany({ where: { date: { gte: from, lte: to } }, select: { date: true } }),
    getWorkingWeekdays(),
  ]);

  const holidaySet = new Set(holidays.map((h) => h.date));
  const rowByKey = new Map(rows.map((r) => [`${r.employeeId}|${r.workDate}`, r]));
  const onLeave = (employeeId: string, date: string) => leaves.some((l) => l.employeeId === employeeId && l.startDate <= date && l.endDate >= date);

  type Counts = { onTime: number; late: number; onLeave: number; absent: number };
  const emptyCounts = (): Counts => ({ onTime: 0, late: 0, onLeave: 0, absent: 0 });

  const days = eachDay(from, to);
  const perDay = new Map<string, Counts>(days.map((d) => [d, emptyCounts()]));
  const perEmployee = new Map(ids.map((id) => [id, { ...emptyCounts(), workedMinutes: 0, lateMinutes: 0 }]));

  for (const day of days) {
    const isWorkingDay = workingWeekdays.has(toUtc(day).getUTCDay()) && !holidaySet.has(day);
    for (const e of employees) {
      const row = rowByKey.get(`${e.id}|${day}`);
      const dayCounts = perDay.get(day)!;
      const empCounts = perEmployee.get(e.id)!;

      let bucket: keyof Counts | null = null;
      if (row?.status === 'PRESENT') bucket = 'onTime';
      else if (row?.status === 'LATE') bucket = 'late';
      else if (row?.status === 'ON_LEAVE') bucket = 'onLeave';
      else if (row?.status === 'ABSENT') bucket = 'absent';
      // No record: only a scheduled, already-elapsed working day counts as leave or absence
      else if (!row && isWorkingDay && day <= today && employedOn(e, day)) bucket = onLeave(e.id, day) ? 'onLeave' : 'absent';

      if (!bucket) continue;
      dayCounts[bucket] += 1;
      empCounts[bucket] += 1;
      if (row && (bucket === 'onTime' || bucket === 'late')) {
        empCounts.workedMinutes += row.workedMinutes;
        empCounts.lateMinutes += row.lateMinutes;
      }
    }
  }

  const total = [...perDay.values()].reduce(
    (acc, c) => ({ onTime: acc.onTime + c.onTime, late: acc.late + c.late, onLeave: acc.onLeave + c.onLeave, absent: acc.absent + c.absent }),
    emptyCounts()
  );
  const attended = total.onTime + total.late;
  const scheduled = attended + total.absent;
  const workedMinutes = [...perEmployee.values()].reduce((sum, c) => sum + c.workedMinutes, 0);

  // Bucket the trend so long ranges stay readable: daily → weekly → monthly
  const bucketOf = (day: string) =>
    days.length <= 31 ? day : days.length <= 120 ? addDays(day, -((toUtc(day).getUTCDay() + 6) % 7)) : day.slice(0, 7);
  const bucketLabel = (key: string) => (days.length <= 31 ? shortDay(key) : days.length <= 120 ? `Wk of ${shortDay(key)}` : monthLabel(key));
  const buckets = new Map<string, Counts>();
  for (const day of days) {
    const key = bucketOf(day);
    const acc = buckets.get(key) || emptyCounts();
    const c = perDay.get(day)!;
    buckets.set(key, { onTime: acc.onTime + c.onTime, late: acc.late + c.late, onLeave: acc.onLeave + c.onLeave, absent: acc.absent + c.absent });
  }

  return {
    type: 'attendance',
    title: 'Attendance',
    description: 'Check-ins, lateness and absences for the selected period',
    usesDateRange: true,
    kpis: [
      { label: 'Attendance rate', value: pct(attended, scheduled), hint: `${attended} of ${scheduled} scheduled days attended`, icon: 'percent' },
      { label: 'Punctuality', value: pct(total.onTime, attended), hint: `${total.onTime} on-time check-ins`, icon: 'check' },
      { label: 'Late arrivals', value: String(total.late), icon: 'clock' },
      { label: 'Absences', value: String(total.absent), hint: 'Working days with no check-in or leave', icon: 'alert' },
      { label: 'Avg. hours per day', value: attended ? `${(workedMinutes / attended / 60).toFixed(1)} h` : '—', icon: 'trend' },
    ],
    timeSeries: {
      title: days.length <= 31 ? 'Daily attendance' : days.length <= 120 ? 'Weekly attendance' : 'Monthly attendance',
      description: 'Employee-days by outcome',
      stacked: true,
      palette: 'attendance',
      unit: 'employee-days',
      series: [
        { key: 'onTime', label: 'On time' },
        { key: 'late', label: 'Late' },
        { key: 'onLeave', label: 'On leave' },
        { key: 'absent', label: 'Absent' },
      ],
      points: [...buckets.entries()].map(([key, c]) => ({ label: bucketLabel(key), ...c })),
    },
    breakdowns: [],
    table: {
      title: 'Attendance by employee',
      columns: [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Employee' },
        { key: 'department', label: 'Department' },
        { key: 'present', label: 'Days present', numeric: true },
        { key: 'late', label: 'Late days', numeric: true },
        { key: 'onLeave', label: 'On leave', numeric: true },
        { key: 'absent', label: 'Absent', numeric: true },
        { key: 'avgHours', label: 'Avg. hours', numeric: true },
        { key: 'lateMinutes', label: 'Late minutes', numeric: true },
        { key: 'rate', label: 'Attendance %', numeric: true },
      ],
      rows: employees.map((e) => {
        const c = perEmployee.get(e.id)!;
        const present = c.onTime + c.late;
        return {
          code: e.employeeCode,
          name: fullName(e),
          department: e.department.name,
          present,
          late: c.late,
          onLeave: c.onLeave,
          absent: c.absent,
          avgHours: present ? Number((c.workedMinutes / present / 60).toFixed(1)) : 0,
          lateMinutes: c.lateMinutes,
          rate: present + c.absent > 0 ? Number(((present / (present + c.absent)) * 100).toFixed(1)) : 0,
        };
      }),
    },
    notes: [
      'An absence is a scheduled working day (per attendance settings, excluding holidays) with no check-in and no approved leave.',
      'Attendance rate = days attended ÷ (days attended + absences). Approved leave is excluded from both.',
    ],
  };
}

// ─── Leave ────────────────────────────────────────────────────────────────────

async function buildLeave(filters: ReportFilters): Promise<ReportData> {
  const { from, to } = filters;
  const employeeWhere = filters.departmentId ? { employee: { departmentId: filters.departmentId } } : {};

  const [requests, balances] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: { startDate: { lte: to }, endDate: { gte: from }, ...employeeWhere },
      include: {
        leaveType: { select: { name: true } },
        employee: { select: { employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } } },
      },
      orderBy: { startDate: 'desc' },
    }),
    prisma.leaveBalance.aggregate({
      where: { year: Number(to.slice(0, 4)), ...employeeWhere },
      _sum: { allocated: true, carriedForward: true, used: true },
    }),
  ]);

  const byStatus = (status: string) => requests.filter((r) => r.status === status);
  const approved = byStatus('APPROVED');
  const rejected = byStatus('REJECTED');
  const pending = byStatus('PENDING');
  const approvedDays = approved.reduce((sum, r) => sum + r.days, 0);
  const entitlement = (balances._sum.allocated || 0) + (balances._sum.carriedForward || 0);
  const live = requests.filter((r) => r.status === 'APPROVED' || r.status === 'PENDING');

  return {
    type: 'leave',
    title: 'Leave',
    description: 'Leave requests that overlap the selected period',
    usesDateRange: true,
    kpis: [
      { label: 'Requests', value: String(requests.length), icon: 'calendar' },
      { label: 'Approved days', value: String(approvedDays), hint: `${approved.length} approved requests`, icon: 'check' },
      { label: 'Awaiting review', value: String(pending.length), icon: 'clock' },
      {
        label: 'Approval rate',
        value: pct(approved.length, approved.length + rejected.length),
        hint: 'Of requests already decided',
        icon: 'percent',
      },
      {
        label: `Leave used in ${to.slice(0, 4)}`,
        value: pct(balances._sum.used || 0, entitlement),
        hint: `${balances._sum.used || 0} of ${entitlement} entitled days`,
        icon: 'trend',
      },
    ],
    timeSeries: null,
    breakdowns: [
      { title: 'Days by leave type', description: 'Approved and pending days', unit: 'days', items: tally(live, (r) => r.leaveType.name, (r) => r.days) },
      { title: 'Requests by status', description: 'All requests in the period', unit: 'requests', items: tally(requests, (r) => titleCase(r.status)) },
      {
        title: 'Days by department',
        description: 'Approved and pending days',
        unit: 'days',
        items: tally(live, (r) => r.employee.department.name, (r) => r.days),
      },
    ],
    table: {
      title: 'Leave requests',
      columns: [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Employee' },
        { key: 'department', label: 'Department' },
        { key: 'type', label: 'Leave type' },
        { key: 'start', label: 'Start' },
        { key: 'end', label: 'End' },
        { key: 'days', label: 'Days', numeric: true },
        { key: 'status', label: 'Status' },
        { key: 'requested', label: 'Requested on' },
      ],
      rows: requests.map((r) => ({
        code: r.employee.employeeCode,
        name: fullName(r.employee),
        department: r.employee.department.name,
        type: r.leaveType.name,
        start: r.startDate,
        end: r.endDate,
        days: r.days,
        status: titleCase(r.status),
        requested: toDateString(r.createdAt),
      })),
    },
    notes: ['A request is included when any part of it falls inside the period; its full length is counted.'],
  };
}

// ─── Turnover ─────────────────────────────────────────────────────────────────

async function buildTurnover(filters: ReportFilters): Promise<ReportData> {
  const { from, to } = filters;
  const employees = await fetchEmployees(filters.departmentId, true);

  const inRange = (date: string | null) => !!date && date >= from && date <= to;
  const hires = employees.filter((e) => inRange(e.joiningDate));
  const exits = employees.filter((e) => inRange(exitDateOf(e)));
  const headcountOn = (date: string) => employees.filter((e) => employedOn(e, date)).length;
  const startHeadcount = headcountOn(addDays(from, -1));
  const endHeadcount = headcountOn(to);
  const avgHeadcount = (startHeadcount + endHeadcount) / 2;

  const months = eachMonth(from, to);
  const events = [
    ...hires.map((e) => ({ e, date: e.joiningDate, event: 'Hire' })),
    ...exits.map((e) => ({ e, date: exitDateOf(e)!, event: 'Exit' })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return {
    type: 'turnover',
    title: 'Turnover',
    description: 'Hires and exits during the selected period',
    usesDateRange: true,
    kpis: [
      { label: 'Hires', value: String(hires.length), icon: 'in' },
      { label: 'Exits', value: String(exits.length), icon: 'out' },
      {
        label: 'Net change',
        value: `${hires.length - exits.length > 0 ? '+' : ''}${hires.length - exits.length}`,
        hint: `${startHeadcount} → ${endHeadcount} employees`,
        icon: 'trend',
      },
      { label: 'Turnover rate', value: pct(exits.length, avgHeadcount), hint: 'Exits ÷ average headcount', icon: 'percent' },
      { label: 'Headcount at period end', value: String(endHeadcount), icon: 'users' },
    ],
    timeSeries: {
      title: 'Hires and exits by month',
      description: 'People joining and leaving',
      stacked: false,
      palette: 'brand',
      unit: 'employees',
      series: [
        { key: 'hires', label: 'Hires' },
        { key: 'exits', label: 'Exits' },
      ],
      points: months.map((m) => ({
        label: monthLabel(m),
        hires: hires.filter((e) => e.joiningDate.startsWith(m)).length,
        exits: exits.filter((e) => exitDateOf(e)!.startsWith(m)).length,
      })),
    },
    breakdowns: [
      { title: 'Hires by department', description: 'New joiners in the period', unit: 'hires', items: tally(hires, (e) => e.department.name) },
      { title: 'Exits by department', description: 'Leavers in the period', unit: 'exits', items: tally(exits, (e) => e.department.name) },
    ],
    table: {
      title: 'Joiners and leavers',
      columns: [
        { key: 'date', label: 'Date' },
        { key: 'event', label: 'Event' },
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Employee' },
        { key: 'department', label: 'Department' },
        { key: 'position', label: 'Position' },
      ],
      rows: events.map(({ e, date, event }) => ({
        date,
        event,
        code: e.employeeCode,
        name: fullName(e),
        department: e.department.name,
        position: e.position.title,
      })),
    },
    notes: ['An exit is dated by when the employee was deactivated or removed. Turnover rate = exits ÷ average of start and end headcount.'],
  };
}

export function buildReport(type: ReportType, filters: ReportFilters): Promise<ReportData> {
  switch (type) {
    case 'attendance':
      return buildAttendance(filters);
    case 'leave':
      return buildLeave(filters);
    case 'turnover':
      return buildTurnover(filters);
    default:
      return buildHeadcount(filters);
  }
}

/** RFC 4180 CSV with a BOM so Excel reads UTF-8; text cells that look like formulas are neutralised. */
export function reportToCsv(report: ReportData): string {
  const cell = (value: string | number) => {
    let text = String(value ?? '');
    if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [
    report.table.columns.map((c) => cell(c.label)).join(','),
    ...report.table.rows.map((row) => report.table.columns.map((c) => cell(row[c.key])).join(',')),
  ];
  return '﻿' + lines.join('\r\n') + '\r\n';
}

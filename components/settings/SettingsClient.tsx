'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { confirmDialog } from '@/components/ui/confirm';
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  FileStack,
  FolderTree,
  KeyRound,
  Layers,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  ScrollText,
  Server,
  Settings2,
  ShieldCheck,
  Trash2,
  UserCog,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/format';
import { toast } from 'sonner';

export type SettingsTab = 'organization' | 'attendance' | 'holidays' | 'administration' | 'system';

interface OrganizationProfile {
  name: string;
  legalName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  taxId: string;
}

interface AttendanceSettings {
  workStartTime: string;
  workEndTime: string;
  gracePeriodMinutes: number;
  timezone: string;
  workingDays: string[];
}

export interface HolidayItem {
  id: string;
  date: string;
  name: string;
}

interface Props {
  initialTab: SettingsTab;
  initialOrganization: OrganizationProfile;
  initialAttendance: AttendanceSettings;
  initialHolidays: HolidayItem[];
  initialYear: number;
  counts: { users: number; roles: number; departments: number; positions: number; leaveTypes: number; documentTypes: number; auditLogs: number };
  system: {
    employees: number;
    users: number;
    documents: number;
    documentBytes: number;
    auditLogs: number;
    sessionDays: number;
    nodeVersion: string;
    environment: string;
    usingSampleSecret: boolean;
  };
}

const TABS: { key: SettingsTab; label: string; hint: string; icon: LucideIcon }[] = [
  { key: 'organization', label: 'Organization', hint: 'Company profile', icon: Building2 },
  { key: 'attendance', label: 'Attendance', hint: 'Shift & late policy', icon: Clock },
  { key: 'holidays', label: 'Holidays', hint: 'Public holiday calendar', icon: CalendarDays },
  { key: 'administration', label: 'Administration', hint: 'Users, roles & structure', icon: UserCog },
  { key: 'system', label: 'System', hint: 'Status & security', icon: Server },
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMEZONES = [
  'Asia/Dhaka',
  'Asia/Kolkata',
  'Asia/Karachi',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Singapore',
  'Asia/Kuala_Lumpur',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'UTC',
];

const cardClass = 'rounded-2xl border bg-card shadow-[var(--shadow-panel)]';
const labelClass = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';
const hintClass = 'mt-1.5 text-[11px] leading-snug text-muted-foreground';
const selectClass =
  'h-10 w-full appearance-none rounded-xl border border-input bg-background pl-3 pr-9 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';

const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const toClock = (minutes: number) => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
const utcDate = (date: string) => new Date(`${date}T00:00:00Z`);
const formatHoliday = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(utcDate(date));
const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : bytes < 1024 ** 3 ? `${(bytes / 1024 ** 2).toFixed(1)} MB` : `${(bytes / 1024 ** 3).toFixed(2)} GB`;

function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  children,
  footer,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className={cardClass}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-brand-blue">
            <Icon className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">{title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
      {footer}
    </section>
  );
}

/** Footer shown under a form: tells the user whether there is anything to save. */
function SaveBar({ dirty, saving, onReset, label }: { dirty: boolean; saving: boolean; onReset: () => void; label: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-b-2xl border-t bg-muted/30 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className={cn('flex items-center gap-2 text-xs font-medium', dirty ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
        <span className={cn('size-1.5 rounded-full', dirty ? 'bg-amber-500' : 'bg-emerald-500')} />
        {dirty ? 'You have unsaved changes' : 'All changes saved'}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button type="button" variant="outline" onClick={onReset} disabled={!dirty || saving} className="gap-2">
          <RotateCcw className="size-3.5" />
          Discard
        </Button>
        <Button type="submit" disabled={!dirty || saving} className="gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {label}
        </Button>
      </div>
    </div>
  );
}

export function SettingsClient({ initialTab, initialOrganization, initialAttendance, initialHolidays, initialYear, counts, system }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  // Organization
  const [savedOrg, setSavedOrg] = useState(initialOrganization);
  const [org, setOrg] = useState(initialOrganization);
  const [orgError, setOrgError] = useState('');
  const [savingOrg, setSavingOrg] = useState(false);

  // Attendance
  const [savedAttendance, setSavedAttendance] = useState(initialAttendance);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [attendanceError, setAttendanceError] = useState('');
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Holidays
  const [year, setYear] = useState(initialYear);
  const [holidays, setHolidays] = useState<HolidayItem[]>(initialHolidays);
  const [loadingYear, setLoadingYear] = useState(false);
  const [holidayForm, setHolidayForm] = useState<{ id: string | null; date: string; name: string } | null>(null);
  const [holidayError, setHolidayError] = useState('');
  const [savingHoliday, setSavingHoliday] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const orgDirty = JSON.stringify(org) !== JSON.stringify(savedOrg);
  const attendanceDirty = JSON.stringify(attendance) !== JSON.stringify(savedAttendance);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const selectTab = (next: SettingsTab) => {
    setTab(next);
    // Keep the tab in the URL without a server round-trip, so unsaved edits in other tabs survive
    window.history.replaceState(null, '', `/settings?tab=${next}`);
  };

  const saveSetting = async <T,>(url: string, value: T) => {
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to save settings');
    return data.data as T;
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOrg(true);
    setOrgError('');
    try {
      const saved = await saveSetting('/api/settings/organization', org);
      setSavedOrg(saved);
      setOrg(saved);
      toast.success('Organization profile saved');
      router.refresh();
    } catch (err: any) {
      setOrgError(err.message || 'Error saving organization profile');
    } finally {
      setSavingOrg(false);
    }
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attendance.workingDays.length === 0) return setAttendanceError('Select at least one working day');
    setSavingAttendance(true);
    setAttendanceError('');
    try {
      const saved = await saveSetting('/api/settings/attendance', attendance);
      setSavedAttendance(saved);
      setAttendance(saved);
      toast.success('Attendance policy saved');
      router.refresh();
    } catch (err: any) {
      setAttendanceError(err.message || 'Error saving attendance policy');
    } finally {
      setSavingAttendance(false);
    }
  };

  const toggleDay = (day: string) => {
    setAttendanceError('');
    setAttendance((prev) => ({
      ...prev,
      // Keep weekday order stable regardless of click order
      workingDays: WEEKDAYS.filter((d) => (d === day ? !prev.workingDays.includes(d) : prev.workingDays.includes(d))),
    }));
  };

  const changeYear = async (next: number) => {
    setLoadingYear(true);
    try {
      const res = await fetch(`/api/holidays?year=${next}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to load holidays');
      setHolidays(data.data || []);
      setYear(next);
    } catch (err: any) {
      toast.error(err.message || 'Error loading holidays');
    } finally {
      setLoadingYear(false);
    }
  };

  const handleSaveHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayForm) return;
    setSavingHoliday(true);
    setHolidayError('');
    try {
      const res = await fetch('/api/holidays', {
        method: holidayForm.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...holidayForm, name: holidayForm.name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to save holiday');

      const saved: HolidayItem = data.data;
      const savedYear = Number(saved.date.slice(0, 4));
      toast.success(holidayForm.id ? 'Holiday updated' : 'Holiday added');
      setHolidayForm(null);
      if (savedYear === year) {
        setHolidays((prev) => [...prev.filter((h) => h.id !== saved.id), saved].sort((a, b) => a.date.localeCompare(b.date)));
      } else {
        // Saved into another year: jump there so the user can see it
        await changeYear(savedYear);
      }
      router.refresh();
    } catch (err: any) {
      setHolidayError(err.message || 'Error saving holiday');
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (holiday: HolidayItem) => {
    const confirmed = await confirmDialog({
      title: 'Remove this holiday?',
      description: `${holiday.name} will be removed from the company calendar and count as a working day again.`,
      confirmLabel: 'Remove Holiday',
      tone: 'danger',
    });
    if (!confirmed) return;
    setDeletingId(holiday.id);
    try {
      const res = await fetch(`/api/holidays?id=${holiday.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete holiday');

      toast.success('Holiday removed');
      setHolidays((prev) => prev.filter((h) => h.id !== holiday.id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error removing holiday');
    } finally {
      setDeletingId(null);
    }
  };

  // Plain-language summary of what the attendance policy means
  const shiftMinutes = (toMinutes(attendance.workEndTime) - toMinutes(attendance.workStartTime) + 1440) % 1440;
  const lateAfter = toClock(toMinutes(attendance.workStartTime) + (Number(attendance.gracePeriodMinutes) || 0));
  const nextHoliday = holidays.find((h) => h.date >= today);
  const timezoneOptions = TIMEZONES.includes(attendance.timezone) ? TIMEZONES : [attendance.timezone, ...TIMEZONES];

  const adminLinks: { href: string; label: string; description: string; icon: LucideIcon; count: number; unit: string }[] = [
    { href: '/users', label: 'User accounts', description: 'Logins, roles and account status', icon: UserCog, count: counts.users, unit: 'users' },
    { href: '/roles', label: 'Roles & permissions', description: 'What each role can see and do', icon: KeyRound, count: counts.roles, unit: 'roles' },
    { href: '/departments', label: 'Departments', description: 'Company divisions and their heads', icon: FolderTree, count: counts.departments, unit: 'active' },
    { href: '/positions', label: 'Job positions', description: 'Designations, levels and base salaries', icon: Briefcase, count: counts.positions, unit: 'active' },
    { href: '/leave/types', label: 'Leave types', description: 'Leave categories and yearly allowances', icon: Layers, count: counts.leaveTypes, unit: 'types' },
    { href: '/documents/types', label: 'Document classifications', description: 'Document categories and expiry rules', icon: FileStack, count: counts.documentTypes, unit: 'types' },
    { href: '/audit-logs', label: 'Audit logs', description: 'Who changed what, and when', icon: ScrollText, count: counts.auditLogs, unit: 'entries' },
  ];

  const systemFacts: { label: string; value: string }[] = [
    { label: 'Environment', value: system.environment === 'production' ? 'Production' : 'Development' },
    { label: 'Database', value: 'SQLite' },
    { label: 'Runtime', value: `Node.js ${system.nodeVersion.replace(/^v/, '')}` },
    { label: 'File storage', value: 'Local disk' },
    { label: 'Employees', value: String(system.employees) },
    { label: 'User accounts', value: String(system.users) },
    { label: 'Documents', value: `${system.documents} · ${formatBytes(system.documentBytes)}` },
    { label: 'Audit entries', value: String(system.auditLogs) },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Hero header */}
      <div className="relative isolate rounded-3xl border bg-card shadow-[var(--shadow-card)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute inset-x-0 top-0 h-1" style={{ background: 'var(--brand-gradient)' }} />
          <div className="absolute -right-20 -top-28 size-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 size-64 rounded-full bg-brand-orange/10 blur-3xl" />
        </div>
        <div className="p-5 sm:p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-blue">
            <Settings2 className="size-3" />
            Administration
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Company profile, attendance policy, holidays and system administration.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
        {/* Section navigation: side rail on desktop, scrollable pills on phones */}
        <nav aria-label="Settings sections" className={cn(cardClass, 'flex gap-1 overflow-x-auto p-1.5 [scrollbar-width:none] lg:sticky lg:top-4 lg:flex-col lg:p-2')}>
          {TABS.map(({ key, label, hint, icon: Icon }) => {
            const active = tab === key;
            const dirty = (key === 'organization' && orgDirty) || (key === 'attendance' && attendanceDirty);
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectTab(key)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold">
                    {label}
                    {dirty && <span className="size-1.5 rounded-full bg-amber-400" title="Unsaved changes" />}
                  </span>
                  <span className={cn('hidden text-[11px] lg:block', active ? 'text-primary-foreground/75' : 'text-muted-foreground')}>{hint}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-4 sm:space-y-5">
          {/* ── Organization ─────────────────────────────────────────────── */}
          <div hidden={tab !== 'organization'}>
            <form onSubmit={handleSaveOrg}>
              <SectionCard
                icon={Building2}
                title="Organization profile"
                description="Your company's identity. The name appears in the sidebar."
                footer={<SaveBar dirty={orgDirty} saving={savingOrg} onReset={() => { setOrg(savedOrg); setOrgError(''); }} label="Save Profile" />}
              >
                {orgError && (
                  <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    {orgError}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="org-name" className={labelClass}>Organization name *</Label>
                    <Input id="org-name" className="mt-1.5" value={org.name} maxLength={80} required onChange={(e) => setOrg({ ...org, name: e.target.value })} />
                    <p className={hintClass}>The short name people see in the app.</p>
                  </div>
                  <div>
                    <Label htmlFor="org-legal" className={labelClass}>Legal name</Label>
                    <Input id="org-legal" className="mt-1.5" value={org.legalName} maxLength={120} placeholder="e.g. SeloraX Enterprise Ltd." onChange={(e) => setOrg({ ...org, legalName: e.target.value })} />
                    <p className={hintClass}>Registered company name, for official documents.</p>
                  </div>
                  <div>
                    <Label htmlFor="org-email" className={labelClass}>Contact email</Label>
                    <Input id="org-email" type="email" className="mt-1.5" value={org.email} placeholder="hr@company.com" onChange={(e) => setOrg({ ...org, email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="org-phone" className={labelClass}>Phone</Label>
                    <Input id="org-phone" type="tel" className="mt-1.5" value={org.phone} maxLength={30} placeholder="+880 1XXX-XXXXXX" onChange={(e) => setOrg({ ...org, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="org-website" className={labelClass}>Website</Label>
                    <Input id="org-website" type="url" className="mt-1.5" value={org.website} placeholder="https://company.com" onChange={(e) => setOrg({ ...org, website: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="org-tax" className={labelClass}>Tax / registration ID</Label>
                    <Input id="org-tax" className="mt-1.5" value={org.taxId} maxLength={50} placeholder="TIN / BIN / Trade licence" onChange={(e) => setOrg({ ...org, taxId: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="org-address" className={labelClass}>Office address</Label>
                    <textarea
                      id="org-address"
                      rows={3}
                      maxLength={250}
                      value={org.address}
                      onChange={(e) => setOrg({ ...org, address: e.target.value })}
                      placeholder="Street, city, postcode, country"
                      className="mt-1.5 w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </SectionCard>
            </form>
          </div>

          {/* ── Attendance ───────────────────────────────────────────────── */}
          <div hidden={tab !== 'attendance'}>
            <form onSubmit={handleSaveAttendance}>
              <SectionCard
                icon={Clock}
                title="Attendance & shift policy"
                description="Decides who is marked late at check-in, and which days count as absences in reports."
                footer={
                  <SaveBar
                    dirty={attendanceDirty}
                    saving={savingAttendance}
                    onReset={() => { setAttendance(savedAttendance); setAttendanceError(''); }}
                    label="Save Policy"
                  />
                }
              >
                {attendanceError && (
                  <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    {attendanceError}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="att-start" className={labelClass}>Shift starts</Label>
                    <Input id="att-start" type="time" className="mt-1.5" value={attendance.workStartTime} required onChange={(e) => setAttendance({ ...attendance, workStartTime: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="att-end" className={labelClass}>Shift ends</Label>
                    <Input id="att-end" type="time" className="mt-1.5" value={attendance.workEndTime} required onChange={(e) => setAttendance({ ...attendance, workEndTime: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="att-grace" className={labelClass}>Grace period (minutes)</Label>
                    <Input
                      id="att-grace"
                      type="number"
                      min={0}
                      max={120}
                      className="mt-1.5 tabular-nums"
                      value={attendance.gracePeriodMinutes}
                      required
                      onChange={(e) => setAttendance({ ...attendance, gracePeriodMinutes: Math.max(0, Math.min(120, parseInt(e.target.value, 10) || 0)) })}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <Label className={labelClass}>Working days</Label>
                  <div className="mt-2 grid grid-cols-7 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
                    {WEEKDAYS.map((day) => {
                      const on = attendance.workingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          aria-pressed={on}
                          aria-label={day}
                          className={cn(
                            'rounded-xl border py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4',
                            on ? 'border-transparent bg-primary text-primary-foreground shadow-sm shadow-primary/25' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                  <p className={hintClass}>Days that are off never count as late or absent.</p>
                </div>

                <div className="mt-5 sm:max-w-xs">
                  <Label htmlFor="att-tz" className={labelClass}>Timezone</Label>
                  <div className="relative mt-1.5">
                    <select id="att-tz" className={selectClass} value={attendance.timezone} onChange={(e) => setAttendance({ ...attendance, timezone: e.target.value })}>
                      {timezoneOptions.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <p className={hintClass}>Check-in times are compared with the shift start in this timezone.</p>
                </div>

                {/* What the policy means, in plain words */}
                <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand-blue">In practice</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <span>
                        The shift runs <strong>{attendance.workStartTime}–{attendance.workEndTime}</strong> ({Math.floor(shiftMinutes / 60)}h
                        {shiftMinutes % 60 ? ` ${shiftMinutes % 60}m` : ''}), {attendance.workingDays.length} day{attendance.workingDays.length === 1 ? '' : 's'} a week.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <Clock className="mt-0.5 size-4 shrink-0 text-amber-500" />
                      <span>
                        A check-in after <strong>{lateAfter}</strong> is marked late.
                      </span>
                    </li>
                  </ul>
                </div>
              </SectionCard>
            </form>
          </div>

          {/* ── Holidays ─────────────────────────────────────────────────── */}
          <div hidden={tab !== 'holidays'}>
            <SectionCard
              icon={CalendarDays}
              title="Public holidays"
              description="Holidays are never counted as late or absent."
              action={
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-xl border bg-background p-0.5">
                    <Button variant="ghost" size="icon" className="size-8" aria-label="Previous year" disabled={loadingYear} onClick={() => changeYear(year - 1)}>
                      <ChevronLeft className="size-4" />
                    </Button>
                    <span className="w-12 text-center text-sm font-bold tabular-nums text-foreground">
                      {loadingYear ? <Loader2 className="mx-auto size-4 animate-spin" /> : year}
                    </span>
                    <Button variant="ghost" size="icon" className="size-8" aria-label="Next year" disabled={loadingYear} onClick={() => changeYear(year + 1)}>
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => {
                      setHolidayError('');
                      setHolidayForm({ id: null, date: '', name: '' });
                    }}
                    className="flex-1 gap-2 sm:flex-none"
                  >
                    <Plus className="size-4" />
                    Add Holiday
                  </Button>
                </div>
              }
            >
              {holidays.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <CalendarDays className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">No holidays recorded for {year}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Add the public holidays your company observes.</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mb-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{holidays.length}</span> holiday{holidays.length === 1 ? '' : 's'} in {year}
                    {nextHoliday && (
                      <>
                        {' '}· next: <span className="font-semibold text-foreground">{nextHoliday.name}</span> on {formatHoliday(nextHoliday.date, { month: 'short', day: 'numeric' })}
                      </>
                    )}
                  </p>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {holidays.map((h) => {
                      const past = h.date < today;
                      const isNext = nextHoliday?.id === h.id;
                      return (
                        <li
                          key={h.id}
                          className={cn(
                            'group flex items-center gap-3 rounded-2xl border bg-background/40 p-3 transition-colors hover:bg-muted/40',
                            isNext && 'border-primary/40 bg-primary/5'
                          )}
                        >
                          <div
                            className={cn(
                              'flex size-12 shrink-0 flex-col items-center justify-center rounded-xl',
                              past ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-brand-blue'
                            )}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-wider">{formatHoliday(h.date, { month: 'short' })}</span>
                            <span className="text-lg font-black leading-none">{formatHoliday(h.date, { day: 'numeric' })}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn('truncate text-sm font-semibold', past ? 'text-muted-foreground' : 'text-foreground')}>{h.name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatHoliday(h.date, { weekday: 'long' })}
                              {isNext && <span className="ml-1.5 font-semibold text-brand-blue">· Next</span>}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground hover:bg-primary/10 hover:text-brand-blue"
                              aria-label={`Edit ${h.name}`}
                              onClick={() => {
                                setHolidayError('');
                                setHolidayForm({ id: h.id, date: h.date, name: h.name });
                              }}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={deletingId === h.id}
                              className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Remove ${h.name}`}
                              onClick={() => handleDeleteHoliday(h)}
                            >
                              {deletingId === h.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </SectionCard>
          </div>

          {/* ── Administration ───────────────────────────────────────────── */}
          <div hidden={tab !== 'administration'}>
            <SectionCard icon={UserCog} title="Administration" description="Everything else you manage for the company lives in these areas.">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {adminLinks.map(({ href, label, description, icon: Icon, count, unit }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex h-full items-center gap-3 rounded-2xl border bg-background/40 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-brand-blue">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{label}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold tabular-nums text-foreground">{count}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{unit}</p>
                      </div>
                      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand-blue" />
                    </Link>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          {/* ── System ───────────────────────────────────────────────────── */}
          <div hidden={tab !== 'system'} className="space-y-4 sm:space-y-5">
            <SectionCard icon={ShieldCheck} title="Security" description="How sign-in sessions are protected.">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 rounded-2xl border bg-background/40 p-4">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Sessions are signed</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Sign-in cookies are tamper-proof and expire after {system.sessionDays} days.
                    </p>
                  </div>
                </li>
                <li
                  className={cn(
                    'flex items-start gap-3 rounded-2xl border p-4',
                    system.usingSampleSecret ? 'border-amber-500/40 bg-amber-500/5' : 'bg-background/40'
                  )}
                >
                  {system.usingSampleSecret ? (
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {system.usingSampleSecret ? 'Signing secret is the sample value' : 'Signing secret is set'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {system.usingSampleSecret
                        ? 'AUTH_SECRET still matches the example shipped with the code. Set a private random value before going live, or sessions can be forged.'
                        : 'AUTH_SECRET is a private value, different from the example shipped with the code.'}
                    </p>
                  </div>
                </li>
              </ul>
            </SectionCard>

            <SectionCard icon={Database} title="System information" description="A read-only snapshot of this installation.">
              <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {systemFacts.map((fact) => (
                  <div key={fact.label} className="rounded-2xl border bg-background/40 p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{fact.label}</dt>
                    <dd className="mt-1.5 truncate text-sm font-bold text-foreground">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Add / edit holiday */}
      <Dialog open={holidayForm !== null} onOpenChange={(open) => !open && !savingHoliday && setHolidayForm(null)}>
        <DialogContent className="sm:max-w-md">
          {holidayForm && (
            <form onSubmit={handleSaveHoliday}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                  <CalendarDays className="size-5 text-brand-orange" />
                  {holidayForm.id ? 'Edit Holiday' : 'Add Public Holiday'}
                </DialogTitle>
                <DialogDescription>Staff are not expected to check in on this day.</DialogDescription>
              </DialogHeader>

              {holidayError && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {holidayError}
                </p>
              )}

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="holiday-name" className={labelClass}>Holiday name</Label>
                  <Input
                    id="holiday-name"
                    className="mt-1.5"
                    placeholder="e.g. Independence Day / Eid-ul-Fitr"
                    value={holidayForm.name}
                    maxLength={100}
                    onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="holiday-date" className={labelClass}>Date</Label>
                  <Input
                    id="holiday-date"
                    type="date"
                    className="mt-1.5"
                    value={holidayForm.date}
                    onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setHolidayForm(null)} disabled={savingHoliday}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savingHoliday}>
                  {savingHoliday && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {holidayForm.id ? 'Save Changes' : 'Add Holiday'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

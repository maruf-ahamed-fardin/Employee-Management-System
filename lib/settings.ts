import { z } from 'zod';
import { prisma } from '@/lib/db';

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a 24-hour time such as 09:00');

const isValidTimeZone = (value: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

// ─── Attendance policy ────────────────────────────────────────────────────────

export const attendanceSettingsSchema = z
  .object({
    workStartTime: time,
    workEndTime: time,
    gracePeriodMinutes: z.coerce.number().int().min(0, 'Grace period cannot be negative').max(120, 'Grace period cannot exceed 120 minutes'),
    timezone: z.string().refine(isValidTimeZone, 'Unknown timezone'),
    workingDays: z.array(z.enum(WEEKDAYS)).min(1, 'Select at least one working day'),
  })
  .refine((s) => s.workStartTime !== s.workEndTime, { message: 'Start and end time cannot be the same', path: ['workEndTime'] });

export type AttendanceSettings = z.infer<typeof attendanceSettingsSchema>;

export const DEFAULT_ATTENDANCE_SETTINGS: AttendanceSettings = {
  workStartTime: '09:00',
  workEndTime: '17:00',
  gracePeriodMinutes: 15,
  timezone: 'Asia/Dhaka',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
};

// ─── Organization profile ─────────────────────────────────────────────────────

const optionalText = (max: number) => z.string().trim().max(max, `Must be ${max} characters or fewer`).default('');

export const organizationProfileSchema = z.object({
  name: z.string().trim().min(1, 'Organization name is required').max(80, 'Must be 80 characters or fewer'),
  legalName: optionalText(120),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email address')]).default(''),
  phone: optionalText(30),
  website: z
    .union([z.literal(''), z.string().trim().url('Enter a full URL starting with https://').refine((v) => /^https?:\/\//i.test(v), 'Enter a full URL starting with https://')])
    .default(''),
  address: optionalText(250),
  taxId: optionalText(50),
});

export type OrganizationProfile = z.infer<typeof organizationProfileSchema>;

export const DEFAULT_ORGANIZATION_PROFILE: OrganizationProfile = {
  name: 'SeloraX Enterprise',
  legalName: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  taxId: '',
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const KEYS = { attendance: 'attendance_settings', organization: 'organization_profile' } as const;

async function readSetting<T extends object>(key: string, defaults: T): Promise<T> {
  try {
    const record = await prisma.setting.findUnique({ where: { key } });
    // Merge over defaults so settings saved before a field existed still load
    return record ? { ...defaults, ...JSON.parse(record.value) } : defaults;
  } catch {
    return defaults;
  }
}

async function writeSetting<T extends object>(key: string, value: T): Promise<T> {
  const json = JSON.stringify(value);
  await prisma.setting.upsert({ where: { key }, create: { key, value: json }, update: { value: json } });
  return value;
}

export async function getAttendanceSettings(): Promise<AttendanceSettings> {
  const stored = await readSetting(KEYS.attendance, DEFAULT_ATTENDANCE_SETTINGS);
  const parsed = attendanceSettingsSchema.safeParse(stored);
  return parsed.success ? parsed.data : DEFAULT_ATTENDANCE_SETTINGS;
}

export const saveAttendanceSettings = (value: AttendanceSettings) => writeSetting(KEYS.attendance, value);

export async function getOrganizationProfile(): Promise<OrganizationProfile> {
  const stored = await readSetting(KEYS.organization, DEFAULT_ORGANIZATION_PROFILE);
  const parsed = organizationProfileSchema.safeParse(stored);
  return parsed.success ? parsed.data : DEFAULT_ORGANIZATION_PROFILE;
}

export const saveOrganizationProfile = (value: OrganizationProfile) => writeSetting(KEYS.organization, value);

// ─── Lateness ─────────────────────────────────────────────────────────────────

const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** Wall-clock date, weekday and minutes-past-midnight of an instant in the given timezone. */
export function localClock(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    weekday: get('weekday'),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

/**
 * Minutes late for a check-in, measured from the shift start. Returns 0 when the
 * arrival is within the grace period or the day is not a scheduled working day.
 */
export function minutesLate(checkIn: Date, settings: AttendanceSettings, isHoliday: (localDate: string) => boolean): number {
  const clock = localClock(checkIn, settings.timezone);
  if (!(settings.workingDays as string[]).includes(clock.weekday) || isHoliday(clock.date)) return 0;
  const start = toMinutes(settings.workStartTime);
  return clock.minutes > start + settings.gracePeriodMinutes ? clock.minutes - start : 0;
}

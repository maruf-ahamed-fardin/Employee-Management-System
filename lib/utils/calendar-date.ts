/**
 * True only for a real calendar day written as YYYY-MM-DD. `new Date('2027-02-30')`
 * silently rolls over to March, so the value is round-tripped to catch that.
 */
export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

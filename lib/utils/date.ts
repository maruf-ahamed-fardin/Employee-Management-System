export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

export function formatTime(isoStr?: string | Date | null): string {
  if (!isoStr) return '--:--';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '--:--';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return '--:--';
  }
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0h 0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function calculateTenure(joiningDateStr?: string | null): string {
  if (!joiningDateStr) return 'New';
  const joined = new Date(joiningDateStr);
  const now = new Date();
  const diffMonths = (now.getFullYear() - joined.getFullYear()) * 12 + (now.getMonth() - joined.getMonth());
  if (diffMonths < 1) return 'New Joiner';
  if (diffMonths < 12) return `${diffMonths} mo`;
  const years = Math.floor(diffMonths / 12);
  const remMonths = diffMonths % 12;
  return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} yrs`;
}

export { formatCurrency } from './currency';

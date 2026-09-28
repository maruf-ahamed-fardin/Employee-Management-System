'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Building2, Plus, Trash2, ShieldCheck, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceSettings {
  workStartTime: string;
  workEndTime: string;
  gracePeriodMinutes: number;
  autoCloseTime: string;
  timezone: string;
  workingDays?: string[];
}

export interface HolidayItem {
  id: string;
  date: string;
  name: string;
}

interface Props {
  initialSettings: AttendanceSettings;
  initialHolidays: HolidayItem[];
}

export function SettingsClient({ initialSettings, initialHolidays }: Props) {
  const router = useRouter();

  // Settings state
  const [settings, setSettings] = useState<AttendanceSettings>(initialSettings);
  const [savingSettings, setSavingSettings] = useState(false);

  // Holidays state
  const [holidays, setHolidays] = useState<HolidayItem[]>(initialHolidays);
  const [holidayOpen, setHolidayOpen] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');
  const [addingHoliday, setAddingHoliday] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings/attendance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      toast.success('Attendance policy settings saved successfully');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error saving settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate || !holidayName.trim()) {
      toast.error('Date and Holiday Name are required');
      return;
    }
    setAddingHoliday(true);
    try {
      const res = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: holidayDate, name: holidayName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add holiday');

      toast.success('Public holiday registered');
      setHolidays((prev) => [...prev, data.data].sort((a, b) => a.date.localeCompare(b.date)));
      setHolidayOpen(false);
      setHolidayDate('');
      setHolidayName('');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error adding holiday');
    } finally {
      setAddingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('Remove this public holiday from the company calendar?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/holidays?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete holiday');

      toast.success('Holiday removed');
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Error removing holiday');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Attendance & Shift Timing Policies */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <form onSubmit={handleSaveSettings}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#252175]/10 dark:bg-[#252175]/30">
                <Clock className="size-5 text-[#252175] dark:text-[#F37021]" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-[#252175] dark:text-white">
                  Attendance & Shift Policies
                </CardTitle>
                <CardDescription>
                  Configure official work shifts, grace period rules, and automated day close times.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Work Day Start Time
                </Label>
                <Input
                  type="time"
                  value={settings.workStartTime}
                  onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
                  className="mt-1.5"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">Arrivals after this time and grace are marked LATE.</p>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Work Day End Time
                </Label>
                <Input
                  type="time"
                  value={settings.workEndTime}
                  onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
                  className="mt-1.5"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">Designates normal shift completion.</p>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Late Grace Period (Minutes)
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="120"
                  value={settings.gracePeriodMinutes}
                  onChange={(e) => setSettings({ ...settings, gracePeriodMinutes: parseInt(e.target.value) || 0 })}
                  className="mt-1.5"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">Allowed threshold before status is marked as Late.</p>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Auto Close-Day Time
                </Label>
                <Input
                  type="time"
                  value={settings.autoCloseTime}
                  onChange={(e) => setSettings({ ...settings, autoCloseTime: e.target.value })}
                  className="mt-1.5"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">Time when open unpunched shifts auto-close.</p>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  System Timezone
                </Label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#252175]"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (UTC+06:00)</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="America/New_York">America/New_York (UTC-05:00)</option>
                  <option value="Europe/London">Europe/London (UTC+00:00)</option>
                  <option value="Asia/Dubai">Asia/Dubai (UTC+04:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (UTC+08:00)</option>
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">Server clock normalization zone.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 flex justify-end py-3">
            <Button
              type="submit"
              disabled={savingSettings}
              className="bg-[#252175] hover:bg-[#1d1a5c] text-white gap-2 font-medium"
            >
              {savingSettings ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4 text-[#F37021]" />}
              Save Attendance Settings
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Public Holidays Calendar */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#252175]/10 dark:bg-[#252175]/30">
                <Calendar className="size-5 text-[#252175] dark:text-[#F37021]" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-[#252175] dark:text-white">
                  Public Holidays Calendar ({new Date().getFullYear()})
                </CardTitle>
                <CardDescription>
                  National and religious holidays that automatically excuse staff from attendance requirements.
                </CardDescription>
              </div>
            </div>

            <Dialog open={holidayOpen} onOpenChange={setHolidayOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#252175] hover:bg-[#1d1a5c] text-white gap-2 shrink-0">
                  <Plus className="size-4 text-[#F37021]" />
                  Add Holiday
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleAddHoliday}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#252175] dark:text-white flex items-center gap-2">
                      <Calendar className="size-5 text-[#F37021]" />
                      Add Public Holiday
                    </DialogTitle>
                    <DialogDescription>
                      Register an official holiday into the organization schedule.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Holiday Date
                      </Label>
                      <Input
                        type="date"
                        value={holidayDate}
                        onChange={(e) => setHolidayDate(e.target.value)}
                        className="mt-1.5"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Holiday Name / Occasion
                      </Label>
                      <Input
                        placeholder="e.g. Independence Day / Eid-ul-Fitr"
                        value={holidayName}
                        onChange={(e) => setHolidayName(e.target.value)}
                        className="mt-1.5"
                        required
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => setHolidayOpen(false)} disabled={addingHoliday}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={addingHoliday}
                      className="bg-[#252175] hover:bg-[#1d1a5c] text-white"
                    >
                      {addingHoliday && <Loader2 className="size-4 mr-2 animate-spin" />}
                      Register Holiday
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {holidays.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Calendar className="size-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-sm">No holidays recorded for this year</p>
              <p className="text-xs">Click &quot;Add Holiday&quot; above to declare public holidays.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {holidays.map((h) => {
                const dateObj = new Date(h.date);
                const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                const day = dateObj.getDate();
                const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-2xl border bg-card hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center size-12 rounded-xl bg-[#252175]/10 dark:bg-[#252175]/30 text-[#252175] dark:text-[#F37021] shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider">{month}</span>
                        <span className="text-lg font-black leading-none">{day}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground leading-tight">{h.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                          {h.date} ({weekday})
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === h.id}
                      className="size-8 text-destructive hover:bg-destructive/10 shrink-0"
                      title="Delete Holiday"
                      onClick={() => handleDeleteHoliday(h.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enterprise Organization Identity */}
      <Card className="rounded-2xl border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#252175]/10 dark:bg-[#252175]/30">
              <Building2 className="size-5 text-[#252175] dark:text-[#F37021]" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-[#252175] dark:text-white">
                Enterprise Workspace Profile
              </CardTitle>
              <CardDescription>System identity and core deployment parameters.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Organization</p>
              <p className="font-bold text-foreground mt-1">SeloraX Enterprise Ltd</p>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Platform Engine</p>
              <p className="font-bold text-foreground mt-1">SeloraX EMS 2026 Core</p>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Default Currency</p>
              <p className="font-bold text-foreground mt-1">BDT / USD Multi-Currency</p>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Security Mode</p>
              <div className="flex items-center gap-1.5 mt-1 text-emerald-600 font-bold">
                <ShieldCheck className="size-4" />
                Active RBAC & Audit
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

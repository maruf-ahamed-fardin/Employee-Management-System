'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Clock, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

interface Props {
  employees: EmployeeOption[];
  defaultDate: string;
  record?: {
    id?: string;
    employeeId: string;
    workDate: string;
    status: string;
    firstInAt?: string | null;
    lastOutAt?: string | null;
    note?: string | null;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CorrectionDialog({ employees, defaultDate, record, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(record?.employeeId || employees[0]?.id || '');
  const [workDate, setWorkDate] = useState(record?.workDate || defaultDate);
  const [status, setStatus] = useState(record?.status || 'PRESENT');
  
  // Format times as HH:mm if available
  const extractTime = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toTimeString().substring(0, 5);
    } catch {
      return '';
    }
  };

  const [timeIn, setTimeIn] = useState(extractTime(record?.firstInAt) || '09:00');
  const [timeOut, setTimeOut] = useState(extractTime(record?.lastOutAt) || '17:00');
  const [note, setNote] = useState(record?.note || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !workDate) {
      toast.error('Employee and Date are required');
      return;
    }

    setLoading(true);
    try {
      // Build ISO timestamps for firstIn and lastOut
      let firstInAt = null;
      let lastOutAt = null;

      if (timeIn && status !== 'ABSENT') {
        firstInAt = new Date(`${workDate}T${timeIn}:00`).toISOString();
      }
      if (timeOut && status !== 'ABSENT') {
        lastOutAt = new Date(`${workDate}T${timeOut}:00`).toISOString();
      }

      const res = await fetch('/api/attendance/correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceId: record?.id,
          employeeId,
          workDate,
          status,
          firstInAt,
          lastOutAt,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit correction');
      }

      toast.success(record?.id ? 'Attendance record updated' : 'Manual attendance logged');
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error updating attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline" size="sm" className="gap-2 border-[#252175]/30 text-[#252175] dark:text-[#F37021] hover:bg-[#252175]/10">
            <Plus className="size-4" />
            Manual Log / Correction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#252175] dark:text-white flex items-center gap-2">
              <Pencil className="size-5 text-[#F37021]" />
              {record?.id ? 'Attendance Time Correction' : 'Log Manual Attendance'}
            </DialogTitle>
            <DialogDescription>
              Adjust shift punch times or manually log attendance with a documented audit reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Employee
              </Label>
              <select
                disabled={Boolean(record?.id)}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#252175] disabled:opacity-60"
                required
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Work Date
                </Label>
                <Input
                  type="date"
                  value={workDate}
                  disabled={Boolean(record?.id)}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#252175]"
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="ABSENT">Absent</option>
                  <option value="ON_LEAVE">On Leave</option>
                </select>
              </div>
            </div>

            {status !== 'ABSENT' && status !== 'ON_LEAVE' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-[#252175] dark:text-[#F37021]" />
                    Check In Time
                  </Label>
                  <Input
                    type="time"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5 text-[#252175] dark:text-[#F37021]" />
                    Check Out Time
                  </Label>
                  <Input
                    type="time"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Correction Reason / Audit Note
              </Label>
              <Textarea
                placeholder="e.g. Biometric scanner offline, client site deployment approved by manager"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1.5"
                rows={3}
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#252175] hover:bg-[#1d1a5c] text-white"
            >
              {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
              Save Correction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { formatTime, formatDuration } from '@/lib/utils/date';
import { toast } from 'sonner';

export function CheckInCard({
  initialAttendance,
  onRefresh,
}: {
  initialAttendance?: any;
  onRefresh?: () => void;
}) {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [punching, setPunching] = useState(false);

  const hasCheckedIn = Boolean(attendance?.firstInAt);
  const hasCheckedOut = Boolean(attendance?.lastOutAt);

  const handlePunch = async (type: 'CHECK_IN' | 'CHECK_OUT') => {
    setPunching(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(type === 'CHECK_IN' ? 'Checked in successfully!' : 'Checked out successfully!');
        if (onRefresh) onRefresh();
        // Optimistic refresh
        const now = new Date().toISOString();
        setAttendance((prev: any) => ({
          ...prev,
          firstInAt: type === 'CHECK_IN' ? now : prev?.firstInAt,
          lastOutAt: type === 'CHECK_OUT' ? now : prev?.lastOutAt,
        }));
      } else {
        toast.error(data.error || 'Failed to punch');
      }
    } catch {
      toast.error('Punch network error');
    } finally {
      setPunching(false);
    }
  };

  return (
    <Card className="overflow-hidden border-[#252175]/20 dark:border-[#4f46e5]/30 bg-gradient-to-br from-[#252175]/5 via-[#f37021]/5 to-transparent">
      <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-[#252175] to-[#f37021] text-white shadow-md shadow-[#252175]/25">
            <Clock className="size-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Today’s Attendance Punch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Standard shift 09:00 AM – 05:00 PM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">First In</span>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              {formatTime(attendance?.firstInAt)}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Last Out</span>
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              {formatTime(attendance?.lastOutAt)}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Worked</span>
            <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatDuration(attendance?.workedMinutes || 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {!hasCheckedIn ? (
            <Button
              onClick={() => handlePunch('CHECK_IN')}
              disabled={punching}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <LogIn className="size-4 mr-1.5" />
              Check In
            </Button>
          ) : !hasCheckedOut ? (
            <Button
              onClick={() => handlePunch('CHECK_OUT')}
              disabled={punching}
              variant="destructive"
            >
              <LogOut className="size-4 mr-1.5" />
              Check Out
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl">
              <CheckCircle2 className="size-4" />
              Shift Completed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

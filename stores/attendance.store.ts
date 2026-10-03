import { create } from 'zustand';
import { toast } from 'sonner';

export interface AttendanceRecordItem {
  id: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  occurredAt: string;
  source?: string;
  ip?: string | null;
}

export interface TodayAttendanceData {
  id?: string;
  employeeId?: string;
  workDate?: string;
  firstInAt?: string | null;
  lastOutAt?: string | null;
  workedMinutes?: number;
  status?: string;
  records?: AttendanceRecordItem[];
}

interface AttendanceState {
  attendance: TodayAttendanceData | null;
  employeeId: string | null;
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  isLoading: boolean;
  isPunching: boolean;
  hasLoaded: boolean;
  fetchToday: () => Promise<void>;
  punch: (type: 'CHECK_IN' | 'CHECK_OUT') => Promise<boolean>;
  resumeShift: () => Promise<boolean>;
  setAttendance: (att: TodayAttendanceData | null) => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  attendance: null,
  employeeId: null,
  isCheckedIn: false,
  isCheckedOut: false,
  isLoading: false,
  isPunching: false,
  hasLoaded: false,

  setAttendance: (att) => {
    const isCheckedIn = Boolean(att?.firstInAt && !att?.lastOutAt);
    const isCheckedOut = Boolean(att?.firstInAt && att?.lastOutAt);
    set({
      attendance: att,
      isCheckedIn,
      isCheckedOut,
      hasLoaded: true,
    });
  },

  fetchToday: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/attendance/today', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch today attendance');
      const data = await res.json();
      if (data.success && data.data) {
        const att = data.data.attendance;
        const isCheckedIn = Boolean(att?.firstInAt && !att?.lastOutAt);
        const isCheckedOut = Boolean(att?.firstInAt && att?.lastOutAt);
        set({
          attendance: att,
          employeeId: data.data.employeeId,
          isCheckedIn,
          isCheckedOut,
          isLoading: false,
          hasLoaded: true,
        });
      } else {
        set({ isLoading: false, hasLoaded: true });
      }
    } catch {
      set({ isLoading: false, hasLoaded: true });
    }
  },

  punch: async (type: 'CHECK_IN' | 'CHECK_OUT') => {
    set({ isPunching: true });
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedAtt = data.data?.attendance || {
          firstInAt: type === 'CHECK_IN' ? new Date().toISOString() : get().attendance?.firstInAt,
          lastOutAt: type === 'CHECK_OUT' ? new Date().toISOString() : get().attendance?.lastOutAt,
          status: 'PRESENT',
        };

        const isCheckedIn = Boolean(updatedAtt?.firstInAt && !updatedAtt?.lastOutAt);
        const isCheckedOut = Boolean(updatedAtt?.firstInAt && updatedAtt?.lastOutAt);

        set({
          attendance: updatedAtt,
          isCheckedIn,
          isCheckedOut,
          isPunching: false,
        });

        // Broadcast across components & tabs
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('ems:attendance-changed', {
              detail: { type, attendance: updatedAtt },
            })
          );
        }

        toast.success(
          type === 'CHECK_IN'
            ? 'Clocked in successfully! Workday started.'
            : 'Clocked out successfully! Have a great evening.'
        );
        return true;
      } else {
        toast.error(data.error || 'Failed to record punch');
        set({ isPunching: false });
        return false;
      }
    } catch {
      toast.error('Network error recording punch');
      set({ isPunching: false });
      return false;
    }
  },

  resumeShift: async () => {
    set({ isPunching: true });
    try {
      const res = await fetch('/api/attendance/resume', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const updatedAtt = data.data?.attendance;
        set({
          attendance: updatedAtt,
          isCheckedIn: true,
          isCheckedOut: false,
          isPunching: false,
        });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('ems:attendance-changed', {
              detail: { type: 'CHECK_IN', attendance: updatedAtt },
            })
          );
        }

        toast.success('Shift resumed! Welcome back to active duty.');
        return true;
      } else {
        toast.error(data.error || 'Failed to resume shift');
        set({ isPunching: false });
        return false;
      }
    } catch {
      toast.error('Network error resuming shift');
      set({ isPunching: false });
      return false;
    }
  },
}));

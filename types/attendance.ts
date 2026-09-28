export type AttendanceStatus =
  | 'PRESENT'
  | 'LATE'
  | 'ABSENT'
  | 'ON_LEAVE'
  | 'WEEKEND'
  | 'HOLIDAY';

export type AttendanceSource = 'WEB' | 'MOBILE' | 'BIOMETRIC' | 'RFID' | 'ADMIN';

export interface AttendanceRecord {
  id: string;
  attendanceId: string;
  employeeId: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  occurredAt: string;
  source: AttendanceSource;
  ip?: string | null;
  createdAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  departmentName?: string;
  workDate: string; // YYYY-MM-DD
  firstInAt: string | null;
  lastOutAt: string | null;
  workedMinutes: number;
  lateMinutes: number;
  status: AttendanceStatus;
  note?: string | null;
  records?: AttendanceRecord[];
}

export interface AttendanceTodaySummary {
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  totalEmployees: number;
}

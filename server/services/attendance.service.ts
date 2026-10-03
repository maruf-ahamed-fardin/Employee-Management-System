import { attendanceRepository } from '@/server/repositories/attendance.repository';
import type { AttendanceCorrectionInput, PunchInput } from '@/lib/validations/attendance';
import { getTodayDateString } from '@/lib/utils/date';

export const attendanceService = {
  async getTodayAttendance(employeeId: string) {
    const today = getTodayDateString();
    return attendanceRepository.findByEmployeeAndDate(employeeId, today);
  },

  async getAttendanceList(params?: {
    workDate?: string;
    departmentId?: string;
    status?: string;
    employeeId?: string;
    page?: number;
    limit?: number;
  }) {
    return attendanceRepository.findAll(params);
  },

  async punch(employeeId: string, input: PunchInput, ip?: string | null) {
    const today = getTodayDateString();
    const now = new Date().toISOString();

    return attendanceRepository.recordPunch({
      employeeId,
      workDate: today,
      type: input.type,
      occurredAt: now,
      source: input.source,
      ip,
    });
  },

  async resumeShift(employeeId: string) {
    const today = getTodayDateString();
    return attendanceRepository.resumeShift(employeeId, today);
  },

  async correct(input: AttendanceCorrectionInput) {
    return attendanceRepository.updateCorrection(input.attendanceId, {
      firstInAt: input.firstInAt,
      lastOutAt: input.lastOutAt,
      status: input.status,
      note: input.note,
    });
  },
};

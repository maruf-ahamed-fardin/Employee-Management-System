import { attendanceRepository } from '@/server/repositories/attendance.repository';
import type { AttendanceCorrectionInput, PunchInput } from '@/lib/validations/attendance';
import { getTodayDateString } from '@/lib/utils/date';
import { prisma } from '@/lib/db';
import { getAttendanceSettings, localClock, minutesLate } from '@/lib/settings';

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
    const now = new Date();

    // Lateness follows the attendance policy in Settings (shift start, grace period, working days, holidays)
    let lateMinutes = 0;
    if (input.type === 'CHECK_IN') {
      const settings = await getAttendanceSettings();
      const holiday = await prisma.holiday.findUnique({ where: { date: localClock(now, settings.timezone).date }, select: { id: true } });
      lateMinutes = minutesLate(now, settings, () => !!holiday);
    }

    return attendanceRepository.recordPunch({
      employeeId,
      workDate: today,
      type: input.type,
      occurredAt: now.toISOString(),
      source: input.source,
      ip,
      lateMinutes,
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

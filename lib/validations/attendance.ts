import { z } from 'zod';

export const punchSchema = z.object({
  type: z.enum(['CHECK_IN', 'CHECK_OUT']),
  source: z.enum(['WEB', 'MOBILE', 'BIOMETRIC', 'RFID', 'ADMIN']).default('WEB'),
  employeeId: z.string().optional(),
  note: z.string().optional(),
});

export const attendanceCorrectionSchema = z.object({
  attendanceId: z.string(),
  firstInAt: z.string().optional(),
  lastOutAt: z.string().optional(),
  status: z.enum(['PRESENT', 'LATE', 'ABSENT', 'ON_LEAVE', 'WEEKEND', 'HOLIDAY']),
  note: z.string().min(1, 'Reason for correction is required'),
});

export type PunchInput = z.infer<typeof punchSchema>;
export type AttendanceCorrectionInput = z.infer<typeof attendanceCorrectionSchema>;

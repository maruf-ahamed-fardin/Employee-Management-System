import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/audit';

const DEFAULT_SETTINGS = {
  workStartTime: '09:00',
  workEndTime: '17:00',
  gracePeriodMinutes: 15,
  autoCloseTime: '23:59',
  timezone: 'Asia/Dhaka',
  workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
};

export async function GET() {
  try {
    const record = await prisma.setting.findUnique({
      where: { key: 'attendance_settings' },
    });

    const settings = record ? JSON.parse(record.value) : DEFAULT_SETTINGS;
    return successResponse(settings);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch attendance settings', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();

    const currentRecord = await prisma.setting.findUnique({
      where: { key: 'attendance_settings' },
    });

    const previousValue = currentRecord ? JSON.parse(currentRecord.value) : DEFAULT_SETTINGS;
    const mergedValue = { ...previousValue, ...body };

    const updated = await prisma.setting.upsert({
      where: { key: 'attendance_settings' },
      create: {
        key: 'attendance_settings',
        value: JSON.stringify(mergedValue),
      },
      update: {
        value: JSON.stringify(mergedValue),
      },
    });

    await recordAuditLog({
      userId: session?.id,
      action: 'UPDATE',
      entityType: 'SETTING',
      entityId: 'attendance_settings',
      changes: {
        before: previousValue,
        after: mergedValue,
      },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    });

    return successResponse(mergedValue, 'Attendance settings saved');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to update settings', 400);
  }
}

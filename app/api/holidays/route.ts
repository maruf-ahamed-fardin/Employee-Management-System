import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { canManageSettings } from '@/lib/auth/settings';
import { recordAuditLog } from '@/lib/audit';
import { isCalendarDate as isDate } from '@/lib/utils/calendar-date';

function cleanName(value: unknown): string | null {
  const name = typeof value === 'string' ? value.trim() : '';
  return name && name.length <= 100 ? name : null;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const requested = searchParams.get('year') || '';
    const year = /^\d{4}$/.test(requested) ? requested : String(new Date().getFullYear());

    const holidays = await prisma.holiday.findMany({
      where: {
        date: { startsWith: year },
      },
      orderBy: { date: 'asc' },
    });

    return successResponse(holidays);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch holidays', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);
    if (!canManageSettings(session.role)) return errorResponse('You do not have permission to manage holidays', 403);

    const body = await req.json();
    const name = cleanName(body.name);
    if (!isDate(body.date)) return errorResponse('Enter a valid holiday date', 400);
    if (!name) return errorResponse('Holiday name is required (100 characters or fewer)', 400);

    const existing = await prisma.holiday.findUnique({
      where: { date: body.date },
    });

    if (existing) {
      return errorResponse(`${existing.name} is already recorded on ${body.date}`, 409);
    }

    const holiday = await prisma.holiday.create({
      data: {
        date: body.date,
        name,
      },
    });

    await recordAuditLog({
      userId: session.id,
      action: 'CREATE',
      entityType: 'HOLIDAY',
      entityId: holiday.id,
      changes: { after: holiday },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    });

    return successResponse(holiday, 'Public holiday added successfully', undefined, 201);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to add holiday', 400);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);
    if (!canManageSettings(session.role)) return errorResponse('You do not have permission to manage holidays', 403);

    const body = await req.json();
    if (!body.id) return errorResponse('Holiday ID required', 400);

    const existing = await prisma.holiday.findUnique({ where: { id: body.id } });
    if (!existing) return errorResponse('Holiday not found', 404);

    const name = cleanName(body.name);
    if (!isDate(body.date)) return errorResponse('Enter a valid holiday date', 400);
    if (!name) return errorResponse('Holiday name is required (100 characters or fewer)', 400);

    if (body.date !== existing.date) {
      const clash = await prisma.holiday.findUnique({ where: { date: body.date } });
      if (clash) return errorResponse(`${clash.name} is already recorded on ${body.date}`, 409);
    }

    const holiday = await prisma.holiday.update({ where: { id: existing.id }, data: { date: body.date, name } });

    await recordAuditLog({
      userId: session.id,
      action: 'UPDATE',
      entityType: 'HOLIDAY',
      entityId: holiday.id,
      before: existing,
      after: holiday,
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    });

    return successResponse(holiday, 'Holiday updated');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to update holiday', 400);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);
    if (!canManageSettings(session.role)) return errorResponse('You do not have permission to manage holidays', 403);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return errorResponse('Holiday ID required', 400);

    const existing = await prisma.holiday.findUnique({ where: { id } });
    if (!existing) return errorResponse('Holiday not found', 404);

    await prisma.holiday.delete({ where: { id } });

    await recordAuditLog({
      userId: session.id,
      action: 'DELETE',
      entityType: 'HOLIDAY',
      entityId: id,
      changes: { before: existing },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    });

    return successResponse({ id }, 'Holiday deleted');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to delete holiday', 400);
  }
}

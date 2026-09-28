import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || String(new Date().getFullYear());

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
    const body = await req.json();
    const { date, name } = body;

    if (!date || !name) {
      return errorResponse('Date (YYYY-MM-DD) and Name are required', 400);
    }

    const existing = await prisma.holiday.findUnique({
      where: { date },
    });

    if (existing) {
      return errorResponse(`A holiday is already recorded for date ${date} (${existing.name})`, 400);
    }

    const holiday = await prisma.holiday.create({
      data: {
        date,
        name: name.trim(),
      },
    });

    await recordAuditLog({
      userId: session?.id,
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

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return errorResponse('Holiday ID required', 400);

    const existing = await prisma.holiday.findUnique({ where: { id } });
    if (!existing) return errorResponse('Holiday not found', 404);

    await prisma.holiday.delete({ where: { id } });

    await recordAuditLog({
      userId: session?.id,
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

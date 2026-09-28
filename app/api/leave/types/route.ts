import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const types = await prisma.leaveType.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { requests: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const data = types.map((t) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      defaultDays: t.defaultDays,
      defaultDaysPerYear: t.defaultDaysPerYear,
      isPaid: t.isPaid,
      requiresDocument: t.requiresDocument,
      carryForwardMax: t.carryForwardMax,
      isActive: t.isActive,
      requestCount: t._count.requests,
    }));

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching leave types:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch leave types' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { name, code, defaultDaysPerYear, isPaid, requiresDocument, carryForwardMax } = body;

    const leaveType = await prisma.leaveType.create({
      data: {
        name,
        code: code.toUpperCase(),
        defaultDays: parseFloat(defaultDaysPerYear) || 14,
        defaultDaysPerYear: parseFloat(defaultDaysPerYear) || 14,
        isPaid: isPaid ?? true,
        requiresDocument: requiresDocument ?? false,
        carryForwardMax: parseFloat(carryForwardMax) || 0,
        isActive: true,
      },
    });

    await createAuditLog({
      actorUserId: session?.id,
      action: 'leave_type.create',
      entityType: 'leave_type',
      entityId: leaveType.id,
      after: { name, code },
    });

    return NextResponse.json({ data: leaveType }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating leave type:', error);
    return NextResponse.json({ error: error.message || 'Failed to create leave type' }, { status: 500 });
  }
}

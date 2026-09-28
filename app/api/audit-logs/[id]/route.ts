import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        actor: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!log) {
      return NextResponse.json({ error: 'Audit log entry not found' }, { status: 404 });
    }

    let beforeObj = null;
    let afterObj = null;
    try {
      if (log.before) beforeObj = JSON.parse(log.before);
    } catch {}
    try {
      if (log.after) afterObj = JSON.parse(log.after);
    } catch {}

    const actorName = log.actor?.employee
      ? `${log.actor.employee.firstName} ${log.actor.employee.lastName}`
      : log.actor?.email || 'System';

    return NextResponse.json({
      data: {
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        actor: {
          id: log.actorUserId,
          name: actorName,
          email: log.actor?.email,
        },
        before: beforeObj,
        after: afterObj,
        ip: log.ip,
        userAgent: log.userAgent,
        createdAt: log.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching audit log detail:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch audit log' }, { status: 500 });
  }
}

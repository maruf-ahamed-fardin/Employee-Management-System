import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const actorUserId = searchParams.get('actorUserId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) where.action = { contains: action };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (actorUserId) where.actorUserId = actorUserId;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            include: {
              employee: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const data = logs.map((log) => {
      let beforeObj = null;
      let afterObj = null;
      try {
        if (log.before) beforeObj = JSON.parse(log.before);
      } catch {}
      try {
        if (log.after) afterObj = JSON.parse(log.after);
      } catch {}

      // Calculate changed fields
      const changedFields: string[] = [];
      if (beforeObj && afterObj) {
        const allKeys = Array.from(new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]));
        for (const k of allKeys) {
          if (JSON.stringify(beforeObj[k]) !== JSON.stringify(afterObj[k])) {
            changedFields.push(k);
          }
        }
      }

      const actorName = log.actor?.employee
        ? `${log.actor.employee.firstName} ${log.actor.employee.lastName}`
        : log.actor?.email || 'System';

      return {
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        actor: {
          id: log.actorUserId,
          name: actorName,
          email: log.actor?.email,
        },
        changedFields,
        before: beforeObj,
        after: afterObj,
        ip: log.ip,
        userAgent: log.userAgent,
        createdAt: log.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch audit logs' }, { status: 500 });
  }
}

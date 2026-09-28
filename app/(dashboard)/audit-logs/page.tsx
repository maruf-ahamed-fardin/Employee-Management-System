import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { AuditLogsViewer } from '@/components/audit/AuditLogsViewer';

export const metadata: Metadata = {
  title: 'Audit Logs - SeloraX EMS',
  description: 'Complete audit trail of system changes, security events, and administrative activities.',
};

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    include: {
      actor: {
        include: {
          employee: true,
        },
      },
    },
    take: 50,
    orderBy: { createdAt: 'desc' },
  });

  const formatted = logs.map((log) => {
    let beforeObj = null;
    let afterObj = null;
    try {
      if (log.before) beforeObj = JSON.parse(log.before);
    } catch {}
    try {
      if (log.after) afterObj = JSON.parse(log.after);
    } catch {}

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Audit Trail & Security Logs
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every change, who made it and when. Entries are append-only and cannot be altered or deleted.
        </p>
      </div>

      <AuditLogsViewer initialLogs={formatted} />
    </div>
  );
}

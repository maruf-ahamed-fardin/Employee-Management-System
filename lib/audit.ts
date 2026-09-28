import { prisma } from './prisma';

export interface AuditLogInput {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before ? JSON.stringify(input.before) : null,
        after: input.after ? JSON.stringify(input.after) : null,
        ip: input.ip,
        userAgent: input.userAgent,
        requestId: input.requestId,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return null;
  }
}

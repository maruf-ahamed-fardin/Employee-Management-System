import { prisma } from './prisma';

export interface AuditLogInput {
  actorUserId?: string | null;
  userId?: string | null; // Alias for actorUserId
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  changes?: Record<string, any> | null; // Alias for after
  ip?: string | null;
  ipAddress?: string | null; // Alias for ip
  userAgent?: string | null;
  requestId?: string | null;
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId ?? input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        before: input.before ? JSON.stringify(input.before) : null,
        after: (input.after ?? input.changes) ? JSON.stringify(input.after ?? input.changes) : null,
        ip: input.ip ?? input.ipAddress,
        userAgent: input.userAgent,
        requestId: input.requestId,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return null;
  }
}

/** Alias for createAuditLog for compatibility */
export const recordAuditLog = createAuditLog;

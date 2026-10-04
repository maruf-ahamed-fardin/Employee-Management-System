import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';
import { canManagePositions } from '@/lib/auth/positions';

const positionInclude = {
  department: true,
  _count: { select: { employees: true } },
} as const;

/** Case-insensitive title clash within the same department (SQLite has no insensitive mode). */
async function findDuplicate(title: string, departmentId: string | null, excludeId?: string) {
  const siblings = await prisma.position.findMany({
    where: { departmentId, deletedAt: null, id: excludeId ? { not: excludeId } : undefined },
    select: { id: true, title: true, isActive: true },
  });
  const wanted = title.trim().toLowerCase();
  return siblings.find((p) => p.title.trim().toLowerCase() === wanted) || null;
}

const duplicateMessage = (title: string, archived: boolean) =>
  archived
    ? `"${title}" already exists in this department as an archived position. Restore it instead.`
    : `"${title}" already exists in this department`;

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');

    const where: any = { isActive: true };
    if (departmentId) where.departmentId = departmentId;

    const positions = await prisma.position.findMany({
      where,
      include: positionInclude,
      orderBy: { title: 'asc' },
    });
    return successResponse(positions);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch positions', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);
    if (!canManagePositions(session.role)) return errorResponse('You do not have permission to manage positions', 403);

    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const departmentId = body.departmentId || null;
    if (!title) return errorResponse('Position title is required', 400);

    const duplicate = await findDuplicate(title, departmentId);
    if (duplicate) return errorResponse(duplicateMessage(duplicate.title, !duplicate.isActive), 409);

    const position = await prisma.position.create({
      data: {
        title,
        departmentId,
        level: body.level || 'Junior',
        baseSalary: Number(body.baseSalary) || 45000,
      },
      include: positionInclude,
    });

    await createAuditLog({
      actorUserId: session.id,
      action: 'position.create',
      entityType: 'position',
      entityId: position.id,
      after: { title, departmentId, level: position.level, baseSalary: position.baseSalary },
    });

    return successResponse(position, 'Position created', undefined, 201);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to create position', 400);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);
    if (!canManagePositions(session.role)) return errorResponse('You do not have permission to manage positions', 403);

    const { id, title, departmentId, level, baseSalary, isActive } = await req.json();
    if (!id) return errorResponse('Position ID required', 400);

    const existing = await prisma.position.findUnique({ where: { id } });
    if (!existing) return errorResponse('Position not found', 404);

    const nextTitle = typeof title === 'string' && title.trim() ? title.trim() : existing.title;
    const nextDepartmentId = departmentId !== undefined ? departmentId || null : existing.departmentId;

    // Re-check on rename, department move, or restore (a twin may have been created while archived)
    const restoring = isActive === true && !existing.isActive;
    if (nextTitle !== existing.title || nextDepartmentId !== existing.departmentId || restoring) {
      const duplicate = await findDuplicate(nextTitle, nextDepartmentId, id);
      if (duplicate) return errorResponse(duplicateMessage(duplicate.title, !duplicate.isActive), 409);
    }

    const updated = await prisma.position.update({
      where: { id },
      data: {
        title: nextTitle,
        departmentId: nextDepartmentId,
        level: level || undefined,
        baseSalary: baseSalary !== undefined ? Number(baseSalary) : undefined,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
      },
      include: positionInclude,
    });

    const pick = (p: typeof existing) => ({
      title: p.title,
      departmentId: p.departmentId,
      level: p.level,
      baseSalary: p.baseSalary,
      isActive: p.isActive,
    });
    await createAuditLog({
      actorUserId: session.id,
      action: typeof isActive === 'boolean' && isActive !== existing.isActive ? (isActive ? 'position.restore' : 'position.archive') : 'position.update',
      entityType: 'position',
      entityId: id,
      before: pick(existing),
      after: pick(updated),
    });

    return successResponse(updated, 'Position updated successfully');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to update position', 400);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);
    if (!canManagePositions(session.role)) return errorResponse('You do not have permission to manage positions', 403);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('Position ID required', 400);

    const existing = await prisma.position.findUnique({ where: { id } });
    if (!existing) return errorResponse('Position not found', 404);

    // Check if any employees are linked to this position
    const empCount = await prisma.employee.count({ where: { positionId: id } });
    if (empCount > 0) {
      return errorResponse(`Cannot delete position: ${empCount} employee(s) are assigned to it. Archive it instead.`, 400);
    }

    await prisma.position.delete({ where: { id } });

    await createAuditLog({
      actorUserId: session.id,
      action: 'position.delete',
      entityType: 'position',
      entityId: id,
      before: { title: existing.title, departmentId: existing.departmentId },
    });

    return successResponse({ id }, 'Position deleted successfully');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to delete position', 400);
  }
}

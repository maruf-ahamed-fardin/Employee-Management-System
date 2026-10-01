import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const session = await getSession();
    const body = await req.json();

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existing) {
      return errorResponse('Task not found', 404);
    }

    const data: any = {};
    if (body.status !== undefined) data.status = body.status.toUpperCase();
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.description !== undefined) data.description = body.description;
    if (body.priority !== undefined) data.priority = body.priority.toUpperCase();
    if (body.category !== undefined) data.category = body.category;
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data,
    });

    await createAuditLog({
      actorUserId: session?.id,
      action: 'task.update',
      entityType: 'task',
      entityId: updated.id,
      before: { status: existing.status },
      after: { status: updated.status },
    });

    return successResponse(updated, 'Task updated successfully');
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to update task', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const session = await getSession();

    const existing = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existing) {
      return errorResponse('Task not found', 404);
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    await createAuditLog({
      actorUserId: session?.id,
      action: 'task.delete',
      entityType: 'task',
      entityId: taskId,
      before: { title: existing.title },
    });

    return successResponse({ id: taskId }, 'Task deleted successfully');
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to delete task', 500);
  }
}

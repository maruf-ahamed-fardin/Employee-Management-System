import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            department: { select: { name: true } },
            position: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(tasks);
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to fetch tasks', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();

    const { employeeId, title, description, priority = 'MEDIUM', status = 'TODO', dueDate, category = 'General' } = body;

    if (!employeeId || !title?.trim()) {
      return errorResponse('Employee and task title are required', 400);
    }

    const task = await prisma.task.create({
      data: {
        employeeId,
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority.toUpperCase(),
        status: status.toUpperCase(),
        category: category.trim() || 'General',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            department: { select: { name: true } },
            position: { select: { title: true } },
          },
        },
      },
    });

    await createAuditLog({
      actorUserId: session?.id,
      action: 'task.create',
      entityType: 'task',
      entityId: task.id,
      after: { title: task.title, employeeId: task.employeeId, priority: task.priority },
    });

    return successResponse(task, 'Task successfully assigned to employee');
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to assign task', 500);
  }
}

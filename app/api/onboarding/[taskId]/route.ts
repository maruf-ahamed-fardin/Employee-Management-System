import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await req.json();

    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM OnboardingTask WHERE id = ?`,
      taskId
    );

    if (existing.length === 0) {
      return errorResponse('Onboarding task not found', 404);
    }

    const { status } = body;
    const cleanStatus = status?.toUpperCase() || (existing[0].status === 'COMPLETED' ? 'PENDING' : 'COMPLETED');
    const completedAtClause = cleanStatus === 'COMPLETED' ? "datetime('now')" : "NULL";

    await prisma.$executeRawUnsafe(
      `UPDATE OnboardingTask 
       SET status = ?, completedAt = ${completedAtClause}, updatedAt = datetime('now')
       WHERE id = ?`,
      cleanStatus,
      taskId
    );

    return successResponse({ id: taskId, status: cleanStatus }, `Task marked as ${cleanStatus.toLowerCase()}`);
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
    await prisma.$executeRawUnsafe(`DELETE FROM OnboardingTask WHERE id = ?`, taskId);
    return successResponse({ id: taskId }, 'Task removed from checklist');
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to delete task', 500);
  }
}

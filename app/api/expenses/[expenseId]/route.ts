import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  try {
    const { expenseId } = await params;
    const session = await getSession();
    const body = await req.json();

    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM ExpenseClaim WHERE id = ?`,
      expenseId
    );

    if (existing.length === 0) {
      return errorResponse('Expense claim not found', 404);
    }

    const { status, reviewNote } = body;
    const cleanStatus = status?.toUpperCase();

    if (cleanStatus === 'PAID') {
      await prisma.$executeRawUnsafe(
        `UPDATE ExpenseClaim 
         SET status = 'PAID', paidAt = datetime('now'), updatedAt = datetime('now')
         WHERE id = ?`,
        expenseId
      );
    } else if (cleanStatus === 'APPROVED' || cleanStatus === 'REJECTED') {
      await prisma.$executeRawUnsafe(
        `UPDATE ExpenseClaim 
         SET status = ?, reviewNote = ?, reviewedAt = datetime('now'), reviewedById = ?, updatedAt = datetime('now')
         WHERE id = ?`,
        cleanStatus,
        reviewNote || null,
        session?.id || 'admin',
        expenseId
      );
    } else {
      return errorResponse('Invalid status transition', 400);
    }

    return successResponse({ id: expenseId, status: cleanStatus }, `Claim marked as ${cleanStatus.toLowerCase()}`);
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to update expense claim', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ expenseId: string }> }
) {
  try {
    const { expenseId } = await params;

    await prisma.$executeRawUnsafe(`DELETE FROM ExpenseClaim WHERE id = ?`, expenseId);

    return successResponse({ id: expenseId }, 'Expense claim deleted successfully');
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to delete expense claim', 500);
  }
}

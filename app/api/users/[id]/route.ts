import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.user.findUnique({
      where: { id },
      include: { roleRef: true },
    });

    if (!existing) {
      return errorResponse('User not found', 404);
    }

    const updateData: any = {};

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (body.roleId !== undefined) {
      updateData.roleId = body.roleId;
      const r = await prisma.role.findUnique({ where: { id: body.roleId } });
      if (r) updateData.role = r.name;
    }

    if (body.newPassword) {
      updateData.passwordHash = await bcrypt.hash(body.newPassword, 10);
      updateData.passwordChangedAt = new Date();
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        employee: true,
        roleRef: true,
      },
    });

    await recordAuditLog({
      userId: session?.id,
      action: 'UPDATE',
      entityType: 'USER',
      entityId: id,
      changes: {
        before: { status: existing.status, role: existing.role, roleId: existing.roleId },
        after: { status: updated.status, role: updated.role, roleId: updated.roleId },
      },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    });

    return successResponse(
      {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        status: updated.status,
      },
      'User updated successfully'
    );
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to update user', 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return errorResponse('User not found', 404);

    // Prevent deleting own account
    if (session?.id === id) {
      return errorResponse('You cannot delete your own active account', 400);
    }

    await prisma.user.delete({ where: { id } });

    await recordAuditLog({
      userId: session?.id,
      action: 'DELETE',
      entityType: 'USER',
      entityId: id,
      changes: { before: existing },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    });

    return successResponse({ id }, 'User deleted successfully');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to delete user', 400);
  }
}

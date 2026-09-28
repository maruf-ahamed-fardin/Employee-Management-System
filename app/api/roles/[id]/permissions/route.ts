import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { permissions } = body; // Record<PermissionKey, PermissionScope>

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (role.key === 'super_admin') {
      return NextResponse.json(
        { error: 'Super Admin permissions cannot be modified.' },
        { status: 400 }
      );
    }

    // Capture before state
    const beforeMap: Record<string, string> = {};
    for (const rp of role.permissions) {
      beforeMap[rp.permission.key] = rp.scope;
    }

    const allPerms = await prisma.permission.findMany();
    const permKeyToId = new Map(allPerms.map((p) => [p.key, p.id]));

    // Transaction to update role permissions
    await prisma.$transaction(async (tx) => {
      // Remove existing permissions
      await tx.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Insert new permissions
      if (permissions && typeof permissions === 'object') {
        const createData = [];
        for (const [key, scope] of Object.entries(permissions)) {
          const permId = permKeyToId.get(key);
          if (permId && scope && scope !== 'NONE') {
            createData.push({
              roleId: id,
              permissionId: permId,
              scope: String(scope),
            });
          }
        }

        if (createData.length > 0) {
          await tx.rolePermission.createMany({
            data: createData,
          });
        }
      }
    });

    // Log the change into AuditLog
    await createAuditLog({
      action: 'role.permissions_update',
      entityType: 'role',
      entityId: role.key,
      before: beforeMap,
      after: permissions,
    });

    return NextResponse.json({ message: 'Permissions updated successfully' });
  } catch (error: any) {
    console.error('Error updating role permissions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update role permissions' },
      { status: 500 }
    );
  }
}

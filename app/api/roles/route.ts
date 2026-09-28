import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const data = roles.map((role) => {
      const permMap: Record<string, string> = {};
      for (const rp of role.permissions) {
        permMap[rp.permission.key] = rp.scope;
      }

      return {
        id: role.id,
        key: role.key,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        userCount: role._count.users,
        permissions: permMap,
        editable: role.key !== 'super_admin',
      };
    });

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch roles' }, { status: 500 });
  }
}

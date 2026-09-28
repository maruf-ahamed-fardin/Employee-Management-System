import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/audit';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';
    const roleId = searchParams.get('roleId') || '';

    const where: any = {};
    if (status) where.status = status;
    if (roleId) where.roleId = roleId;

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { employee: { firstName: { contains: search } } },
        { employee: { lastName: { contains: search } } },
        { employee: { employeeCode: { contains: search } } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: { select: { id: true, name: true } },
          },
        },
        roleRef: {
          select: { id: true, name: true, description: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(users);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch users', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { employeeId, email, password, roleId } = body;

    if (!email || !password) {
      return errorResponse('Email and Password are required', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return errorResponse('A user account with this email already exists', 400);
    }

    if (employeeId) {
      const empAccount = await prisma.user.findUnique({
        where: { employeeId },
      });
      if (empAccount) {
        return errorResponse('This employee already has an active user account', 400);
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Resolve role name
    let roleName = 'EMPLOYEE';
    if (roleId) {
      const r = await prisma.role.findUnique({ where: { id: roleId } });
      if (r) roleName = r.name;
    }

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: roleName,
        roleId: roleId || null,
        employeeId: employeeId || null,
        status: 'ACTIVE',
      },
      include: {
        employee: true,
        roleRef: true,
      },
    });

    await recordAuditLog({
      userId: session?.id,
      action: 'CREATE',
      entityType: 'USER',
      entityId: newUser.id,
      changes: {
        after: { id: newUser.id, email: newUser.email, role: newUser.role, employeeId: newUser.employeeId },
      },
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    });

    return successResponse(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        employee: newUser.employee,
      },
      'User account created successfully',
      undefined,
      201
    );
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to create user', 400);
  }
}

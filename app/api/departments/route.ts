import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return successResponse(departments);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch departments', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, code, description } = await req.json();
    if (!name || !code) return errorResponse('Name and Code are required', 400);

    const department = await prisma.department.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
      },
    });
    return successResponse(department, 'Department created', undefined, 201);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to create department', 400);
  }
}

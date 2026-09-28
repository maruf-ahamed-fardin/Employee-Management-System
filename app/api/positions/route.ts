import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');

    const where: any = { isActive: true };
    if (departmentId) where.departmentId = departmentId;

    const positions = await prisma.position.findMany({
      where,
      include: {
        department: true,
        _count: { select: { employees: true } },
      },
      orderBy: { title: 'asc' },
    });
    return successResponse(positions);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch positions', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, departmentId, level, baseSalary } = await req.json();
    if (!title) return errorResponse('Position title is required', 400);

    const position = await prisma.position.create({
      data: {
        title,
        departmentId: departmentId || null,
        level: level || 'Junior',
        baseSalary: Number(baseSalary) || 45000,
      },
    });
    return successResponse(position, 'Position created', undefined, 201);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to create position', 400);
  }
}

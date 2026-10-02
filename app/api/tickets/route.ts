import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const employeeId = searchParams.get('employeeId');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (category && category !== 'ALL') where.category = category;
    if (employeeId) where.employeeId = employeeId;

    const tickets = await prisma.helpdeskTicket.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            photoUrl: true,
            department: { select: { name: true } },
            position: { select: { title: true } },
          },
        },
        assignedTo: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(tickets);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch tickets', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, category, priority = 'MEDIUM', description, employeeId } = body;

    if (!title || !description || !employeeId) {
      return errorResponse('Title, description, and employee are required', 400);
    }

    const count = await prisma.helpdeskTicket.count();
    const ticketNumber = `TKT-${1000 + count + 1}`;

    const ticket = await prisma.helpdeskTicket.create({
      data: {
        ticketNumber,
        title,
        category: category || 'WORKPLACE_GENERAL',
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        description,
        employeeId,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    return successResponse(ticket, 'Ticket submitted successfully', undefined, 201);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to create ticket', 400);
  }
}

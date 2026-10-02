import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, resolution, assignedToId } = body;

    const data: any = {};
    if (status) {
      data.status = status;
      if (status === 'RESOLVED' || status === 'CLOSED') {
        data.resolvedAt = new Date();
      }
    }
    if (resolution !== undefined) {
      data.resolution = resolution;
    }
    if (assignedToId !== undefined) {
      data.assignedToId = assignedToId;
    }

    const updated = await prisma.helpdeskTicket.update({
      where: { id },
      data,
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return successResponse(updated, 'Ticket updated successfully');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to update ticket', 400);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.helpdeskTicket.delete({ where: { id } });
    return successResponse(null, 'Ticket deleted successfully');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to delete ticket', 400);
  }
}

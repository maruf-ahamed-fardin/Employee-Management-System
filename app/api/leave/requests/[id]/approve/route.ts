import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const body = await request.json().catch(() => ({}));
    const { reviewNote } = body;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true, leaveType: true },
    });

    if (!leave) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedById: session?.id || null,
        reviewedAt: new Date(),
        reviewNote: reviewNote || 'Approved',
      },
    });

    // Create notification for employee if user exists
    const user = await prisma.user.findFirst({
      where: { employeeId: leave.employeeId },
    });
    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Leave Request Approved',
          body: `Your request for ${leave.days} day(s) of ${leave.leaveType.name} (${leave.startDate} to ${leave.endDate}) has been approved.`,
          type: 'SUCCESS',
          link: '/leave',
          entityType: 'leave',
          entityId: leave.id,
        },
      });
    }

    // Audit log
    await createAuditLog({
      actorUserId: session?.id,
      action: 'leave.approve',
      entityType: 'leave',
      entityId: id,
      before: { status: leave.status },
      after: { status: 'APPROVED', reviewNote },
    });

    return NextResponse.json({ data: updated, message: 'Leave request approved successfully' });
  } catch (error: any) {
    console.error('Error approving leave:', error);
    return NextResponse.json({ error: error.message || 'Failed to approve leave' }, { status: 500 });
  }
}

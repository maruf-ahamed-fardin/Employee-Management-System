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
        status: 'REJECTED',
        reviewedById: session?.id || null,
        reviewedAt: new Date(),
        reviewNote: reviewNote || 'Rejected',
      },
    });

    // Notify employee
    const user = await prisma.user.findFirst({
      where: { employeeId: leave.employeeId },
    });
    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Leave Request Rejected',
          body: `Your request for ${leave.leaveType.name} (${leave.startDate} to ${leave.endDate}) was rejected. Note: ${reviewNote || 'No reason provided'}`,
          type: 'ALERT',
          link: '/leave',
          entityType: 'leave',
          entityId: leave.id,
        },
      });
    }

    // Audit log
    await createAuditLog({
      actorUserId: session?.id,
      action: 'leave.reject',
      entityType: 'leave',
      entityId: id,
      before: { status: leave.status },
      after: { status: 'REJECTED', reviewNote },
    });

    return NextResponse.json({ data: updated, message: 'Leave request rejected' });
  } catch (error: any) {
    console.error('Error rejecting leave:', error);
    return NextResponse.json({ error: error.message || 'Failed to reject leave' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Scoped to the owner, so someone else's notification looks the same as a missing one
    const notification = await prisma.notification.findFirst({ where: { id, userId: session.id } });
    if (!notification) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });

    const updated = notification.isRead
      ? notification
      : await prisma.notification.update({
          where: { id },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    console.error('Error marking notification read:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}

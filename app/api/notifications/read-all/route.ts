import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function PATCH() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await prisma.notification.updateMany({
      where: { userId: session.id, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'All notifications marked as read', count: result.count });
  } catch (error: any) {
    console.error('Error marking all notifications read:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

export async function POST() {
  return PATCH();
}

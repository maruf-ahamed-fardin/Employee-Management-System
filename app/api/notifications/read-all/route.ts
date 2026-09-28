import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Error marking all notifications read:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

export async function POST() {
  return PATCH();
}

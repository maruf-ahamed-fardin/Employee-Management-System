import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ count: 0 }, { status: 401 });

    const count = await prisma.notification.count({
      where: { userId: session.id, isRead: false },
    });

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ count: 0 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function POST() {
  try {
    const session = await getSession();
    const userId = session?.id;

    if (userId) {
      await prisma.session.deleteMany({
        where: {
          userId,
        },
      });
    }

    return NextResponse.json({
      message: 'All other active sessions have been signed out successfully.',
    });
  } catch (error: any) {
    console.error('Error logging out other sessions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to revoke other sessions' },
      { status: 500 }
    );
  }
}

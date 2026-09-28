import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { key: 'asc' }],
    });

    return NextResponse.json({ data: permissions });
  } catch (error: any) {
    console.error('Error fetching permissions catalogue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch permissions catalogue' },
      { status: 500 }
    );
  }
}

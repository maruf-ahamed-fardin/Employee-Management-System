import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const types = await prisma.documentType.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { documents: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const data = types.map((dt) => ({
      id: dt.id,
      name: dt.name,
      code: dt.code,
      isSensitive: dt.isSensitive,
      hasExpiry: dt.hasExpiry,
      documentCount: dt._count.documents,
    }));

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching document types:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch document types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { name, code, isSensitive, hasExpiry } = body;

    const dt = await prisma.documentType.create({
      data: {
        name,
        code: code.toLowerCase(),
        isSensitive: isSensitive ?? false,
        hasExpiry: hasExpiry ?? false,
      },
    });

    await createAuditLog({
      actorUserId: session?.id,
      action: 'document_type.create',
      entityType: 'document_type',
      entityId: dt.id,
      after: { name, code },
    });

    return NextResponse.json({ data: dt }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating document type:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create document type' },
      { status: 500 }
    );
  }
}

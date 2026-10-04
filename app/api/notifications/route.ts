import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

const ADMIN_ROLES = ['superadmin', 'super_admin', 'admin', 'hr_admin'];
const NOTIFICATION_TYPES = ['INFO', 'SUCCESS', 'WARNING', 'ALERT'];

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const skip = (page - 1) * limit;

    // Notifications are personal: only ever the signed-in user's own
    const where: any = { userId: session.id };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [total, items] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const data = items.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      type: n.type,
      isRead: n.isRead,
      link: n.link,
      entityType: n.entityType,
      entityId: n.entityId,
      readAt: n.readAt ? n.readAt.toISOString() : null,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ADMIN_ROLES.includes(session.role)) {
      return NextResponse.json({ error: 'You do not have permission to send notifications' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, title, body: content, type, link, entityType, entityId } = body;

    if (!userId || typeof title !== 'string' || !title.trim() || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'userId, title and body are required' }, { status: 400 });
    }
    // Links are followed inside the app, so only same-site paths are accepted
    if (link && !(typeof link === 'string' && link.startsWith('/') && !link.startsWith('//'))) {
      return NextResponse.json({ error: 'link must be an in-app path starting with /' }, { status: 400 });
    }
    const recipient = await prisma.user.findUnique({ where: { id: String(userId) }, select: { id: true } });
    if (!recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });

    const notification = await prisma.notification.create({
      data: {
        userId: recipient.id,
        title: title.trim(),
        body: content.trim(),
        type: NOTIFICATION_TYPES.includes(type) ? type : 'INFO',
        link: link || null,
        entityType,
        entityId,
      },
    });

    return NextResponse.json({ data: notification }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: error.message || 'Failed to create notification' }, { status: 500 });
  }
}

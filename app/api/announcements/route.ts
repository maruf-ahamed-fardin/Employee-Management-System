import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const announcements: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM Announcement
      ORDER BY isPinned DESC, createdAt DESC
      LIMIT 10
    `);

    const formatted = announcements.map((a) => ({
      ...a,
      isPinned: Boolean(a.isPinned),
    }));

    return successResponse(formatted);
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to fetch announcements', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();

    const { title, content, priority = 'NORMAL', isPinned = false, category = 'General' } = body;

    if (!title?.trim() || !content?.trim()) {
      return errorResponse('Title and content are required', 400);
    }

    const id = randomUUID();
    const authorName = session?.email ? session.email.split('@')[0] : 'HR Operations';

    await prisma.$executeRawUnsafe(
      `INSERT INTO Announcement (id, title, content, priority, isPinned, category, authorName, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      id,
      title.trim(),
      content.trim(),
      priority.toUpperCase(),
      isPinned ? 1 : 0,
      category.trim() || 'General',
      authorName
    );

    return successResponse({ id, title, priority, category }, 'Announcement published', undefined, 201);
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to publish announcement', 500);
  }
}

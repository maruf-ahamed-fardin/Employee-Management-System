import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const kudos = await prisma.$queryRawUnsafe<any[]>(
      `SELECT 
        k.*,
        emp.firstName as receiverFirstName,
        emp.lastName as receiverLastName,
        emp.employeeCode as receiverCode,
        emp.photoUrl as receiverPhotoUrl,
        dept.name as departmentName
       FROM Kudos k
       JOIN Employee emp ON k.receiverId = emp.id
       LEFT JOIN Department dept ON emp.departmentId = dept.id
       ORDER BY k.createdAt DESC
       LIMIT 10`
    );

    return successResponse(kudos || []);
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to fetch kudos', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();

    const { receiverId, badge = 'Team Player', message } = body;

    if (!receiverId || !message?.trim()) {
      return errorResponse('Receiver and message are required', 400);
    }

    const id = randomUUID();
    const senderName = session?.employeeName || session?.email?.split('@')[0] || 'A Colleague';
    const senderId = session?.id || 'colleague';

    await prisma.$executeRawUnsafe(
      `INSERT INTO Kudos (id, senderId, senderName, receiverId, badge, message, likesCount, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
      id,
      senderId,
      senderName,
      receiverId,
      badge,
      message.trim()
    );

    return successResponse({ id, badge, message }, 'Kudos sent successfully!', undefined, 201);
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to send kudos', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return errorResponse('Kudos ID required', 400);

    await prisma.$executeRawUnsafe(
      `UPDATE Kudos SET likesCount = likesCount + 1 WHERE id = ?`,
      id
    );

    return successResponse({ id }, 'Kudos liked!');
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to like kudos', 500);
  }
}

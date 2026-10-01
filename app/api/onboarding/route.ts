import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const employeeId = searchParams.get('employeeId');

    let query = `
      SELECT 
        t.*,
        emp.employeeCode,
        emp.firstName,
        emp.lastName,
        emp.photoUrl,
        emp.joiningDate,
        dept.name as departmentName,
        pos.title as positionTitle
      FROM OnboardingTask t
      JOIN Employee emp ON t.employeeId = emp.id
      LEFT JOIN Department dept ON emp.departmentId = dept.id
      LEFT JOIN Position pos ON emp.positionId = pos.id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (type && type !== 'ALL') {
      query += ` AND t.type = ?`;
      params.push(type.toUpperCase());
    }

    if (employeeId) {
      query += ` AND t.employeeId = ?`;
      params.push(employeeId);
    }

    query += ` ORDER BY t.createdAt DESC`;

    const tasks: any[] = await prisma.$queryRawUnsafe(query, ...params);

    // Group tasks by employee
    const employeeMap = new Map<string, any>();
    tasks.forEach((task) => {
      if (!employeeMap.has(task.employeeId)) {
        employeeMap.set(task.employeeId, {
          employeeId: task.employeeId,
          employeeCode: task.employeeCode,
          firstName: task.firstName,
          lastName: task.lastName,
          fullName: `${task.firstName} ${task.lastName}`,
          photoUrl: task.photoUrl,
          joiningDate: task.joiningDate,
          departmentName: task.departmentName,
          positionTitle: task.positionTitle,
          tasks: [],
          totalTasks: 0,
          completedTasks: 0,
          completionPercent: 0,
        });
      }

      const emp = employeeMap.get(task.employeeId);
      emp.tasks.push(task);
      emp.totalTasks += 1;
      if (task.status === 'COMPLETED') emp.completedTasks += 1;
      emp.completionPercent = Math.round((emp.completedTasks / emp.totalTasks) * 100);
    });

    const cases = Array.from(employeeMap.values());

    return successResponse({
      tasks,
      cases,
      metrics: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === 'COMPLETED').length,
        pendingTasks: tasks.filter((t) => t.status === 'PENDING').length,
        totalCases: cases.length,
      },
    });
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to fetch onboarding tasks', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      employeeId,
      title,
      type = 'ONBOARDING',
      category = 'HR',
      assignedTo = 'HR Operations',
      notes,
    } = body;

    if (!employeeId || !title?.trim()) {
      return errorResponse('Employee and task title are required', 400);
    }

    const id = randomUUID();

    await prisma.$executeRawUnsafe(
      `INSERT INTO OnboardingTask (id, employeeId, type, title, category, status, assignedTo, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?, datetime('now'), datetime('now'))`,
      id,
      employeeId,
      type.toUpperCase(),
      title.trim(),
      category.toUpperCase(),
      assignedTo.trim(),
      notes?.trim() || null
    );

    return successResponse({ id, title }, 'Task added to checklist', undefined, 201);
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to create onboarding task', 500);
  }
}

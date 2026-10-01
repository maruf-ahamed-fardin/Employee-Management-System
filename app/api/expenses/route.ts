import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');

    let query = `
      SELECT 
        e.*,
        emp.employeeCode,
        emp.firstName,
        emp.lastName,
        emp.email,
        dept.name as departmentName
      FROM ExpenseClaim e
      JOIN Employee emp ON e.employeeId = emp.id
      LEFT JOIN Department dept ON emp.departmentId = dept.id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (status && status !== 'ALL') {
      query += ` AND e.status = ?`;
      params.push(status.toUpperCase());
    }
    if (employeeId) {
      query += ` AND e.employeeId = ?`;
      params.push(employeeId);
    }

    query += ` ORDER BY e.createdAt DESC`;

    const items: any[] = await prisma.$queryRawUnsafe(query, ...params);

    // Compute summary metrics
    const allExpenses: any[] = await prisma.$queryRawUnsafe(`SELECT status, amount FROM ExpenseClaim`);
    const summary = allExpenses.reduce(
      (acc, curr) => {
        acc.total += curr.amount || 0;
        if (curr.status === 'PENDING') acc.pending += curr.amount || 0;
        if (curr.status === 'APPROVED') acc.approved += curr.amount || 0;
        if (curr.status === 'PAID') acc.paid += curr.amount || 0;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, paid: 0 }
    );

    return successResponse({ items, summary });
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to fetch expenses', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();

    const {
      employeeId,
      title,
      amount,
      category = 'OTHER',
      notes,
      receiptName,
    } = body;

    if (!employeeId || !title?.trim() || !amount || Number(amount) <= 0) {
      return errorResponse('Valid employee, title, and amount (> 0) are required', 400);
    }

    const id = randomUUID();
    const cleanAmount = Number(amount);

    await prisma.$executeRawUnsafe(
      `INSERT INTO ExpenseClaim (id, employeeId, category, title, amount, currency, notes, status, receiptName, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'BDT', ?, 'PENDING', ?, datetime('now'), datetime('now'))`,
      id,
      employeeId,
      category.toUpperCase(),
      title.trim(),
      cleanAmount,
      notes?.trim() || null,
      receiptName?.trim() || 'receipt-attachment.pdf'
    );

    return successResponse({ id, title, amount: cleanAmount }, 'Expense claim submitted successfully', undefined, 201);
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to submit expense claim', 500);
  }
}

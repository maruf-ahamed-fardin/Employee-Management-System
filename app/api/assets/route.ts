import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const employeeId = searchParams.get('employeeId');
    const search = searchParams.get('search');

    let query = `
      SELECT 
        a.*,
        emp.employeeCode,
        emp.firstName,
        emp.lastName,
        emp.email,
        dept.name as departmentName
      FROM Asset a
      LEFT JOIN Employee emp ON a.assignedToId = emp.id
      LEFT JOIN Department dept ON emp.departmentId = dept.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status && status !== 'ALL') {
      query += ` AND a.status = ?`;
      params.push(status.toUpperCase());
    }

    if (category && category !== 'ALL') {
      query += ` AND a.category = ?`;
      params.push(category.toUpperCase());
    }

    if (employeeId) {
      query += ` AND a.assignedToId = ?`;
      params.push(employeeId);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (
        a.name LIKE ? OR 
        a.assetTag LIKE ? OR 
        a.serialNumber LIKE ? OR 
        a.model LIKE ? OR 
        emp.firstName LIKE ? OR 
        emp.lastName LIKE ?
      )`;
      params.push(term, term, term, term, term, term);
    }

    query += ` ORDER BY a.createdAt DESC`;

    const items: any[] = await prisma.$queryRawUnsafe(query, ...params);

    // Compute summary metrics across all inventory
    const allAssets: any[] = await prisma.$queryRawUnsafe(
      `SELECT status, category, purchaseCost FROM Asset`
    );

    const summary = allAssets.reduce(
      (acc, curr) => {
        acc.total += 1;
        acc.valuation += curr.purchaseCost || 0;
        if (curr.status === 'ASSIGNED') acc.assigned += 1;
        if (curr.status === 'AVAILABLE') acc.available += 1;
        if (curr.status === 'MAINTENANCE') acc.maintenance += 1;
        if (curr.status === 'RETIRED') acc.retired += 1;
        return acc;
      },
      { total: 0, assigned: 0, available: 0, maintenance: 0, retired: 0, valuation: 0 }
    );

    return successResponse({ items, summary });
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to fetch assets', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      category = 'LAPTOP',
      assetTag,
      model,
      serialNumber,
      purchaseDate,
      purchaseCost = 0,
      condition = 'GOOD',
      status = 'AVAILABLE',
      assignedToId = null,
      location = 'HQ - Dhaka Office',
      notes,
    } = body;

    if (!name?.trim()) {
      return errorResponse('Asset name is required', 400);
    }

    const id = randomUUID();
    const cleanTag = assetTag?.trim() || `AST-${category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Verify tag uniqueness
    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM Asset WHERE assetTag = ?`,
      cleanTag
    );
    if (existing.length > 0) {
      return errorResponse(`Asset tag '${cleanTag}' is already registered`, 409);
    }

    const assignedStatus = assignedToId ? 'ASSIGNED' : (status?.toUpperCase() || 'AVAILABLE');
    const assignedAtClause = assignedToId ? "datetime('now')" : "NULL";

    await prisma.$executeRawUnsafe(
      `INSERT INTO Asset (
        id, assetTag, name, category, model, serialNumber, purchaseDate,
        purchaseCost, currency, condition, status, assignedToId, assignedAt,
        location, notes, createdAt, updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, 'BDT', ?, ?, ?, ${assignedAtClause},
        ?, ?, datetime('now'), datetime('now')
      )`,
      id,
      cleanTag,
      name.trim(),
      category.toUpperCase(),
      model?.trim() || null,
      serialNumber?.trim() || null,
      purchaseDate || null,
      Number(purchaseCost) || 0,
      condition.toUpperCase(),
      assignedStatus,
      assignedToId || null,
      location?.trim() || 'HQ - Dhaka Office',
      notes?.trim() || null
    );

    return successResponse(
      { id, assetTag: cleanTag, name: name.trim() },
      'Asset registered successfully',
      undefined,
      201
    );
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to register asset', 500);
  }
}

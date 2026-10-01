import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;

    const items: any[] = await prisma.$queryRawUnsafe(
      `SELECT 
        a.*,
        emp.employeeCode,
        emp.firstName,
        emp.lastName,
        emp.email,
        dept.name as departmentName
       FROM Asset a
       LEFT JOIN Employee emp ON a.assignedToId = emp.id
       LEFT JOIN Department dept ON emp.departmentId = dept.id
       WHERE a.id = ?`,
      assetId
    );

    if (items.length === 0) {
      return errorResponse('Asset not found', 404);
    }

    return successResponse(items[0]);
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to fetch asset', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    const body = await req.json();

    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM Asset WHERE id = ?`,
      assetId
    );

    if (existing.length === 0) {
      return errorResponse('Asset not found', 404);
    }

    const { action } = body;

    // Handle Quick Action: Return / Check-In asset back to storage
    if (action === 'RETURN') {
      await prisma.$executeRawUnsafe(
        `UPDATE Asset 
         SET assignedToId = NULL, assignedAt = NULL, status = 'AVAILABLE', updatedAt = datetime('now')
         WHERE id = ?`,
        assetId
      );
      return successResponse({ id: assetId, status: 'AVAILABLE' }, 'Asset checked in / returned to stock');
    }

    // Handle Quick Action: Assign to Employee
    if (action === 'ASSIGN') {
      const { employeeId } = body;
      if (!employeeId) {
        return errorResponse('Employee ID is required to assign asset', 400);
      }
      await prisma.$executeRawUnsafe(
        `UPDATE Asset 
         SET assignedToId = ?, assignedAt = datetime('now'), status = 'ASSIGNED', updatedAt = datetime('now')
         WHERE id = ?`,
        employeeId,
        assetId
      );
      return successResponse({ id: assetId, status: 'ASSIGNED', assignedToId: employeeId }, 'Asset assigned to employee');
    }

    // Handle Quick Action: Set Maintenance
    if (action === 'MAINTENANCE') {
      await prisma.$executeRawUnsafe(
        `UPDATE Asset 
         SET status = 'MAINTENANCE', updatedAt = datetime('now')
         WHERE id = ?`,
        assetId
      );
      return successResponse({ id: assetId, status: 'MAINTENANCE' }, 'Asset marked under maintenance');
    }

    // Handle General Updates
    const {
      name,
      model,
      serialNumber,
      category,
      condition,
      status,
      assignedToId,
      location,
      purchaseCost,
      notes,
    } = body;

    const current = existing[0];
    const newName = name !== undefined ? name.trim() : current.name;
    const newModel = model !== undefined ? model.trim() : current.model;
    const newSerial = serialNumber !== undefined ? serialNumber.trim() : current.serialNumber;
    const newCategory = category !== undefined ? category.toUpperCase() : current.category;
    const newCondition = condition !== undefined ? condition.toUpperCase() : current.condition;
    const newLocation = location !== undefined ? location.trim() : current.location;
    const newCost = purchaseCost !== undefined ? Number(purchaseCost) : current.purchaseCost;
    const newNotes = notes !== undefined ? notes.trim() : current.notes;
    
    let newStatus = status !== undefined ? status.toUpperCase() : current.status;
    let newAssignedToId = assignedToId !== undefined ? assignedToId : current.assignedToId;

    if (newAssignedToId && !current.assignedToId) {
      newStatus = 'ASSIGNED';
    } else if (!newAssignedToId && newStatus === 'ASSIGNED') {
      newStatus = 'AVAILABLE';
    }

    await prisma.$executeRawUnsafe(
      `UPDATE Asset 
       SET name = ?, model = ?, serialNumber = ?, category = ?, condition = ?,
           status = ?, assignedToId = ?, location = ?, purchaseCost = ?, notes = ?,
           updatedAt = datetime('now')
       WHERE id = ?`,
      newName,
      newModel,
      newSerial,
      newCategory,
      newCondition,
      newStatus,
      newAssignedToId || null,
      newLocation,
      newCost,
      newNotes,
      assetId
    );

    return successResponse({ id: assetId, status: newStatus }, 'Asset updated successfully');
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to update asset', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;

    await prisma.$executeRawUnsafe(`DELETE FROM Asset WHERE id = ?`, assetId);

    return successResponse({ id: assetId }, 'Asset removed from inventory');
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to delete asset', 500);
  }
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return errorResponse('No employee records provided', 400);
    }

    // Fetch existing depts and positions for mapping or defaults
    const [departments, positions] = await Promise.all([
      prisma.department.findMany({ select: { id: true, name: true } }),
      prisma.position.findMany({ select: { id: true, title: true } }),
    ]);

    const defaultDeptId = departments[0]?.id;
    const defaultPosId = positions[0]?.id;

    if (!defaultDeptId || !defaultPosId) {
      return errorResponse('Please configure at least one department and position first', 400);
    }

    const deptMap = new Map(departments.map((d) => [d.name.toLowerCase(), d.id]));
    const posMap = new Map(positions.map((p) => [p.title.toLowerCase(), p.id]));

    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const firstName = row.firstName?.trim();
      const lastName = row.lastName?.trim();
      const email = row.email?.trim().toLowerCase();

      if (!firstName || !lastName || !email) {
        errors.push(`Row ${i + 1}: First name, last name, and email are required.`);
        continue;
      }

      // Check if email already exists
      const existing = await prisma.employee.findUnique({ where: { email } });
      if (existing) {
        errors.push(`Row ${i + 1}: Email ${email} already exists.`);
        continue;
      }

      const id = randomUUID();
      const employeeCode = row.employeeCode?.trim() || `SX-${Math.floor(100 + Math.random() * 900)}`;
      const phone = row.phone?.trim() || '+880 1700-000000';
      const dateOfBirth = row.dateOfBirth?.trim() || '1996-01-01';
      const joiningDate = row.joiningDate?.trim() || new Date().toISOString().split('T')[0];
      const salary = Number(row.salary) || 50000;
      const deptId = row.department ? deptMap.get(row.department.toLowerCase()) || defaultDeptId : defaultDeptId;
      const posId = row.position ? posMap.get(row.position.toLowerCase()) || defaultPosId : defaultPosId;

      await prisma.employee.create({
        data: {
          id,
          employeeCode,
          firstName,
          lastName,
          email,
          phone,
          dateOfBirth,
          address: JSON.stringify({ line1: 'Dhaka', city: 'Dhaka', country: 'Bangladesh' }),
          emergencyContact: JSON.stringify({ name: 'Emergency Contact', relationship: 'Family', phone }),
          joiningDate,
          salary,
          departmentId: deptId,
          positionId: posId,
          status: 'ACTIVE',
        },
      });

      importedCount++;
    }

    return successResponse(
      { importedCount, errors },
      `Successfully imported ${importedCount} employee(s).`
    );
  } catch (error: any) {
    return errorResponse(error?.message || 'Failed to bulk import employees', 500);
  }
}

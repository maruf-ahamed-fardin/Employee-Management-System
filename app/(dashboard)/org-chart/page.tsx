import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { OrgChartClient, OrgEmployee } from '@/components/organization/OrgChartClient';

export const metadata: Metadata = {
  title: 'Organization Chart | SeloraX EMS',
  description: 'Interactive visual corporate hierarchy and reporting structure.',
};

export const dynamic = 'force-dynamic';

export default async function OrgChartPage() {
  const employeesData = await prisma.employee.findMany({
    where: {
      deletedAt: null,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      email: true,
      photoUrl: true,
      departmentId: true,
      managerId: true,
      workLocation: true,
      department: {
        select: {
          name: true,
        },
      },
      position: {
        select: {
          title: true,
        },
      },
    },
    orderBy: [
      { managerId: 'asc' },
      { firstName: 'asc' },
    ],
  });

  const formattedEmployees: OrgEmployee[] = employeesData.map((emp) => ({
    id: emp.id,
    employeeCode: emp.employeeCode,
    firstName: emp.firstName,
    lastName: emp.lastName,
    email: emp.email,
    photoUrl: emp.photoUrl,
    departmentId: emp.departmentId,
    departmentName: emp.department?.name || 'General',
    positionTitle: emp.position?.title || 'Team Member',
    managerId: emp.managerId,
    workLocation: emp.workLocation,
  }));

  return <OrgChartClient employees={formattedEmployees} />;
}

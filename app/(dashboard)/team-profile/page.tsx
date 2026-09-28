import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { TeamProfileDirectory } from '@/components/employee/TeamProfileDirectory';

export const metadata: Metadata = {
  title: 'Team Profile - SeloraX EMS',
  description: 'Everyone at SeloraX. Search, filter by team or place, and open a digital card to get in touch.',
};

export default async function TeamProfilePage() {
  const [employees, departments] = await Promise.all([
    prisma.employee.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        department: true,
        position: true,
        manager: true,
        teamProfile: {
          include: {
            links: true,
          },
        },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    }),
    prisma.department.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const people = employees.map((emp) => {
    const tp = emp.teamProfile;
    return {
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      fullName: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      phone: tp?.showPersonalPhone !== false ? emp.phone : null,
      businessPhone: tp?.businessPhone || null,
      position: emp.position?.title || 'Team Member',
      department: emp.department?.name || 'General',
      departmentId: emp.departmentId,
      workLocation: emp.workLocation || 'Dhaka, Bangladesh',
      photoUrl: emp.photoUrl,
      headline: tp?.headline || emp.headline || null,
      bloodGroup: emp.bloodGroup,
      joiningDate: emp.joiningDate,
      managerName: emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : null,
      links: tp?.links.map((l) => ({ kind: l.kind, url: l.url })) || [],
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Team Profile Directory
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone at SeloraX. Search, filter by team or place, and open a digital business card to get in touch.
        </p>
      </div>

      <TeamProfileDirectory initialPeople={people} departments={departments} />
    </div>
  );
}

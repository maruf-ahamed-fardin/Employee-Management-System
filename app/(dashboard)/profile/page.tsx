import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { MyProfileClient } from '@/components/profile/MyProfileClient';

export const metadata: Metadata = {
  title: 'My Profile - SeloraX EMS',
  description: 'View and customize your personal contact information and SeloraX digital team card.',
};

export default async function MyProfilePage() {
  const session = await getSession();
  let emp = null;

  if (session?.employeeId) {
    emp = await prisma.employee.findUnique({
      where: { id: session.employeeId },
      include: {
        department: true,
        position: true,
        manager: true,
        teamProfile: {
          include: { links: true },
        },
      },
    });
  }

  if (!emp) {
    emp = await prisma.employee.findFirst({
      where: { deletedAt: null },
      include: {
        department: true,
        position: true,
        manager: true,
        teamProfile: {
          include: { links: true },
        },
      },
    });
  }

  if (!emp) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
        <h2 className="text-base font-bold text-foreground">No employee record linked</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Your sign-in account is active, but HR hasn&apos;t connected it to an employee record.
        </p>
      </div>
    );
  }

  let addressObj = null;
  let emergencyObj = null;
  try {
    if (emp.address) addressObj = JSON.parse(emp.address);
  } catch {
    addressObj = { line1: emp.address };
  }
  try {
    if (emp.emergencyContact) emergencyObj = JSON.parse(emp.emergencyContact);
  } catch {
    emergencyObj = { name: emp.emergencyContact };
  }

  const tp = emp.teamProfile;

  const initialData = {
    id: emp.id,
    employeeCode: emp.employeeCode,
    firstName: emp.firstName,
    lastName: emp.lastName,
    fullName: `${emp.firstName} ${emp.lastName}`,
    email: emp.email,
    phone: emp.phone,
    dateOfBirth: emp.dateOfBirth,
    gender: emp.gender,
    bloodGroup: emp.bloodGroup,
    department: emp.department?.name || 'General',
    position: emp.position?.title || 'Team Member',
    manager: emp.manager ? `${emp.manager.firstName} ${emp.manager.lastName}` : null,
    employmentType: emp.employmentType,
    joiningDate: emp.joiningDate,
    workLocation: emp.workLocation,
    photoUrl: emp.photoUrl,
    address: addressObj,
    emergencyContact: emergencyObj,
    card: {
      headline: tp?.headline || emp.headline || '',
      businessPhone: tp?.businessPhone || '',
      showPersonalPhone: tp?.showPersonalPhone ?? true,
      links: tp?.links.map((l) => ({ kind: l.kind, url: l.url })) || [],
    },
  };

  return <MyProfileClient initialData={initialData} />;
}

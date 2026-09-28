import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
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
      // Fallback to first active employee
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
      return NextResponse.json({ error: 'No employee record linked' }, { status: 404 });
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

    const data = {
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
      departmentId: emp.departmentId,
      position: emp.position?.title || 'Team Member',
      positionId: emp.positionId,
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

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching my profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    let empId = session?.employeeId;

    if (!empId) {
      const first = await prisma.employee.findFirst({ where: { deletedAt: null } });
      empId = first?.id;
    }

    if (!empId) {
      return NextResponse.json({ error: 'No employee record found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      phone,
      address,
      emergencyContact,
      bloodGroup,
      photoUrl,
      headline,
      businessPhone,
      showPersonalPhone,
      links,
    } = body;

    const updateData: any = {};
    if (phone !== undefined) updateData.phone = phone;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
    if (address !== undefined) {
      updateData.address = typeof address === 'object' ? JSON.stringify(address) : address;
    }
    if (emergencyContact !== undefined) {
      updateData.emergencyContact =
        typeof emergencyContact === 'object' ? JSON.stringify(emergencyContact) : emergencyContact;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.employee.update({
        where: { id: empId },
        data: updateData,
      });
    }

    // Upsert TeamProfile
    await prisma.teamProfile.upsert({
      where: { employeeId: empId },
      create: {
        employeeId: empId,
        headline: headline || '',
        businessPhone: businessPhone || '',
        showPersonalPhone: showPersonalPhone ?? true,
      },
      update: {
        headline,
        businessPhone,
        showPersonalPhone,
      },
    });

    // Update Links if provided
    if (Array.isArray(links)) {
      await prisma.teamProfileLink.deleteMany({ where: { employeeId: empId } });
      if (links.length > 0) {
        await prisma.teamProfileLink.createMany({
          data: links
            .filter((l: any) => l.url && l.url.trim())
            .map((l: any) => ({
              employeeId: empId,
              kind: (l.kind || 'OTHER').toUpperCase(),
              url: l.url.trim(),
            })),
        });
      }
    }

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Error updating my profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}

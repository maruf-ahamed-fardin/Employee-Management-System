import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;

    const emp = await prisma.employee.findFirst({
      where: {
        OR: [{ id: employeeId }, { employeeCode: employeeId }],
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
    });

    if (!emp) {
      return NextResponse.json({ error: 'Team member profile not found' }, { status: 404 });
    }

    const tp = emp.teamProfile;
    const data = {
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      fullName: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      phone: tp?.showPersonalPhone !== false ? emp.phone : null,
      personalPhone: emp.phone,
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
      showPersonalPhone: tp?.showPersonalPhone ?? true,
      links: tp?.links.map((l) => ({ id: l.id, kind: l.kind, url: l.url })) || [],
    };

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching team member card:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch team member card' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const body = await request.json();
    const { headline, businessPhone, showPersonalPhone, links, photoUrl } = body;

    const emp = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { teamProfile: true },
    });

    if (!emp) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Update photo on employee if provided
    if (photoUrl !== undefined) {
      await prisma.employee.update({
        where: { id: employeeId },
        data: { photoUrl },
      });
    }

    // Upsert team profile
    await prisma.teamProfile.upsert({
      where: { employeeId },
      create: {
        employeeId,
        headline,
        businessPhone,
        showPersonalPhone: showPersonalPhone ?? true,
      },
      update: {
        headline,
        businessPhone,
        showPersonalPhone,
      },
    });

    // Update links if provided
    if (Array.isArray(links)) {
      await prisma.teamProfileLink.deleteMany({ where: { employeeId } });
      if (links.length > 0) {
        await prisma.teamProfileLink.createMany({
          data: links.map((l: { kind: string; url: string }) => ({
            employeeId,
            kind: l.kind.toUpperCase(),
            url: l.url,
          })),
        });
      }
    }

    const updated = await prisma.teamProfile.findUnique({
      where: { employeeId },
      include: { links: true },
    });

    return NextResponse.json({ data: updated, message: 'Card updated successfully' });
  } catch (error: any) {
    console.error('Error updating team profile card:', error);
    return NextResponse.json({ error: error.message || 'Failed to update team profile card' }, { status: 500 });
  }
}

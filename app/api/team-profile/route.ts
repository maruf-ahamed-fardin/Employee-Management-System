import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const departmentId = searchParams.get('departmentId') || '';
    const workLocation = searchParams.get('workLocation') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'ACTIVE',
      deletedAt: null,
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (workLocation) {
      where.workLocation = { contains: workLocation };
    }

    if (q) {
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
        { employeeCode: { contains: q } },
        { position: { title: { contains: q } } },
      ];
    }

    const [total, employees] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
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
        skip,
        take: limit,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      }),
    ]);

    const data = employees.map((emp) => {
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

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching team profiles:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch team profiles' }, { status: 500 });
  }
}

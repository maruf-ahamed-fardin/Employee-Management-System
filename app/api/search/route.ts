import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q || q.length < 2) {
      return NextResponse.json({
        data: {
          employees: [],
          departments: [],
          positions: [],
          navigation: [],
        },
      });
    }

    const [employees, departments, positions] = await Promise.all([
      prisma.employee.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { employeeCode: { contains: q } },
            { email: { contains: q } },
          ],
        },
        include: {
          department: true,
          position: true,
        },
        take: 5,
      }),
      prisma.department.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          OR: [{ name: { contains: q } }, { code: { contains: q } }],
        },
        take: 4,
      }),
      prisma.position.findMany({
        where: {
          isActive: true,
          deletedAt: null,
          title: { contains: q },
        },
        include: { department: true },
        take: 4,
      }),
    ]);

    // Quick navigation suggestions
    const pages = [
      { name: 'Team Profile Directory', href: '/team-profile', keywords: 'team profile digital card nfc qr' },
      { name: 'Audit Logs & Trail', href: '/audit-logs', keywords: 'audit security log diff activity' },
      { name: 'Roles & Permissions', href: '/roles', keywords: 'role permission rbac access' },
      { name: 'Notifications Center', href: '/notifications', keywords: 'notification alert unread' },
      { name: 'Leave Requests Queue', href: '/leave/requests', keywords: 'leave request approve reject vacation' },
      { name: 'Leave Policy Types', href: '/leave/types', keywords: 'leave policy annual sick casual' },
      { name: 'Document Classifications', href: '/documents/types', keywords: 'document passport nid type policy' },
      { name: 'My Profile & NFC Card', href: '/profile', keywords: 'my profile card headline' },
      { name: 'Password & Security', href: '/profile/security', keywords: 'password signin session security' },
      { name: 'Payroll Dashboard', href: '/payroll', keywords: 'payroll salary payslip slip compensation' },
      { name: 'Attendance Records', href: '/attendance', keywords: 'attendance punch check in out time' },
    ];

    const navigation = pages.filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.keywords.toLowerCase().includes(q.toLowerCase())
    );

    const data = {
      employees: employees.map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        employeeCode: e.employeeCode,
        positionTitle: e.position?.title || 'Staff',
        departmentName: e.department?.name || 'General',
        email: e.email,
        photoUrl: e.photoUrl,
      })),
      departments: departments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
      })),
      positions: positions.map((p) => ({
        id: p.id,
        title: p.title,
        departmentName: p.department?.name || 'Organization',
      })),
      navigation,
    };

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error in search API:', error);
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}

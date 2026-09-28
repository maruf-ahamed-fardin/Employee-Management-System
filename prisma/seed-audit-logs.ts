import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { employee: true } });
  const admin = users.find((u) => u.role.includes('admin')) || users[0];
  const count = await prisma.auditLog.count();

  if (count > 0) {
    console.log(`AuditLog already has ${count} records.`);
    return;
  }

  const sampleLogs = [
    {
      actorUserId: admin?.id,
      action: 'employee.update',
      entityType: 'employee',
      entityId: admin?.employeeId,
      before: JSON.stringify({
        headline: 'Lead Engineer',
        salary: 85000,
        workLocation: 'Dhaka Office',
      }),
      after: JSON.stringify({
        headline: 'Principal Software Architect',
        salary: 110000,
        workLocation: 'Dhaka HQ, Bangladesh',
      }),
      ip: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
      createdAt: new Date(Date.now() - 1000 * 60 * 35), // 35 mins ago
    },
    {
      actorUserId: admin?.id,
      action: 'role.update',
      entityType: 'role',
      entityId: 'manager',
      before: JSON.stringify({
        permissions: { 'leave.approve': 'OWN' },
      }),
      after: JSON.stringify({
        permissions: { 'leave.approve': 'TEAM' },
      }),
      ip: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
      createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    },
    {
      actorUserId: admin?.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: admin?.id,
      before: null,
      after: JSON.stringify({ status: 'SUCCESS', method: 'PASSWORD' }),
      ip: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
      createdAt: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    },
    {
      actorUserId: admin?.id,
      action: 'leave.approve',
      entityType: 'leave',
      entityId: 'LR-2026-004',
      before: JSON.stringify({ status: 'PENDING' }),
      after: JSON.stringify({ status: 'APPROVED', reviewNote: 'Approved. Enjoy your annual leave.' }),
      ip: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    },
    {
      actorUserId: admin?.id,
      action: 'department.create',
      entityType: 'department',
      entityId: 'dept-rnd',
      before: null,
      after: JSON.stringify({ name: 'Research & Innovation', code: 'RND', isActive: true }),
      ip: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ];

  for (const log of sampleLogs) {
    await prisma.auditLog.create({ data: log });
  }

  console.log(`Seeded ${sampleLogs.length} initial audit logs successfully!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

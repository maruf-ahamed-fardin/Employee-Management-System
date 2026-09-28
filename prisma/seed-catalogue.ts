import { PrismaClient } from '@prisma/client';
import {
  DEFAULT_ROLE_GRANTS,
  PERMISSION_KEYS,
  PERMISSIONS,
  SYSTEM_ROLES,
  SystemRoleKey,
} from '../lib/permissions';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Syncing Permissions and Roles ---');

  // 1. Sync Permissions
  for (const key of PERMISSION_KEYS) {
    const { module, description } = PERMISSIONS[key];
    await prisma.permission.upsert({
      where: { key },
      create: { key, module, description },
      update: { module, description },
    });
  }
  const allPermissions = await prisma.permission.findMany();
  const permMap = new Map(allPermissions.map((p) => [p.key, p.id]));

  // 2. Sync Roles & Default Grants
  for (const roleKey of Object.keys(SYSTEM_ROLES) as SystemRoleKey[]) {
    const { name, description } = SYSTEM_ROLES[roleKey];
    const role = await prisma.role.upsert({
      where: { key: roleKey },
      create: { key: roleKey, name, description, isSystem: true },
      update: { name, description, isSystem: true },
    });

    const grants = DEFAULT_ROLE_GRANTS[roleKey];
    for (const [permKey, scope] of Object.entries(grants)) {
      const permissionId = permMap.get(permKey);
      if (!permissionId || !scope) continue;

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        create: { roleId: role.id, permissionId, scope },
        update: { scope },
      });
    }
  }

  // 3. Link Users to Roles
  const users = await prisma.user.findMany({ where: { roleId: null } });
  for (const user of users) {
    let targetRoleKey = 'employee';
    const legacyRole = user.role.toLowerCase();
    if (legacyRole.includes('super')) targetRoleKey = 'super_admin';
    else if (legacyRole.includes('admin')) targetRoleKey = 'admin';
    else if (legacyRole.includes('hr')) targetRoleKey = 'hr_admin';
    else if (legacyRole.includes('manager')) targetRoleKey = 'manager';

    const r = await prisma.role.findUnique({ where: { key: targetRoleKey } });
    if (r) {
      await prisma.user.update({
        where: { id: user.id },
        data: { roleId: r.id },
      });
    }
  }

  // 4. Seed Document Types
  const documentTypes = [
    { name: 'National ID Card', code: 'national_id', isSensitive: true, hasExpiry: false },
    { name: 'Passport', code: 'passport', isSensitive: true, hasExpiry: true },
    { name: 'Employment Contract', code: 'contract', isSensitive: false, hasExpiry: false },
    { name: 'Educational Certificate', code: 'certificate', isSensitive: false, hasExpiry: false },
    { name: 'Non-Disclosure Agreement', code: 'nda', isSensitive: false, hasExpiry: false },
    { name: 'Driving License', code: 'driving_license', isSensitive: true, hasExpiry: true },
  ];

  for (const dt of documentTypes) {
    await prisma.documentType.upsert({
      where: { code: dt.code },
      create: dt,
      update: dt,
    });
  }

  // 5. Seed Holidays
  const currentYear = new Date().getFullYear();
  const holidays = [
    { date: `${currentYear}-01-01`, name: "New Year's Day" },
    { date: `${currentYear}-02-21`, name: 'International Mother Language Day' },
    { date: `${currentYear}-03-26`, name: 'Independence Day' },
    { date: `${currentYear}-04-14`, name: 'Bengali New Year (Pohela Boishakh)' },
    { date: `${currentYear}-05-01`, name: 'May Day' },
    { date: `${currentYear}-12-16`, name: 'Victory Day' },
    { date: `${currentYear}-12-25`, name: 'Christmas Day' },
  ];

  for (const h of holidays) {
    await prisma.holiday.upsert({
      where: { date: h.date },
      create: h,
      update: { name: h.name },
    });
  }

  // 6. Seed TeamProfiles for all existing employees
  const employees = await prisma.employee.findMany({
    include: { teamProfile: { include: { links: true } }, position: true },
  });

  for (const emp of employees) {
    if (!emp.teamProfile) {
      const tp = await prisma.teamProfile.create({
        data: {
          employeeId: emp.id,
          businessPhone: emp.businessPhone || emp.phone,
          headline: emp.headline || `${emp.position?.title || 'Team Member'} at SeloraX`,
          showPersonalPhone: true,
          links: {
            create: [
              { kind: 'LINKEDIN', url: `https://linkedin.com/in/${emp.firstName.toLowerCase()}-${emp.lastName.toLowerCase()}` },
              { kind: 'GITHUB', url: `https://github.com/${emp.firstName.toLowerCase()}${emp.lastName.toLowerCase()}` },
              { kind: 'WEBSITE', url: 'https://selorax.com' },
            ],
          },
        },
      });
      console.log(`Created TeamProfile for ${emp.firstName} ${emp.lastName}`);
    }
  }

  console.log('✅ Permissions, Roles, DocumentTypes, Holidays, and TeamProfiles synced successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

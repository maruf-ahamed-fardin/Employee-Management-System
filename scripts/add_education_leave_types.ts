import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Exam, University Class, and Others leave types...');

  const leaveTypesData = [
    {
      name: 'Exam',
      code: 'EXAM',
      defaultDays: 10,
      defaultDaysPerYear: 10,
      isPaid: true,
      isActive: true,
    },
    {
      name: 'University Class',
      code: 'UNIVERSITY_CLASS',
      defaultDays: 12,
      defaultDaysPerYear: 12,
      isPaid: true,
      isActive: true,
    },
    {
      name: 'Others',
      code: 'OTHERS',
      defaultDays: 5,
      defaultDaysPerYear: 5,
      isPaid: true,
      isActive: true,
    },
  ];

  const currentYear = new Date().getFullYear();
  const employees = await prisma.employee.findMany();

  for (const item of leaveTypesData) {
    const leaveType = await prisma.leaveType.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        isActive: true,
        defaultDays: item.defaultDays,
        defaultDaysPerYear: item.defaultDaysPerYear,
      },
      create: item,
    });

    console.log(`✓ LeaveType ready: ${leaveType.name} (${leaveType.code})`);

    // Ensure each employee has balance for current year
    for (const emp of employees) {
      const existing = await prisma.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: emp.id,
            leaveTypeId: leaveType.id,
            year: currentYear,
          },
        },
      });

      if (!existing) {
        await prisma.leaveBalance.create({
          data: {
            employeeId: emp.id,
            leaveTypeId: leaveType.id,
            year: currentYear,
            allocated: item.defaultDays,
            used: 0,
            pending: 0,
          },
        });
      }
    }
  }

  console.log('Done! All leave types and employee balances updated successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

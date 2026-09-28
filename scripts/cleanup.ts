import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Cleaning up database...');
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.payrollRecord.deleteMany();
  await prisma.document.deleteMany();
  console.log('✨ Cleanup complete.');
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

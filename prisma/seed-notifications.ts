import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) return;

  const count = await prisma.notification.count();
  if (count > 0) {
    console.log(`Notifications already has ${count} records.`);
    return;
  }

  const primaryUser = users[0];

  const sampleNotifications = [
    {
      userId: primaryUser.id,
      title: 'Leave Request Pending Review',
      body: 'Maruf Ahamed has submitted an Annual Leave request for Oct 12 - Oct 15.',
      type: 'INFO',
      link: '/leave',
      entityType: 'leave',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 20), // 20m ago
    },
    {
      userId: primaryUser.id,
      title: 'Digital Card View Spike',
      body: 'Your SeloraX Team Profile card was viewed and saved via QR scan 4 times today.',
      type: 'SUCCESS',
      link: '/team-profile',
      entityType: 'team_profile',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 95), // 1.5h ago
    },
    {
      userId: primaryUser.id,
      title: 'Document Expiring Soon',
      body: 'Driving License for employee SX-003 is expiring within 30 days. Please verify renewals.',
      type: 'WARNING',
      link: '/employees',
      entityType: 'document',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5h ago
    },
    {
      userId: primaryUser.id,
      title: 'Monthly Attendance Cycle Closed',
      body: 'Attendance calculations for September have been successfully verified.',
      type: 'INFO',
      link: '/attendance',
      entityType: 'attendance',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1d ago
    },
  ];

  for (const n of sampleNotifications) {
    await prisma.notification.create({ data: n });
  }

  console.log(`Seeded ${sampleNotifications.length} sample notifications.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

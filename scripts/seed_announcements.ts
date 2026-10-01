import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding company announcements via SQL...');

  const items = [
    {
      id: randomUUID(),
      title: '🚀 Q4 All-Hands Town Hall & Product Roadmap Showcase',
      content:
        'Join the leadership team this Thursday at 4:00 PM (Dhaka HQ & Zoom) for our quarterly strategic milestones, new teammate introductions, and upcoming engineering initiatives.',
      priority: 'HIGH',
      isPinned: 1,
      category: 'Event',
      authorName: 'Executive Leadership',
    },
    {
      id: randomUUID(),
      title: '📘 Study Leave & University Exam Policy Update',
      content:
        'SeloraX has officially introduced dedicated quotas for Exam Leave and University Class Attendance for our student interns and junior engineering staff. Applications are now open under Leave Management.',
      priority: 'NORMAL',
      isPinned: 1,
      category: 'Policy',
      authorName: 'Nusrat Jahan (People & Culture)',
    },
    {
      id: randomUUID(),
      title: '🏥 Annual Group Health & Wellness Benefit Enrollment',
      content:
        'Please verify and submit updated dependent records for the upcoming fiscal insurance renewal before October 25th. Enhanced outpatient and dental allowances are now included.',
      priority: 'NORMAL',
      isPinned: 0,
      category: 'HR',
      authorName: 'HR Operations',
    },
  ];

  for (const item of items) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO Announcement (id, title, content, priority, isPinned, category, authorName, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      item.id,
      item.title,
      item.content,
      item.priority,
      item.isPinned,
      item.category,
      item.authorName
    );
    console.log(`✓ Inserted announcement: ${item.title}`);
  }

  console.log('Announcements seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

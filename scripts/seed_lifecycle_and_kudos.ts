import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Onboarding/Offboarding tasks and Peer Kudos...');

  const employees = await prisma.employee.findMany();
  const empMap = new Map(employees.map((e) => [e.employeeCode, e]));

  // Clear previous records if any
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM OnboardingTask`);
    await prisma.$executeRawUnsafe(`DELETE FROM Kudos`);
  } catch {}

  const sampleOnboarding = [
    {
      code: 'SX-001', // Maruf
      tasks: [
        { title: 'Verify National ID & Tax Identification (TIN)', category: 'HR', status: 'COMPLETED', assignedTo: 'HR Operations', notes: 'Verified and archived in document vault.' },
        { title: 'Sign Employment Agreement & IP Assignment NDA', category: 'HR', status: 'COMPLETED', assignedTo: 'HR Manager', notes: 'Digitally countersigned.' },
        { title: 'Issue Workstation & Hardware (MacBook Pro M2)', category: 'IT', status: 'COMPLETED', assignedTo: 'IT Support', notes: 'Issued under Asset AST-LPT-001.' },
        { title: 'Configure Corporate Google Workspace & Slack', category: 'IT', status: 'COMPLETED', assignedTo: 'IT Support', notes: '2FA enforced.' },
        { title: 'Introductory 1-on-1 with Department Leadership', category: 'ADMIN', status: 'COMPLETED', assignedTo: 'Operations', notes: 'Completed.' },
      ],
    },
    {
      code: 'SX-005', // Nusrat
      tasks: [
        { title: 'Verify Design Portfolio & Degree Certifications', category: 'HR', status: 'COMPLETED', assignedTo: 'HR Operations', notes: 'Verified.' },
        { title: 'Sign Remote Work Protocol & Confidentiality Agreement', category: 'HR', status: 'COMPLETED', assignedTo: 'HR Manager', notes: 'Signed.' },
        { title: 'Issue ThinkPad X1 Carbon & LG 34" UltraWide Display', category: 'IT', status: 'COMPLETED', assignedTo: 'IT Support', notes: 'Issued under AST-LPT-003 and AST-MON-002.' },
        { title: 'Grant Figma Enterprise & Adobe Creative Cloud Licenses', category: 'IT', status: 'PENDING', assignedTo: 'IT Admin', notes: 'Seat allocation in progress.' },
        { title: 'Product Architecture & Design System Walkthrough', category: 'ADMIN', status: 'PENDING', assignedTo: 'Tech Lead', notes: 'Scheduled for Friday.' },
      ],
    },
    {
      code: 'SX-004', // QA / Testing
      tasks: [
        { title: 'Sign Employment Contract & Emergency Contact Form', category: 'HR', status: 'COMPLETED', assignedTo: 'HR Operations', notes: 'Filed.' },
        { title: 'Allocate QA Testing Mobile Device (iPhone 15 Pro)', category: 'IT', status: 'COMPLETED', assignedTo: 'IT Support', notes: 'Tagged AST-MOB-001.' },
        { title: 'Setup TestRail, BrowserStack, and Jira QA Access', category: 'IT', status: 'PENDING', assignedTo: 'IT Admin', notes: 'Pending credentials.' },
        { title: 'Complete Security & OWASP Compliance Training', category: 'HR', status: 'PENDING', assignedTo: 'Security Lead', notes: 'Modules 1-3 pending.' },
      ],
    },
  ];

  for (const empData of sampleOnboarding) {
    const emp = empMap.get(empData.code);
    if (!emp) continue;

    for (const t of empData.tasks) {
      const id = randomUUID();
      const completedAt = t.status === 'COMPLETED' ? "datetime('now', '-15 days')" : 'NULL';

      await prisma.$executeRawUnsafe(
        `INSERT INTO OnboardingTask (id, employeeId, type, title, category, status, assignedTo, completedAt, notes, createdAt, updatedAt)
         VALUES (?, ?, 'ONBOARDING', ?, ?, ?, ?, ${completedAt}, ?, datetime('now'), datetime('now'))`,
        id,
        emp.id,
        t.title,
        t.category,
        t.status,
        t.assignedTo,
        t.notes
      );
    }
  }

  // Seed Sample Peer Kudos
  const sampleKudos = [
    {
      senderId: 'admin',
      senderName: 'S. M. Farhan',
      receiverCode: 'SX-001', // Maruf
      badge: 'Code Wizard',
      message: 'Phenomenal architecture work delivering the payslip generator and asset inventory with zero downtime!',
      likesCount: 7,
    },
    {
      senderId: 'hr-lead',
      senderName: 'HR Operations',
      receiverCode: 'SX-005', // Nusrat
      badge: 'Culture Champion',
      message: 'Huge shout-out for crafting our new UI design tokens and leading the accessibility review.',
      likesCount: 5,
    },
    {
      senderId: 'tech-lead',
      senderName: 'Maruf Ahamed',
      receiverCode: 'SX-002', // S. M. Farhan
      badge: 'Problem Solver',
      message: 'Great job optimizing our database queries and ensuring high concurrency during month-end payroll!',
      likesCount: 9,
    },
  ];

  for (const k of sampleKudos) {
    const receiver = empMap.get(k.receiverCode);
    if (!receiver) continue;

    const id = randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO Kudos (id, senderId, senderName, receiverId, badge, message, likesCount, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      id,
      k.senderId,
      k.senderName,
      receiver.id,
      k.badge,
      k.message,
      k.likesCount
    );
  }

  console.log('Successfully seeded Onboarding tasks & Peer Kudos!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

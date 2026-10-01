import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial tasks for employees...');

  const employees = await prisma.employee.findMany();
  const empMap = new Map(employees.map((e) => [e.employeeCode, e.id]));

  const now = new Date();
  const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const tasksData = [
    // Ashek Rabbani (SX-001)
    {
      code: 'SX-001',
      title: 'Core Architecture Review for Event Bus',
      description: 'Review throughput requirements and schema migrations for the internal async message broker.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      category: 'Architecture',
      dueDate: daysFromNow(3),
    },
    {
      code: 'SX-001',
      title: 'Database Query Optimization & Index Audit',
      description: 'Inspect slow queries in employee directory search and add composite indexes.',
      priority: 'MEDIUM',
      status: 'TODO',
      category: 'Database',
      dueDate: daysFromNow(6),
    },

    // Nusrat Jahan (SX-002)
    {
      code: 'SX-002',
      title: 'Q4 Employee Performance Cycle Kickoff',
      description: 'Distribute review rubrics to all department heads and prepare schedule.',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      category: 'HR',
      dueDate: daysFromNow(2),
    },
    {
      code: 'SX-002',
      title: 'Revise Company Leave & Attendance Guidelines',
      description: 'Incorporate new exam and university study leave policies for interns and junior staff.',
      priority: 'MEDIUM',
      status: 'TODO',
      category: 'Policy',
      dueDate: daysFromNow(7),
    },

    // Tanvir Ahmed (SX-003)
    {
      code: 'SX-003',
      title: 'Sprint 25 Planning & Backlog Refinement',
      description: 'Prioritize feature requests and review team capacity for the upcoming sprint cycle.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      category: 'Management',
      dueDate: daysFromNow(1),
    },
    {
      code: 'SX-003',
      title: 'Conduct Monthly 1-on-1 Engineering Check-ins',
      description: 'Review quarterly goals and career progression paths with senior engineers.',
      priority: 'MEDIUM',
      status: 'TODO',
      category: 'Management',
      dueDate: daysFromNow(4),
    },

    // Maruf Ahamed (SX-004)
    {
      code: 'SX-004',
      title: 'Build Employee Task Assignment Workflow',
      description: 'Implement task cards, workload badges, and direct assign modal on Employee Directory.',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      category: 'Engineering',
      dueDate: daysFromNow(1),
    },
    {
      code: 'SX-004',
      title: 'Implement Real-time In-App Notification Engine',
      description: 'Set up push notifications for leave approvals, task deadlines, and system alerts.',
      priority: 'HIGH',
      status: 'TODO',
      category: 'Engineering',
      dueDate: daysFromNow(4),
    },
    {
      code: 'SX-004',
      title: 'Audit Log Security Filter Integration',
      description: 'Completed audit logging for sensitive payroll and leave status changes.',
      priority: 'MEDIUM',
      status: 'DONE',
      category: 'Security',
      dueDate: daysFromNow(-1),
    },

    // Anika Akter (SX-005)
    {
      code: 'SX-005',
      title: 'SeloraX Design System v2.0 Tokens & Specs',
      description: 'Refine accessible dark mode color palettes, border radiuses, and button interactions.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      category: 'Design',
      dueDate: daysFromNow(2),
    },
    {
      code: 'SX-005',
      title: 'Mobile App Onboarding Flows & Wireframes',
      description: 'Deliver high-fidelity prototypes for mobile employee pass and attendance check-in.',
      priority: 'MEDIUM',
      status: 'TODO',
      category: 'Design',
      dueDate: daysFromNow(5),
    },

    // Mahmudur Rahman (SX-006)
    {
      code: 'SX-006',
      title: 'Q3 Financial Reconciliation & Revenue Variance',
      description: 'Analyze operational expenditure across departments and flag high variance areas.',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      category: 'Finance',
      dueDate: daysFromNow(2),
    },
    {
      code: 'SX-006',
      title: 'Monthly Payroll Tax Withholding Audit',
      description: 'Verify tax deductions and ensure compliance with updated fiscal regulatory standards.',
      priority: 'MEDIUM',
      status: 'TODO',
      category: 'Payroll',
      dueDate: daysFromNow(5),
    },
  ];

  for (const t of tasksData) {
    const employeeId = empMap.get(t.code);
    if (!employeeId) continue;

    await prisma.task.create({
      data: {
        employeeId,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        category: t.category,
        dueDate: t.dueDate,
      },
    });
    console.log(`✓ Task created for ${t.code}: ${t.title}`);
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

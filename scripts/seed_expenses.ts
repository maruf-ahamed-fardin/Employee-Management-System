import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial expense claims...');

  const employees = await prisma.employee.findMany();
  const empMap = new Map(employees.map((e) => [e.employeeCode, e.id]));

  const expenses = [
    {
      id: randomUUID(),
      code: 'SX-001',
      category: 'TRAINING',
      title: 'AWS Certified Solutions Architect Exam Voucher',
      amount: 35000,
      notes: 'Required certification for enterprise cloud infrastructure compliance.',
      status: 'APPROVED',
      receiptName: 'aws-certification-invoice-2026.pdf',
    },
    {
      id: randomUUID(),
      code: 'SX-005',
      category: 'EQUIPMENT',
      title: 'Commercial Typography & Icon Pack Annual License',
      amount: 14500,
      notes: 'Font licensing for SeloraX mobile application and design system components.',
      status: 'PENDING',
      receiptName: 'font-license-receipt.pdf',
    },
    {
      id: randomUUID(),
      code: 'SX-004',
      category: 'TRAVEL',
      title: 'Client Onsite Integration Travel & Team Lunch',
      amount: 4200,
      notes: 'Uber rides and client working lunch during payment gateway audit.',
      status: 'PENDING',
      receiptName: 'uber-rides-september.pdf',
    },
    {
      id: randomUUID(),
      code: 'SX-006',
      category: 'OTHER',
      title: 'External Tax Regulatory Compliance Consultation',
      amount: 25000,
      notes: 'Statutory fiscal compliance advisory with external audit firm.',
      status: 'PAID',
      receiptName: 'audit-firm-voucher-481.pdf',
    },
    {
      id: randomUUID(),
      code: 'SX-002',
      category: 'MEDICAL',
      title: 'Office First Aid Kit & Emergency Supplies Restock',
      amount: 6800,
      notes: 'Replenishment of workplace medicines, antiseptic, and burn kits.',
      status: 'APPROVED',
      receiptName: 'pharma-cash-memo.jpg',
    },
  ];

  for (const exp of expenses) {
    const employeeId = empMap.get(exp.code);
    if (!employeeId) continue;

    await prisma.$executeRawUnsafe(
      `INSERT INTO ExpenseClaim (id, employeeId, category, title, amount, currency, notes, status, receiptName, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'BDT', ?, ?, ?, datetime('now'), datetime('now'))`,
      exp.id,
      employeeId,
      exp.category,
      exp.title,
      exp.amount,
      exp.notes,
      exp.status,
      exp.receiptName
    );
    console.log(`✓ Seeded expense: ${exp.title} (${exp.amount} BDT) for ${exp.code}`);
  }

  console.log('Expense claims seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

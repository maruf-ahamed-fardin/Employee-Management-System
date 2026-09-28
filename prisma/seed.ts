import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SeloraX EMS database seeding...');

  // 1. Clear existing data
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.payrollRecord.deleteMany();
  await prisma.document.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.position.deleteMany();
  await prisma.department.deleteMany();

  // 2. Departments
  const deptEng = await prisma.department.create({
    data: { name: 'Engineering & Technology', code: 'ENG', description: 'Core software architecture, infrastructure, and platform development' },
  });
  const deptProduct = await prisma.department.create({
    data: { name: 'Product & Design', code: 'PRD', description: 'User experience research, UI systems, and product roadmaps' },
  });
  const deptHR = await prisma.department.create({
    data: { name: 'Human Resources', code: 'HRD', description: 'Talent acquisition, employee welfare, and corporate compliance' },
  });
  const deptFinance = await prisma.department.create({
    data: { name: 'Finance & Operations', code: 'FIN', description: 'Financial forecasting, compensation, and business operations' },
  });

  // 3. Positions
  const posLead = await prisma.position.create({
    data: { title: 'Principal Software Architect', departmentId: deptEng.id, level: 'Lead / Staff', baseSalary: 120000 },
  });
  const posSrDev = await prisma.position.create({
    data: { title: 'Senior Full Stack Engineer', departmentId: deptEng.id, level: 'Senior', baseSalary: 95000 },
  });
  const posUX = await prisma.position.create({
    data: { title: 'Lead Product Designer', departmentId: deptProduct.id, level: 'Senior', baseSalary: 88000 },
  });
  const posHRLead = await prisma.position.create({
    data: { title: 'Head of People & Culture', departmentId: deptHR.id, level: 'Director / Head', baseSalary: 105000 },
  });
  const posFinAnalyst = await prisma.position.create({
    data: { title: 'Senior Financial Analyst', departmentId: deptFinance.id, level: 'Senior', baseSalary: 82000 },
  });

  // 4. Employees
  // Super Admin / Tech Lead
  const emp1 = await prisma.employee.create({
    data: {
      employeeCode: 'SX-001',
      firstName: 'Ashek',
      lastName: 'Rabbani',
      email: 'superadmin@selorax.test',
      phone: '+8801711000001',
      businessPhone: '+88029870001',
      dateOfBirth: '1992-06-15',
      gender: 'MALE',
      bloodGroup: 'B+',
      headline: 'Architecting resilient full-stack systems and high-throughput platforms',
      departmentId: deptEng.id,
      positionId: posLead.id,
      joiningDate: '2022-01-10',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      workLocation: 'Dhaka HQ, Bangladesh',
      salary: 120000,
      address: JSON.stringify({ line1: 'Gulshan 2, Road 45', city: 'Dhaka', country: 'Bangladesh' }),
      emergencyContact: JSON.stringify({ name: 'Farhana Rabbani', relationship: 'Spouse', phone: '+8801711999991' }),
    },
  });

  // HR Manager
  const emp2 = await prisma.employee.create({
    data: {
      employeeCode: 'SX-002',
      firstName: 'Nusrat',
      lastName: 'Jahan',
      email: 'hr@selorax.test',
      phone: '+8801711000002',
      businessPhone: '+88029870002',
      dateOfBirth: '1994-03-22',
      gender: 'FEMALE',
      bloodGroup: 'A+',
      headline: 'Empowering teams, driving culture, and cultivating world-class talent',
      departmentId: deptHR.id,
      positionId: posHRLead.id,
      joiningDate: '2022-03-01',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      workLocation: 'Dhaka HQ, Bangladesh',
      salary: 105000,
      address: JSON.stringify({ line1: 'Banani DOHS', city: 'Dhaka', country: 'Bangladesh' }),
      emergencyContact: JSON.stringify({ name: 'Rafiqul Islam', relationship: 'Father', phone: '+8801711999992' }),
    },
  });

  // Product Manager (Reports to SX-001)
  const emp3 = await prisma.employee.create({
    data: {
      employeeCode: 'SX-003',
      firstName: 'Tanvir',
      lastName: 'Ahmed',
      email: 'manager@selorax.test',
      phone: '+8801711000003',
      businessPhone: '+88029870003',
      dateOfBirth: '1995-11-08',
      gender: 'MALE',
      bloodGroup: 'O+',
      headline: 'Bridging user needs with scalable engineering solutions',
      departmentId: deptProduct.id,
      positionId: posUX.id,
      managerId: emp1.id,
      joiningDate: '2023-02-15',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      workLocation: 'Dhaka HQ, Bangladesh',
      salary: 88000,
      address: JSON.stringify({ line1: 'Dhanmondi 27', city: 'Dhaka', country: 'Bangladesh' }),
      emergencyContact: JSON.stringify({ name: 'Shirin Ahmed', relationship: 'Mother', phone: '+8801711999993' }),
    },
  });

  // Senior Developer (Reports to SX-003)
  const emp4 = await prisma.employee.create({
    data: {
      employeeCode: 'SX-004',
      firstName: 'Maruf',
      lastName: 'Ahamed',
      email: 'employee@selorax.test',
      phone: '+8801711000004',
      businessPhone: '+88029870004',
      dateOfBirth: '1998-08-20',
      gender: 'MALE',
      bloodGroup: 'AB+',
      headline: 'Frontend specialist passionate about design systems & micro-interactions',
      departmentId: deptEng.id,
      positionId: posSrDev.id,
      managerId: emp3.id,
      joiningDate: '2023-08-01',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      workLocation: 'Dhaka HQ, Bangladesh',
      salary: 95000,
      address: JSON.stringify({ line1: 'Uttara Sector 11', city: 'Dhaka', country: 'Bangladesh' }),
      emergencyContact: JSON.stringify({ name: 'Monir Ahamed', relationship: 'Brother', phone: '+8801711999994' }),
    },
  });

  // Additional Team Members
  const emp5 = await prisma.employee.create({
    data: {
      employeeCode: 'SX-005',
      firstName: 'Anika',
      lastName: 'Akter',
      email: 'anika.akter@selorax.test',
      phone: '+8801711000005',
      businessPhone: '+88029870005',
      dateOfBirth: '1997-04-12',
      gender: 'FEMALE',
      bloodGroup: 'A-',
      headline: 'Visual designer focusing on brand identity and accessible component libraries',
      departmentId: deptProduct.id,
      positionId: posUX.id,
      managerId: emp3.id,
      joiningDate: '2024-01-15',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      workLocation: 'Dhaka HQ, Bangladesh',
      salary: 82000,
      address: JSON.stringify({ line1: 'Mirpur DOHS', city: 'Dhaka', country: 'Bangladesh' }),
      emergencyContact: JSON.stringify({ name: 'Kazi Akter', relationship: 'Mother', phone: '+8801711999995' }),
    },
  });

  const emp6 = await prisma.employee.create({
    data: {
      employeeCode: 'SX-006',
      firstName: 'Mahmudur',
      lastName: 'Rahman',
      email: 'mahmud.rahman@selorax.test',
      phone: '+8801711000006',
      businessPhone: '+88029870006',
      dateOfBirth: '1993-09-30',
      gender: 'MALE',
      bloodGroup: 'O-',
      headline: 'Financial planning, audits, and international payroll management',
      departmentId: deptFinance.id,
      positionId: posFinAnalyst.id,
      joiningDate: '2022-09-01',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      workLocation: 'Dhaka HQ, Bangladesh',
      salary: 82000,
      address: JSON.stringify({ line1: 'Mohakhali DOHS', city: 'Dhaka', country: 'Bangladesh' }),
      emergencyContact: JSON.stringify({ name: 'Salma Rahman', relationship: 'Spouse', phone: '+8801711999996' }),
    },
  });

  // 5. User Logins
  await prisma.user.createMany({
    data: [
      { email: 'superadmin@selorax.test', passwordHash: 'demo_hash', role: 'superadmin', employeeId: emp1.id },
      { email: 'hr@selorax.test', passwordHash: 'demo_hash', role: 'admin', employeeId: emp2.id },
      { email: 'manager@selorax.test', passwordHash: 'demo_hash', role: 'manager', employeeId: emp3.id },
      { email: 'employee@selorax.test', passwordHash: 'demo_hash', role: 'employee', employeeId: emp4.id },
      { email: 'anika.akter@selorax.test', passwordHash: 'demo_hash', role: 'employee', employeeId: emp5.id },
      { email: 'mahmud.rahman@selorax.test', passwordHash: 'demo_hash', role: 'employee', employeeId: emp6.id },
    ],
  });

  // 6. Leave Types
  const leaveAnnual = await prisma.leaveType.create({ data: { name: 'Annual Paid Leave', code: 'ANNUAL', defaultDays: 15, isPaid: true } });
  const leaveSick = await prisma.leaveType.create({ data: { name: 'Medical / Sick Leave', code: 'SICK', defaultDays: 10, isPaid: true } });
  const leaveCasual = await prisma.leaveType.create({ data: { name: 'Casual Leave', code: 'CASUAL', defaultDays: 5, isPaid: true } });
  const leaveMaternity = await prisma.leaveType.create({ data: { name: 'Parental Leave', code: 'PARENTAL', defaultDays: 30, isPaid: true } });

  // 7. Leave Balances for Employees
  const currentYear = new Date().getFullYear();
  for (const emp of [emp1, emp2, emp3, emp4, emp5, emp6]) {
    await prisma.leaveBalance.createMany({
      data: [
        { employeeId: emp.id, leaveTypeId: leaveAnnual.id, year: currentYear, allocated: 15, used: 2, pending: 0 },
        { employeeId: emp.id, leaveTypeId: leaveSick.id, year: currentYear, allocated: 10, used: 1, pending: 0 },
        { employeeId: emp.id, leaveTypeId: leaveCasual.id, year: currentYear, allocated: 5, used: 0, pending: 0 },
        { employeeId: emp.id, leaveTypeId: leaveMaternity.id, year: currentYear, allocated: 30, used: 0, pending: 0 },
      ],
    });
  }

  // 8. Sample Leave Requests
  await prisma.leaveRequest.create({
    data: {
      employeeId: emp4.id,
      leaveTypeId: leaveAnnual.id,
      startDate: `${currentYear}-10-05`,
      endDate: `${currentYear}-10-08`,
      days: 4,
      reason: 'Attending annual tech conference and family trip',
      status: 'PENDING',
    },
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: emp5.id,
      leaveTypeId: leaveSick.id,
      startDate: `${currentYear}-09-12`,
      endDate: `${currentYear}-09-13`,
      days: 2,
      reason: 'Fever and medical recovery',
      status: 'APPROVED',
      reviewedById: emp3.id,
      reviewedAt: new Date(),
      reviewNote: 'Get well soon!',
    },
  });

  // 9. Attendance Logs for Today
  const today = new Date().toISOString().slice(0, 10);
  for (const emp of [emp1, emp2, emp3, emp4, emp5]) {
    const isLate = emp.id === emp4.id;
    const firstIn = `${today}T${isLate ? '09:24:00' : '08:52:00'}Z`;

    const att = await prisma.attendance.create({
      data: {
        employeeId: emp.id,
        workDate: today,
        firstInAt: firstIn,
        workedMinutes: 480,
        lateMinutes: isLate ? 24 : 0,
        status: isLate ? 'LATE' : 'PRESENT',
      },
    });

    await prisma.attendanceRecord.create({
      data: {
        attendanceId: att.id,
        employeeId: emp.id,
        type: 'CHECK_IN',
        occurredAt: firstIn,
        source: 'WEB',
      },
    });
  }

  // 10. Sample Payroll Records
  const currentMonth = new Date().getMonth() + 1;
  for (const emp of [emp1, emp2, emp3, emp4, emp5, emp6]) {
    const basic = emp.salary;
    const allowances = Math.round(basic * 0.15);
    const deductions = Math.round(basic * 0.05);
    const net = basic + allowances - deductions;

    await prisma.payrollRecord.create({
      data: {
        employeeId: emp.id,
        month: currentMonth,
        year: currentYear,
        basicSalary: basic,
        allowances,
        deductions,
        netSalary: net,
        status: emp.id === emp1.id || emp.id === emp2.id ? 'PAID' : 'PENDING',
        paymentMethod: 'BANK_TRANSFER',
        paymentDate: `${currentYear}-09-25`,
      },
    });
  }

  // 11. Documents
  await prisma.document.create({
    data: {
      employeeId: emp1.id,
      title: 'Signed Employment Agreement',
      documentType: 'CONTRACT',
      storageUrl: '/documents/contract.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 154000,
      isSensitive: true,
    },
  });

  await prisma.document.create({
    data: {
      employeeId: emp1.id,
      title: 'National Identity Card (Smart NID)',
      documentType: 'NATIONAL_ID',
      storageUrl: '/documents/nid.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 89000,
      isSensitive: true,
    },
  });

  console.log('✅ Database seeded with 6 employees, departments, attendance, leaves, payroll, and users!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

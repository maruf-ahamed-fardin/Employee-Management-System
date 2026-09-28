import { prisma } from '@/lib/db';

export const payrollService = {
  async getPayrollRecords(params?: {
    month?: number;
    year?: number;
    status?: string;
    departmentId?: string;
  }) {
    const where: any = {};
    if (params?.month) where.month = params.month;
    if (params?.year) where.year = params.year;
    if (params?.status) where.status = params.status;
    if (params?.departmentId) {
      where.employee = { departmentId: params.departmentId };
    }

    const records = await prisma.payrollRecord.findMany({
      where,
      include: {
        employee: {
          include: { department: true, position: true },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    const summary = {
      totalPayroll: records.reduce((sum, r) => sum + r.netSalary, 0),
      paidAmount: records.filter((r) => r.status === 'PAID').reduce((sum, r) => sum + r.netSalary, 0),
      pendingAmount: records.filter((r) => r.status !== 'PAID').reduce((sum, r) => sum + r.netSalary, 0),
      employeeCount: records.length,
    };

    return { records, summary };
  },

  async generateMonthlyPayroll(month: number, year: number) {
    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
    });

    const created = [];
    for (const emp of employees) {
      const basicSalary = emp.salary || 50000;
      const allowances = Math.round(basicSalary * 0.15); // 15% allowance (medical + transport)
      const deductions = Math.round(basicSalary * 0.05); // 5% tax/provident
      const netSalary = basicSalary + allowances - deductions;

      const record = await prisma.payrollRecord.upsert({
        where: {
          employeeId_month_year: {
            employeeId: emp.id,
            month,
            year,
          },
        },
        create: {
          employeeId: emp.id,
          month,
          year,
          basicSalary,
          allowances,
          deductions,
          netSalary,
          status: 'PENDING',
        },
        update: {},
      });
      created.push(record);
    }

    return created;
  },

  async markAsPaid(id: string, paymentMethod: string = 'BANK_TRANSFER') {
    return prisma.payrollRecord.update({
      where: { id },
      data: {
        status: 'PAID',
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentMethod,
      },
    });
  },
};

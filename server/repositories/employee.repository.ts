import { prisma } from '@/lib/db';
import type { EmployeeCreateInput, EmployeeUpdateInput } from '@/lib/validations/employee';

export const employeeRepository = {
  async findAll(params?: {
    search?: string;
    departmentId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.departmentId) {
      where.departmentId = params.departmentId;
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { employeeCode: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        include: {
          department: true,
          position: true,
          manager: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      }),
      prisma.employee.count({ where }),
    ]);

    return { items, total };
  },

  async findById(id: string) {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        manager: true,
        directReports: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            position: { select: { title: true } },
          },
        },
        documents: true,
        leaveBalances: {
          include: { leaveType: true },
        },
      },
    });
  },

  async findByCode(code: string) {
    return prisma.employee.findUnique({
      where: { employeeCode: code.toUpperCase() },
      include: {
        department: true,
        position: true,
      },
    });
  },

  async create(data: EmployeeCreateInput) {
    return prisma.employee.create({
      data: {
        employeeCode: data.employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender || null,
        address: JSON.stringify(data.address),
        emergencyContact: JSON.stringify(data.emergencyContact),
        departmentId: data.departmentId,
        positionId: data.positionId,
        managerId: data.managerId || null,
        joiningDate: data.joiningDate,
        employmentType: data.employmentType,
        status: data.status || 'ACTIVE',
        workLocation: data.workLocation,
        salary: data.salary || 50000,
        bloodGroup: data.bloodGroup || null,
        headline: data.headline || null,
        businessPhone: data.businessPhone || null,
      },
      include: {
        department: true,
        position: true,
      },
    });
  },

  async update(id: string, data: EmployeeUpdateInput) {
    const updateData: any = { ...data };

    if (data.address) updateData.address = JSON.stringify(data.address);
    if (data.emergencyContact) updateData.emergencyContact = JSON.stringify(data.emergencyContact);

    return prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        department: true,
        position: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.employee.delete({
      where: { id },
    });
  },
};

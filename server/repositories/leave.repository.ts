import { prisma } from '@/lib/db';
import type { LeaveRequestInput } from '@/lib/validations/leave';

export const leaveRepository = {
  async findAllTypes() {
    return prisma.leaveType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  },

  async findBalances(employeeId: string, year: number) {
    return prisma.leaveBalance.findMany({
      where: { employeeId, year },
      include: { leaveType: true },
    });
  },

  async findAllRequests(params?: {
    employeeId?: string;
    status?: string;
    departmentId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 15;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.employeeId) where.employeeId = params.employeeId;
    if (params?.status) where.status = params.status;
    if (params?.departmentId) {
      where.employee = { departmentId: params.departmentId };
    }

    const [items, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: {
            include: { department: true, position: true },
          },
          leaveType: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return { items, total };
  },

  async createRequest(employeeId: string, input: LeaveRequestInput, days: number) {
    return prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId: input.leaveTypeId,
        startDate: input.startDate,
        endDate: input.endDate,
        days,
        reason: input.reason,
        status: 'PENDING',
      },
      include: {
        leaveType: true,
      },
    });
  },

  async updateReview(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    reviewedById: string,
    reviewNote?: string
  ) {
    return prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        reviewedById,
        reviewNote,
        reviewedAt: new Date(),
      },
    });
  },
};

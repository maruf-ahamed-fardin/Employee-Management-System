import { leaveRepository } from '@/server/repositories/leave.repository';
import type { LeaveRequestInput, LeaveReviewInput } from '@/lib/validations/leave';
import { AppError } from '@/lib/api/errors';

export const leaveService = {
  async getLeaveTypes() {
    return leaveRepository.findAllTypes();
  },

  async getBalances(employeeId: string, year: number = new Date().getFullYear()) {
    const balances = await leaveRepository.findBalances(employeeId, year);
    return balances.map((b) => ({
      id: b.id,
      employeeId: b.employeeId,
      leaveTypeId: b.leaveTypeId,
      leaveTypeName: b.leaveType.name,
      year: b.year,
      allocated: b.allocated,
      used: b.used,
      pending: b.pending,
      available: Math.max(0, b.allocated - b.used - b.pending),
    }));
  },

  async getRequests(params?: {
    employeeId?: string;
    status?: string;
    departmentId?: string;
    page?: number;
    limit?: number;
  }) {
    return leaveRepository.findAllRequests(params);
  },

  async requestLeave(employeeId: string, input: LeaveRequestInput) {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);

    if (end < start) {
      throw new AppError('End date cannot be earlier than start date');
    }

    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    return leaveRepository.createRequest(employeeId, input, diffDays);
  },

  async reviewRequest(id: string, reviewerId: string, input: LeaveReviewInput) {
    return leaveRepository.updateReview(id, input.status, reviewerId, input.reviewNote);
  },
};

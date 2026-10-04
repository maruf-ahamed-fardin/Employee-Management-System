import { prisma } from '@/lib/db';

export const attendanceRepository = {
  async findByEmployeeAndDate(employeeId: string, workDate: string) {
    return prisma.attendance.findUnique({
      where: {
        employeeId_workDate: {
          employeeId,
          workDate,
        },
      },
      include: {
        records: {
          orderBy: { occurredAt: 'asc' },
        },
      },
    });
  },

  async findAll(params?: {
    workDate?: string;
    departmentId?: string;
    status?: string;
    employeeId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.workDate) where.workDate = params.workDate;
    if (params?.status) where.status = params.status;
    if (params?.employeeId) where.employeeId = params.employeeId;
    if (params?.departmentId) {
      where.employee = { departmentId: params.departmentId };
    }

    const [items, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: {
            include: { department: true, position: true },
          },
          records: {
            orderBy: { occurredAt: 'asc' },
          },
        },
        orderBy: [{ workDate: 'desc' }, { employee: { firstName: 'asc' } }],
      }),
      prisma.attendance.count({ where }),
    ]);

    return { items, total };
  },

  async recordPunch(params: {
    employeeId: string;
    workDate: string;
    type: 'CHECK_IN' | 'CHECK_OUT';
    occurredAt: string;
    source?: string;
    ip?: string | null;
    /** Minutes past shift start for a CHECK_IN; only applied to the first check-in of the day. */
    lateMinutes?: number;
  }) {
    const lateMinutes = params.type === 'CHECK_IN' ? params.lateMinutes || 0 : 0;
    const arrival = { status: lateMinutes > 0 ? 'LATE' : 'PRESENT', lateMinutes };

    let attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_workDate: {
          employeeId: params.employeeId,
          workDate: params.workDate,
        },
      },
    });

    if (!attendance) {
      attendance = await prisma.attendance.create({
        data: {
          employeeId: params.employeeId,
          workDate: params.workDate,
          firstInAt: params.type === 'CHECK_IN' ? params.occurredAt : null,
          ...arrival,
        },
      });
    }

    // Add individual punch record
    const record = await prisma.attendanceRecord.create({
      data: {
        attendanceId: attendance.id,
        employeeId: params.employeeId,
        type: params.type,
        occurredAt: params.occurredAt,
        source: params.source || 'WEB',
        ip: params.ip || null,
      },
    });

    // Update attendance day aggregates
    if (params.type === 'CHECK_IN' && !attendance.firstInAt) {
      await prisma.attendance.update({
        where: { id: attendance.id },
        data: { firstInAt: params.occurredAt, ...arrival },
      });
    } else if (params.type === 'CHECK_OUT') {
      const firstIn = attendance.firstInAt ? new Date(attendance.firstInAt).getTime() : 0;
      const lastOut = new Date(params.occurredAt).getTime();
      const workedMinutes = firstIn > 0 ? Math.max(0, Math.floor((lastOut - firstIn) / (1000 * 60))) : 0;

      await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          lastOutAt: params.occurredAt,
          workedMinutes,
        },
      });
    }

    const updatedAttendance = await prisma.attendance.findUnique({
      where: { id: attendance.id },
      include: {
        records: {
          orderBy: { occurredAt: 'asc' },
        },
      },
    });

    return {
      ...record,
      attendance: updatedAttendance,
    };
  },

  async resumeShift(employeeId: string, workDate: string) {
    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_workDate: {
          employeeId,
          workDate,
        },
      },
    });

    if (!attendance) return null;

    // Remove lastOutAt
    await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        lastOutAt: null,
      },
    });

    // Delete the last CHECK_OUT record so history remains clean
    const lastCheckOut = await prisma.attendanceRecord.findFirst({
      where: {
        attendanceId: attendance.id,
        type: 'CHECK_OUT',
      },
      orderBy: { occurredAt: 'desc' },
    });

    if (lastCheckOut) {
      await prisma.attendanceRecord.delete({
        where: { id: lastCheckOut.id },
      });
    }

    return prisma.attendance.findUnique({
      where: { id: attendance.id },
      include: {
        records: {
          orderBy: { occurredAt: 'asc' },
        },
      },
    });
  },

  async updateCorrection(id: string, data: { firstInAt?: string; lastOutAt?: string; status: string; note: string }) {
    return prisma.attendance.update({
      where: { id },
      data,
    });
  },
};

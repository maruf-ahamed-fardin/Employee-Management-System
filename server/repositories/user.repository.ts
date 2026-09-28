import { prisma } from '@/lib/db';
import type { UserCreateInput } from '@/lib/validations/user';

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
    });
  },

  async findAll() {
    return prisma.user.findMany({
      include: {
        employee: {
          include: {
            department: true,
            position: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: UserCreateInput & { passwordHash: string }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role,
        employeeId: data.employeeId || null,
      },
    });
  },

  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  },
};

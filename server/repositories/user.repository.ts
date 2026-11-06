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

  async findByFirebaseUid(firebaseUid: string) {
    return prisma.user.findUnique({
      where: { firebaseUid },
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

  async create(data: {
    email: string;
    password?: string;
    passwordHash?: string | null;
    role?: string;
    employeeId?: string | null;
    firebaseUid?: string | null;
    authProvider?: string;
    status?: string;
  }) {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash || null,
        role: data.role || 'employee',
        employeeId: data.employeeId || null,
        firebaseUid: data.firebaseUid || null,
        authProvider: data.authProvider || 'firebase',
        status: data.status || 'ACTIVE',
      },
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

  async linkFirebaseUid(id: string, firebaseUid: string, authProvider = 'firebase') {
    return prisma.user.update({
      where: { id },
      data: {
        firebaseUid,
        authProvider,
      },
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

  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  },
};

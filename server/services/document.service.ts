import { prisma } from '@/lib/db';

export const documentService = {
  async getEmployeeDocuments(employeeId: string) {
    return prisma.document.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getAllDocuments(params?: { documentType?: string; search?: string }) {
    const where: any = {};
    if (params?.documentType) where.documentType = params.documentType;
    if (params?.search) {
      where.title = { contains: params.search };
    }

    return prisma.document.findMany({
      where,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async addDocument(data: {
    employeeId: string;
    title: string;
    documentType: string;
    storageUrl: string;
    mimeType: string;
    sizeBytes: number;
    expiresAt?: string;
    isSensitive?: boolean;
  }) {
    return prisma.document.create({
      data: {
        employeeId: data.employeeId,
        title: data.title,
        documentType: data.documentType,
        storageUrl: data.storageUrl,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        expiresAt: data.expiresAt || null,
        isSensitive: data.isSensitive ?? false,
      },
    });
  },

  async deleteDocument(id: string) {
    return prisma.document.delete({
      where: { id },
    });
  },
};

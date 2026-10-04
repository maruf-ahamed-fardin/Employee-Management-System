import { prisma } from '@/lib/db';
import { storageProvider } from '@/lib/storage/provider';

const employeeSelect = { id: true, firstName: true, lastName: true, employeeCode: true, photoUrl: true } as const;
const listInclude = {
  employee: { select: employeeSelect },
  documentTypeRef: { select: { id: true, name: true } },
} as const;

type DocumentRecord = Awaited<ReturnType<typeof prisma.document.findFirstOrThrow>>;

/**
 * Shape sent to the browser. The storage key never leaves the server; clients
 * only learn whether a real file exists behind the record.
 */
export function toClientDocument<T extends DocumentRecord>(doc: T) {
  const { storageUrl, ...rest } = doc;
  return { ...rest, hasFile: storageProvider.owns(storageUrl) };
}

export const documentService = {
  async list(scope: { employeeId?: string }, params?: { documentType?: string; search?: string }) {
    const docs = await prisma.document.findMany({
      where: {
        deletedAt: null,
        ...scope,
        ...(params?.documentType ? { documentType: params.documentType } : {}),
        ...(params?.search ? { title: { contains: params.search } } : {}),
      },
      include: listInclude,
      orderBy: { createdAt: 'desc' },
    });
    return docs.map(toClientDocument);
  },

  findById(id: string) {
    return prisma.document.findFirst({ where: { id, deletedAt: null } });
  },

  async create(data: {
    employeeId: string;
    title: string;
    documentTypeId: string | null;
    documentType: string;
    storageUrl: string;
    mimeType: string;
    sizeBytes: number;
    expiresAt: string | null;
    isSensitive: boolean;
    uploadedById: string | null;
  }) {
    const doc = await prisma.document.create({ data, include: listInclude });
    return toClientDocument(doc);
  },

  async update(
    id: string,
    data: { title?: string; documentTypeId?: string | null; documentType?: string; expiresAt?: string | null; isSensitive?: boolean }
  ) {
    const doc = await prisma.document.update({ where: { id }, data, include: listInclude });
    return toClientDocument(doc);
  },

  /** Removes the database row first, then the file, so a failed unlink never leaves a row pointing at nothing. */
  async remove(doc: { id: string; storageUrl: string }) {
    await prisma.document.delete({ where: { id: doc.id } });
    await storageProvider.delete(doc.storageUrl);
  },
};

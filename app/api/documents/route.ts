import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { canAccessEmployeeDocuments, canManageDocuments, documentScope } from '@/lib/auth/documents';
import { createAuditLog } from '@/lib/audit';
import { storageProvider } from '@/lib/storage/provider';
import { MAX_DOCUMENT_BYTES, detectDocumentFile, parseExpiry } from '@/lib/validations/document-file';
import { documentService } from '@/server/services/document.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (employeeId) {
      if (!canAccessEmployeeDocuments(session, employeeId)) return errorResponse('You do not have access to these documents', 403);
      return successResponse(await documentService.list({ employeeId }));
    }

    const docs = await documentService.list(documentScope(session), {
      documentType: searchParams.get('documentType') || undefined,
      search: searchParams.get('search') || undefined,
    });
    return successResponse(docs);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch documents', 500);
  }
}

/** Resolves the classification fields from an optional DocumentType id. */
async function resolveType(documentTypeId: string | null) {
  if (!documentTypeId) return { documentTypeId: null, documentType: 'OTHER' };
  const type = await prisma.documentType.findFirst({ where: { id: documentTypeId, deletedAt: null }, select: { id: true, code: true } });
  return type ? { documentTypeId: type.id, documentType: type.code } : null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const form = await req.formData().catch(() => null);
    if (!form) return errorResponse('Upload must be sent as multipart form data', 400);

    const employeeId = String(form.get('employeeId') || '');
    const title = String(form.get('title') || '').trim();
    const file = form.get('file');

    if (!employeeId) return errorResponse('Please select an employee', 400);
    if (!title) return errorResponse('Please provide a document title', 400);
    if (title.length > 150) return errorResponse('Title must be 150 characters or fewer', 400);
    if (!(file instanceof File) || file.size === 0) return errorResponse('Please choose a file to upload', 400);
    if (file.size > MAX_DOCUMENT_BYTES) return errorResponse('File is larger than the 10 MB limit', 413);

    // Admins upload for anyone; everyone else only into their own record
    if (!canAccessEmployeeDocuments(session, employeeId)) {
      return errorResponse('You can only upload documents to your own record', 403);
    }
    const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { id: true } });
    if (!employee) return errorResponse('Employee not found', 404);

    const expiresAt = parseExpiry(form.get('expiresAt'));
    if (expiresAt === undefined) return errorResponse('Expiry date is not valid', 400);

    const type = await resolveType(String(form.get('documentTypeId') || '') || null);
    if (!type) return errorResponse('Document type not found', 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectDocumentFile(buffer, file.name);
    if (!detected) return errorResponse('Unsupported file. Upload a PDF, PNG, JPG, WEBP, DOC or DOCX.', 415);

    const storageUrl = await storageProvider.upload(buffer, detected.extension);
    try {
      const doc = await documentService.create({
        employeeId,
        title,
        ...type,
        storageUrl,
        mimeType: detected.mimeType,
        sizeBytes: buffer.length,
        expiresAt,
        isSensitive: form.get('isSensitive') === 'true',
        uploadedById: session.id,
      });

      await createAuditLog({
        actorUserId: session.id,
        action: 'document.upload',
        entityType: 'document',
        entityId: doc.id,
        after: { employeeId, title, documentType: doc.documentType, sizeBytes: doc.sizeBytes, isSensitive: doc.isSensitive },
      });

      return successResponse(doc, 'Document uploaded successfully', undefined, 201);
    } catch (err) {
      // Don't leave an orphaned file behind if the row could not be written
      await storageProvider.delete(storageUrl);
      throw err;
    }
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to upload document', 400);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);
    if (!canManageDocuments(session.role)) return errorResponse('You do not have permission to edit documents', 403);

    const body = await req.json();
    if (!body.id) return errorResponse('Document ID required', 400);

    const existing = await documentService.findById(body.id);
    if (!existing) return errorResponse('Document not found', 404);

    const data: Parameters<typeof documentService.update>[1] = {};
    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) return errorResponse('Please provide a document title', 400);
      if (title.length > 150) return errorResponse('Title must be 150 characters or fewer', 400);
      data.title = title;
    }
    if (body.expiresAt !== undefined) {
      const expiresAt = parseExpiry(body.expiresAt);
      if (expiresAt === undefined) return errorResponse('Expiry date is not valid', 400);
      data.expiresAt = expiresAt;
    }
    if (body.documentTypeId !== undefined) {
      const type = await resolveType(body.documentTypeId || null);
      if (!type) return errorResponse('Document type not found', 400);
      Object.assign(data, type);
    }
    if (typeof body.isSensitive === 'boolean') data.isSensitive = body.isSensitive;

    const updated = await documentService.update(existing.id, data);

    await createAuditLog({
      actorUserId: session.id,
      action: 'document.update',
      entityType: 'document',
      entityId: existing.id,
      before: { title: existing.title, documentType: existing.documentType, expiresAt: existing.expiresAt, isSensitive: existing.isSensitive },
      after: { title: updated.title, documentType: updated.documentType, expiresAt: updated.expiresAt, isSensitive: updated.isSensitive },
    });

    return successResponse(updated, 'Document updated');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to update document', 400);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);
    if (!canManageDocuments(session.role)) return errorResponse('You do not have permission to delete documents', 403);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('Document ID required', 400);

    const existing = await documentService.findById(id);
    if (!existing) return errorResponse('Document not found', 404);

    await documentService.remove(existing);

    await createAuditLog({
      actorUserId: session.id,
      action: 'document.delete',
      entityType: 'document',
      entityId: id,
      before: { employeeId: existing.employeeId, title: existing.title, documentType: existing.documentType },
    });

    return successResponse({ id }, 'Document deleted');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to delete document', 400);
  }
}

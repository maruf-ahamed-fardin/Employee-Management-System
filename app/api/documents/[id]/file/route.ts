import { NextRequest } from 'next/server';
import { errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { canAccessEmployeeDocuments } from '@/lib/auth/documents';
import { createAuditLog } from '@/lib/audit';
import { storageProvider } from '@/lib/storage/provider';
import { PREVIEWABLE_MIME_TYPES } from '@/lib/validations/document-file';
import { documentService } from '@/server/services/document.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const doc = await documentService.findById(id);
    // Same response whether the document is missing or off-limits, so ids can't be probed
    if (!doc || !canAccessEmployeeDocuments(session, doc.employeeId)) return errorResponse('Document not found', 404);

    const bytes = await storageProvider.read(doc.storageUrl);
    if (!bytes) return errorResponse('No file is stored for this document. Upload it again.', 404);

    const wantsDownload = new URL(req.url).searchParams.get('download') === '1';
    // Only formats that are safe to render are ever served inline
    const inline = !wantsDownload && PREVIEWABLE_MIME_TYPES.includes(doc.mimeType);

    const extension = doc.storageUrl.split('.').pop();
    const baseName = doc.title.replace(/[\\/:*?"<>|\r\n]+/g, ' ').trim() || 'document';
    const fileName = baseName.toLowerCase().endsWith(`.${extension}`) ? baseName : `${baseName}.${extension}`;
    const asciiName = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, "'");

    await createAuditLog({
      actorUserId: session.id,
      action: inline ? 'document.view' : 'document.download',
      entityType: 'document',
      entityId: doc.id,
      after: { employeeId: doc.employeeId, title: doc.title },
    });

    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': doc.mimeType,
        'Content-Length': String(bytes.length),
        'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to load document', 500);
  }
}

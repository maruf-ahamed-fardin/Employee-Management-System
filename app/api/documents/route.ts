import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { documentService } from '@/server/services/document.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (employeeId) {
      const docs = await documentService.getEmployeeDocuments(employeeId);
      return successResponse(docs);
    }

    const docs = await documentService.getAllDocuments({
      documentType: searchParams.get('documentType') || undefined,
      search: searchParams.get('search') || undefined,
    });
    return successResponse(docs);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch documents', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const doc = await documentService.addDocument(body);
    return successResponse(doc, 'Document uploaded successfully', undefined, 201);
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to add document', 400);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return errorResponse('Document ID required', 400);

    await documentService.deleteDocument(id);
    return successResponse({ id }, 'Document deleted');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to delete document', 400);
  }
}

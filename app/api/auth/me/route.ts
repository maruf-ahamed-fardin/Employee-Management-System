import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return errorResponse('Not authenticated', 401);
  }
  return successResponse(session);
}

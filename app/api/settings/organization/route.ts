import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import { getSession } from '@/lib/auth/session';
import { canManageSettings } from '@/lib/auth/settings';
import { recordAuditLog } from '@/lib/audit';
import { getOrganizationProfile, organizationProfileSchema, saveOrganizationProfile } from '@/lib/settings';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);

    return successResponse(await getOrganizationProfile());
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to fetch organization profile', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('Unauthorized', 401);
    if (!canManageSettings(session.role)) return errorResponse('You do not have permission to change settings', 403);

    const previousValue = await getOrganizationProfile();
    const parsed = organizationProfileSchema.safeParse({ ...previousValue, ...(await req.json()) });
    if (!parsed.success) return errorResponse(parsed.error.errors[0]?.message || 'Invalid organization profile', 400);

    const saved = await saveOrganizationProfile(parsed.data);

    await recordAuditLog({
      userId: session.id,
      action: 'UPDATE',
      entityType: 'SETTING',
      entityId: 'organization_profile',
      before: previousValue,
      after: saved,
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    });

    return successResponse(saved, 'Organization profile saved');
  } catch (err: any) {
    return errorResponse(err?.message || 'Failed to update organization profile', 400);
  }
}

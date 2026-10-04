import { cookies } from 'next/headers';
import type { SessionUser } from '@/types/user';
import { getRolePermissions } from './permissions';
import { SESSION_COOKIE_NAME, signSessionToken, verifySessionToken } from './session-token';

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from './session-token';

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const user = await verifySessionToken<SessionUser>(cookieStore.get(SESSION_COOKIE_NAME)?.value);

    if (!user || !user.id || !user.role) return null;

    // Attach up-to-date permissions
    user.permissions = getRolePermissions(user.role);
    return user;
  } catch {
    return null;
  }
}

export function encodeSession(user: Partial<SessionUser>): Promise<string> {
  return signSessionToken({
    id: user.id,
    email: user.email,
    role: user.role || 'employee',
    employeeId: user.employeeId,
    employeeName: user.employeeName,
    employeeCode: user.employeeCode,
    departmentName: user.departmentName,
    status: user.status || 'ACTIVE',
    photoUrl: user.photoUrl,
  });
}

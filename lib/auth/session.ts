import { cookies } from 'next/headers';
import type { SessionUser } from '@/types/user';
import { getRolePermissions } from './permissions';

export const SESSION_COOKIE_NAME = 'ems_session';

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const user = JSON.parse(decoded) as SessionUser;

    if (!user || !user.id || !user.role) return null;

    // Attach up-to-date permissions
    user.permissions = getRolePermissions(user.role);
    return user;
  } catch {
    return null;
  }
}

export function encodeSession(user: Partial<SessionUser>): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role || 'employee',
    employeeId: user.employeeId,
    employeeName: user.employeeName,
    employeeCode: user.employeeCode,
    departmentName: user.departmentName,
    status: user.status || 'ACTIVE',
    photoUrl: user.photoUrl,
    permissions: getRolePermissions((user.role as any) || 'employee'),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

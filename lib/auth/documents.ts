import type { SessionUser } from '@/types/user';

// HR/admin roles manage every employee's documents; everyone else is limited to their own.
const DOCUMENT_ADMIN_ROLES = ['superadmin', 'super_admin', 'admin', 'hr_admin'];

export function canManageDocuments(role?: string | null): boolean {
  return !!role && DOCUMENT_ADMIN_ROLES.includes(role);
}

/** Read access to one employee's documents: admins, or the employee themselves. */
export function canAccessEmployeeDocuments(session: SessionUser | null, employeeId: string): boolean {
  if (!session) return false;
  return canManageDocuments(session.role) || (!!session.employeeId && session.employeeId === employeeId);
}

/** Prisma filter limiting a document query to what this session may see. */
export function documentScope(session: SessionUser): { employeeId?: string } {
  if (canManageDocuments(session.role)) return {};
  // No linked employee record means there is nothing they own
  return { employeeId: session.employeeId || '__none__' };
}

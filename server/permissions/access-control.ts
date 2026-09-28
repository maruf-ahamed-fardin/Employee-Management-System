import { hasPermission } from '@/lib/auth/permissions';
import { ForbiddenError, UnauthorizedError } from '@/lib/api/errors';
import type { SessionUser } from '@/types/user';

export function assertAuthenticated(user: SessionUser | null): asserts user is SessionUser {
  if (!user) {
    throw new UnauthorizedError('You must be signed in to perform this action');
  }
}

export function assertPermission(user: SessionUser | null, permission: string): asserts user is SessionUser {
  assertAuthenticated(user);
  if (!hasPermission(user.permissions, permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

export function canManageEmployee(currentUser: SessionUser, targetEmployeeId: string): boolean {
  if (currentUser.role === 'superadmin' || currentUser.role === 'admin') return true;
  if (currentUser.employeeId === targetEmployeeId) return true;
  return false;
}

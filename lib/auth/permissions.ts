import { ROLE_DEFAULT_PERMISSIONS } from '@/lib/constants/permissions';
import type { RoleKey } from '@/types/user';

export * from '@/lib/constants/permissions';

export function getRolePermissions(role: RoleKey): string[] {
  return ROLE_DEFAULT_PERMISSIONS[role] || [];
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}

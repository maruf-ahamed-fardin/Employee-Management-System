// Mirrors the roles allowed to see "Positions" in config/navigation.ts
const POSITION_MANAGER_ROLES = ['superadmin', 'super_admin', 'admin'];

export function canManagePositions(role?: string | null): boolean {
  return !!role && POSITION_MANAGER_ROLES.includes(role);
}

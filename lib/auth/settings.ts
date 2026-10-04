// Mirrors the roles allowed to see "Settings" in config/navigation.ts
const SETTINGS_ADMIN_ROLES = ['superadmin', 'super_admin', 'admin'];

export function canManageSettings(role?: string | null): boolean {
  return !!role && SETTINGS_ADMIN_ROLES.includes(role);
}

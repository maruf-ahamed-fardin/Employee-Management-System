export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<RoleType, string> = {
  superadmin: 'Super Admin',
  admin: 'HR / Administrator',
  manager: 'Department Manager',
  employee: 'Employee',
};

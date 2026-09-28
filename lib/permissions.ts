export type PermissionScope = 'OWN' | 'TEAM' | 'ALL';

export const PERMISSIONS = {
  'employee.view': { module: 'employees', description: 'View employee profiles' },
  'employee.view_private': {
    module: 'employees',
    description: 'View date of birth, address, emergency contact and ID documents',
  },
  'employee.create': { module: 'employees', description: 'Add employees' },
  'employee.update': { module: 'employees', description: 'Edit employee records' },
  'employee.delete': { module: 'employees', description: 'Delete employees' },

  'department.view': { module: 'departments', description: 'View departments' },
  'department.create': { module: 'departments', description: 'Create departments' },
  'department.update': { module: 'departments', description: 'Edit departments' },
  'department.delete': { module: 'departments', description: 'Delete departments' },

  'position.view': { module: 'positions', description: 'View positions' },
  'position.manage': { module: 'positions', description: 'Create, edit and delete positions' },

  'attendance.view': { module: 'attendance', description: 'View attendance records' },
  'attendance.manage': { module: 'attendance', description: 'Correct attendance records' },
  'attendance.self': { module: 'attendance', description: 'Check in and out for yourself' },

  'leave.view': { module: 'leave', description: 'View leave requests and balances' },
  'leave.create': { module: 'leave', description: 'Request leave' },
  'leave.approve': { module: 'leave', description: 'Approve leave requests' },
  'leave.reject': { module: 'leave', description: 'Reject leave requests' },
  'leave.manage_types': { module: 'leave', description: 'Manage leave types' },
  'leave.manage_balances': { module: 'leave', description: 'Adjust leave balances' },

  'document.view': { module: 'documents', description: 'View employee documents' },
  'document.upload': { module: 'documents', description: 'Upload documents' },
  'document.delete': { module: 'documents', description: 'Delete documents' },
  'document.manage_types': { module: 'documents', description: 'Manage document types' },

  'team_profile.view': {
    module: 'team_profile',
    description: 'Look up a colleague by name, email or employee ID and open their card',
  },
  'team_profile.browse': {
    module: 'team_profile',
    description: 'Browse and filter the whole staff directory, not only look people up',
  },
  'team_profile.manage_own': {
    module: 'team_profile',
    description: 'Edit your own card: photo, business phone, blood group and links',
  },

  'payroll.view': { module: 'payroll', description: 'View payroll records' },
  'payroll.manage': { module: 'payroll', description: 'Process payroll and generate payslips' },

  'notification.view': { module: 'notifications', description: 'Receive notifications' },

  'report.view': { module: 'reports', description: 'View reports' },
  'report.export': { module: 'reports', description: 'Export reports' },

  'user.view': { module: 'administration', description: 'View user accounts' },
  'user.manage': { module: 'administration', description: 'Create and change user accounts' },
  'role.manage': { module: 'administration', description: 'Change role permissions' },
  'audit.view': { module: 'administration', description: 'View the audit log' },
  'settings.manage': { module: 'administration', description: 'Change organization settings' },
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as PermissionKey[];

export const SYSTEM_ROLES = {
  super_admin: { name: 'Super Admin', description: 'Full access, including roles and security settings' },
  admin: { name: 'Admin', description: 'Administrative access across organizational units' },
  hr_admin: { name: 'HR / Admin', description: 'Runs day-to-day HR for the whole organization' },
  manager: { name: 'Manager', description: 'Sees and approves for their direct reports' },
  employee: { name: 'Employee', description: 'Sees their own records' },
} as const;

export type SystemRoleKey = keyof typeof SYSTEM_ROLES;
export type PermissionMap = Partial<Record<PermissionKey, PermissionScope>>;

const allOf = (keys: PermissionKey[]): PermissionMap =>
  Object.fromEntries(keys.map((key) => [key, 'ALL'])) as PermissionMap;

export const DEFAULT_ROLE_GRANTS: Record<SystemRoleKey, PermissionMap> = {
  super_admin: allOf(PERMISSION_KEYS),
  admin: allOf(PERMISSION_KEYS.filter((k) => k !== 'role.manage')),
  hr_admin: allOf(PERMISSION_KEYS.filter((key) => key !== 'user.manage' && key !== 'role.manage')),
  manager: {
    'team_profile.view': 'ALL',
    'team_profile.browse': 'ALL',
    'team_profile.manage_own': 'ALL',
    'employee.view': 'TEAM',
    'department.view': 'ALL',
    'position.view': 'ALL',
    'attendance.view': 'TEAM',
    'attendance.self': 'ALL',
    'leave.view': 'TEAM',
    'leave.create': 'ALL',
    'leave.approve': 'TEAM',
    'leave.reject': 'TEAM',
    'document.view': 'TEAM',
    'notification.view': 'ALL',
    'report.view': 'TEAM',
    'report.export': 'TEAM',
  },
  employee: {
    'team_profile.view': 'ALL',
    'team_profile.browse': 'ALL',
    'team_profile.manage_own': 'ALL',
    'employee.view': 'OWN',
    'employee.view_private': 'OWN',
    'department.view': 'ALL',
    'position.view': 'ALL',
    'attendance.view': 'OWN',
    'attendance.self': 'ALL',
    'leave.view': 'OWN',
    'leave.create': 'ALL',
    'document.view': 'OWN',
    'document.upload': 'OWN',
    'notification.view': 'ALL',
  },
};

const SCOPE_RANK: Record<PermissionScope, number> = { OWN: 1, TEAM: 2, ALL: 3 };

export function can(map: PermissionMap | null | undefined, key: PermissionKey, atLeast: PermissionScope = 'OWN'): boolean {
  if (!map) return false;
  const granted = map[key];
  return granted !== undefined && SCOPE_RANK[granted] >= SCOPE_RANK[atLeast];
}

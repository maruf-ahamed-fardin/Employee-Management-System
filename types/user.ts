export type RoleKey = 'superadmin' | 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  email: string;
  role: RoleKey;
  employeeId?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  lastLoginAt?: string | null;
  employeeName?: string | null;
  employeeCode?: string | null;
  departmentName?: string | null;
  photoUrl?: string | null;
}

export interface SessionUser extends User {
  permissions: string[];
}

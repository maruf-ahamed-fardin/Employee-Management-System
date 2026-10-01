import {
  LayoutDashboard,
  Users,
  Contact,
  Building2,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  FileBarChart,
  UserCog,
  Settings,
  ShieldCheck,
  KeyRound,
  Bell,
  Receipt,
  Laptop,
  LucideIcon,
} from 'lucide-react';

export type NavSection = 'Workspace' | 'Finance & Operations' | 'Organization' | 'Administration';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles?: string[]; // Allowed roles: superadmin, admin, manager, employee, hr_admin, super_admin
  section: NavSection;
}

export const navigationConfig: NavItem[] = [
  // ─── Workspace ─────────────────────────────────────────────────────────────
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    section: 'Workspace',
  },
  {
    title: 'Employees',
    href: '/employees',
    icon: Users,
    section: 'Workspace',
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: CalendarCheck,
    section: 'Workspace',
  },
  {
    title: 'Leave Management',
    href: '/leave',
    icon: CalendarDays,
    section: 'Workspace',
  },

  // ─── Finance & Operations ──────────────────────────────────────────────────
  {
    title: 'Payroll',
    href: '/payroll',
    icon: CreditCard,
    roles: ['superadmin', 'admin', 'manager', 'super_admin'],
    section: 'Finance & Operations',
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: Receipt,
    section: 'Finance & Operations',
  },
  {
    title: 'Assets & Hardware',
    href: '/assets',
    icon: Laptop,
    section: 'Finance & Operations',
  },

  // ─── Organization & Directory ──────────────────────────────────────────────
  {
    title: 'Team Directory',
    href: '/team-profile',
    icon: Contact,
    section: 'Organization',
  },
  {
    title: 'Departments',
    href: '/departments',
    icon: Building2,
    roles: ['superadmin', 'admin', 'manager', 'super_admin', 'hr_admin'],
    section: 'Organization',
  },
  {
    title: 'Positions',
    href: '/positions',
    icon: Briefcase,
    roles: ['superadmin', 'admin', 'super_admin'],
    section: 'Organization',
  },

  // ─── Administration & Security ─────────────────────────────────────────────
  {
    title: 'Reports',
    href: '/reports',
    icon: FileBarChart,
    roles: ['superadmin', 'admin', 'manager', 'super_admin', 'hr_admin'],
    section: 'Administration',
  },
  {
    title: 'Audit Logs',
    href: '/audit-logs',
    icon: ShieldCheck,
    roles: ['superadmin', 'admin', 'super_admin'],
    section: 'Administration',
  },
  {
    title: 'Roles & Permissions',
    href: '/roles',
    icon: KeyRound,
    roles: ['superadmin', 'admin', 'super_admin'],
    section: 'Administration',
  },
  {
    title: 'User Management',
    href: '/users',
    icon: UserCog,
    roles: ['superadmin', 'admin', 'super_admin'],
    section: 'Administration',
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    section: 'Administration',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['superadmin', 'admin', 'super_admin'],
    section: 'Administration',
  },
];

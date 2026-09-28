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
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles?: string[]; // Allowed roles: superadmin, admin, manager, employee, hr_admin, super_admin
}

export const navigationConfig: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Team Profile',
    href: '/team-profile',
    icon: Contact,
    badge: 'NFC',
  },
  {
    title: 'Employees',
    href: '/employees',
    icon: Users,
  },
  {
    title: 'Departments',
    href: '/departments',
    icon: Building2,
    roles: ['superadmin', 'admin', 'manager', 'super_admin', 'hr_admin'],
  },
  {
    title: 'Positions',
    href: '/positions',
    icon: Briefcase,
    roles: ['superadmin', 'admin', 'super_admin'],
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: CalendarCheck,
  },
  {
    title: 'Leave Management',
    href: '/leave',
    icon: CalendarDays,
  },
  {
    title: 'Payroll',
    href: '/payroll',
    icon: CreditCard,
    roles: ['superadmin', 'admin', 'manager', 'super_admin'],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileBarChart,
    roles: ['superadmin', 'admin', 'manager', 'super_admin', 'hr_admin'],
  },
  {
    title: 'Audit Logs',
    href: '/audit-logs',
    icon: ShieldCheck,
    roles: ['superadmin', 'admin', 'super_admin'],
  },
  {
    title: 'Roles & Permissions',
    href: '/roles',
    icon: KeyRound,
    roles: ['superadmin', 'admin', 'super_admin'],
  },
  {
    title: 'User Management',
    href: '/users',
    icon: UserCog,
    roles: ['superadmin', 'admin', 'super_admin'],
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['superadmin', 'admin', 'super_admin'],
  },
];

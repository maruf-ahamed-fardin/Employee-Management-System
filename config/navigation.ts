import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  FileBarChart,
  UserCog,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles?: string[]; // Allowed roles: superadmin, admin, manager, employee
}

export const navigationConfig: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
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
    roles: ['superadmin', 'admin', 'manager'],
  },
  {
    title: 'Positions',
    href: '/positions',
    icon: Briefcase,
    roles: ['superadmin', 'admin'],
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: CalendarCheck,
  },
  {
    title: 'Leave Requests',
    href: '/leave',
    icon: CalendarDays,
  },
  {
    title: 'Payroll',
    href: '/payroll',
    icon: CreditCard,
    roles: ['superadmin', 'admin', 'manager'],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileBarChart,
    roles: ['superadmin', 'admin', 'manager'],
  },
  {
    title: 'User Management',
    href: '/users',
    icon: UserCog,
    roles: ['superadmin', 'admin'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['superadmin', 'admin'],
  },
];

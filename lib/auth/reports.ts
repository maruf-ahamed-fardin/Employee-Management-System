// Mirrors the roles allowed to see "Reports" in config/navigation.ts.
// Exporting raw rows is limited to admins (the roles that hold report.export).
const REPORT_VIEW_ROLES = ['superadmin', 'super_admin', 'admin', 'hr_admin', 'manager'];
const REPORT_EXPORT_ROLES = ['superadmin', 'super_admin', 'admin', 'hr_admin'];

export function canViewReports(role?: string | null): boolean {
  return !!role && REPORT_VIEW_ROLES.includes(role);
}

export function canExportReports(role?: string | null): boolean {
  return !!role && REPORT_EXPORT_ROLES.includes(role);
}

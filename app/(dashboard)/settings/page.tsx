import { ShieldAlert } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { canManageSettings } from '@/lib/auth/settings';
import { SESSION_MAX_AGE_SECONDS } from '@/lib/auth/session-token';
import { getAttendanceSettings, getOrganizationProfile } from '@/lib/settings';
import { SettingsClient, type SettingsTab } from '@/components/settings/SettingsClient';

export const metadata = {
  title: 'Organization Settings',
  description: 'Manage attendance policies, public holidays, and workspace parameters.',
};

const TABS: SettingsTab[] = ['organization', 'attendance', 'holidays', 'administration', 'system'];
// Ships as the fallback in next.config.ts and .env.example, so it is public knowledge
const SAMPLE_AUTH_SECRET = 'selorax-super-secret-key-32-chars-long!';

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [{ tab }, session] = await Promise.all([searchParams, getSession()]);

  if (!canManageSettings(session?.role)) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ShieldAlert className="size-5" />
        </div>
        <p className="text-sm font-semibold text-foreground">You don&apos;t have access to settings</p>
        <p className="text-xs text-muted-foreground">Only administrators can change organization settings.</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  const [organization, attendance, holidays, users, roles, departments, positions, leaveTypes, documentTypes, employees, documents, auditLogs] =
    await Promise.all([
      getOrganizationProfile(),
      getAttendanceSettings(),
      prisma.holiday.findMany({ where: { date: { startsWith: String(currentYear) } }, orderBy: { date: 'asc' } }),
      prisma.user.count(),
      prisma.role.count(),
      prisma.department.count({ where: { isActive: true, deletedAt: null } }),
      prisma.position.count({ where: { isActive: true, deletedAt: null } }),
      prisma.leaveType.count({ where: { deletedAt: null } }),
      prisma.documentType.count({ where: { deletedAt: null } }),
      prisma.employee.count({ where: { deletedAt: null } }),
      prisma.document.aggregate({ where: { deletedAt: null }, _count: true, _sum: { sizeBytes: true } }),
      prisma.auditLog.count(),
    ]);

  return (
    <SettingsClient
      initialTab={TABS.includes(tab as SettingsTab) ? (tab as SettingsTab) : 'organization'}
      initialOrganization={organization}
      initialAttendance={attendance}
      initialHolidays={holidays.map((h) => ({ id: h.id, date: h.date, name: h.name }))}
      initialYear={currentYear}
      counts={{ users, roles, departments, positions, leaveTypes, documentTypes, auditLogs }}
      system={{
        employees,
        users,
        documents: documents._count,
        documentBytes: documents._sum.sizeBytes || 0,
        auditLogs,
        sessionDays: Math.round(SESSION_MAX_AGE_SECONDS / 86400),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        usingSampleSecret: process.env.AUTH_SECRET === SAMPLE_AUTH_SECRET,
      }}
    />
  );
}

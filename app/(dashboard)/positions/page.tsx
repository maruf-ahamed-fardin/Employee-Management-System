import { Briefcase } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { canManagePositions } from '@/lib/auth/positions';
import { PositionsClient } from './PositionsClient';

export const metadata = {
  title: 'Job Positions',
};

export default async function PositionsPage() {
  const [session, positions, departments] = await Promise.all([
    getSession(),
    prisma.position.findMany({
      where: { deletedAt: null },
      include: {
        department: true,
        _count: { select: { employees: true } },
      },
      orderBy: { title: 'asc' },
    }),
    prisma.department.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Hero header */}
      <div className="relative isolate rounded-3xl border bg-card shadow-[var(--shadow-card)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute inset-x-0 top-0 h-1" style={{ background: 'var(--brand-gradient)' }} />
          <div className="absolute -right-20 -top-28 size-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 size-64 rounded-full bg-brand-orange/10 blur-3xl" />
        </div>

        <div className="p-5 sm:p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-blue">
            <Briefcase className="size-3" />
            Organization structure
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">Job Positions &amp; Designations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Roles, standard base salaries and seniority levels across the company.</p>
        </div>
      </div>

      <PositionsClient
        initialPositions={positions as any}
        departments={departments}
        canManage={canManagePositions(session?.role)}
      />
    </div>
  );
}

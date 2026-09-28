import { prisma } from '@/lib/db';
import { PositionsClient } from './PositionsClient';

export const metadata = {
  title: 'Job Positions',
};

export default async function PositionsPage() {
  const [positions, departments] = await Promise.all([
    prisma.position.findMany({
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Job Positions & Designations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage roles, standard base salaries, and corporate hierarchy levels
        </p>
      </div>

      <PositionsClient initialPositions={positions as any} departments={departments} />
    </div>
  );
}

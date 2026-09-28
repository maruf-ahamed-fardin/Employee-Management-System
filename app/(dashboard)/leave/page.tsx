import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { LeaveClient } from './LeaveClient';

export const metadata = {
  title: 'Leave Requests & Balances',
};

export default async function LeavePage() {
  const session = await getSession();
  const currentYear = new Date().getFullYear();

  const [leaveTypes, balances, requests] = await Promise.all([
    prisma.leaveType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
    session?.employeeId
      ? prisma.leaveBalance.findMany({
          where: { employeeId: session.employeeId, year: currentYear },
          include: { leaveType: true },
        })
      : [],
    prisma.leaveRequest.findMany({
      include: {
        employee: {
          include: { department: true, position: true },
        },
        leaveType: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const formattedBalances = balances.map((b) => ({
    id: b.id,
    leaveTypeName: b.leaveType.name,
    allocated: b.allocated,
    used: b.used,
    available: Math.max(0, b.allocated - b.used - b.pending),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Leave Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Apply for time off, track annual/sick quotas, and review departmental requests
        </p>
      </div>

      <LeaveClient
        initialBalances={formattedBalances}
        initialRequests={requests as any}
        leaveTypes={leaveTypes}
        userRole={session?.role || 'employee'}
      />
    </div>
  );
}

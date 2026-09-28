import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { LeaveRequestsClient, LeaveRequestRow } from '@/components/leave/LeaveRequestsClient';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Leave Approval Queue - SeloraX EMS',
  description: 'Manager and HR decision queue for employee leave requests.',
};

export default async function LeaveRequestsPage() {
  const requests = await prisma.leaveRequest.findMany({
    include: {
      employee: {
        include: {
          department: true,
        },
      },
      leaveType: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatted: LeaveRequestRow[] = requests.map((r) => ({
    id: r.id,
    employeeId: r.employeeId,
    employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
    department: r.employee.department?.name || 'General',
    leaveType: r.leaveType.name,
    startDate: r.startDate,
    endDate: r.endDate,
    days: r.days,
    reason: r.reason,
    status: r.status as any,
    reviewNote: r.reviewNote,
    reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2">
            <Link
              href="/leave"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Leave Dashboard</span>
            </Link>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Leave Requests Approval Queue
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review, approve, or reject employee leave applications across departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="text-xs font-semibold">
            <Link href="/leave/types">Configure Policies</Link>
          </Button>
        </div>
      </div>

      <LeaveRequestsClient initialRequests={formatted} />
    </div>
  );
}

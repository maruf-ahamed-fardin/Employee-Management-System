import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ArrowLeft, Plus, Check, X, Shield, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Leave Policies & Types - SeloraX EMS',
  description: 'Configure organization-wide leave policies, annual allowances, and carryover rules.',
};

export default async function LeaveTypesPage() {
  const types = await prisma.leaveType.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: { requests: true, balances: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="mb-2">
            <Link
              href="/leave"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Leave Dashboard</span>
            </Link>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Leave Policies & Entitlements
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure available leave categories, annual day allocations, document requirements, and carryover caps.
          </p>
        </div>

        <Button asChild variant="default" size="sm" className="bg-primary text-primary-foreground font-bold">
          <Link href="/leave/requests">Go to Approval Queue</Link>
        </Button>
      </div>

      {/* Types Table Card */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
        <div className="border-b border-border/60 bg-muted/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            <h2 className="font-bold text-sm text-foreground">Standard Company Leave Quotas</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{types.length} active policies</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 pl-6 pr-4">Leave Category</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Per Year Quota</th>
                <th className="py-3.5 px-4">Compensation</th>
                <th className="py-3.5 px-4">Max Carryover</th>
                <th className="py-3.5 px-4">Documentation</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Total Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {types.map((type) => (
                <tr key={type.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 pl-6 pr-4">
                    <p className="font-bold text-sm text-foreground">{type.name}</p>
                    <p className="text-[11px] text-muted-foreground">Default allocation for all full-time staff</p>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-primary">{type.code}</td>
                  <td className="py-4 px-4 font-bold text-foreground tabular">
                    {type.defaultDaysPerYear || type.defaultDays} days
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        type.isPaid
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {type.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-muted-foreground tabular">
                    {type.carryForwardMax > 0 ? `Up to ${type.carryForwardMax} days` : 'None'}
                  </td>
                  <td className="py-4 px-4">
                    {type.requiresDocument ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <Check className="size-3.5" /> Required
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not required</span>
                    )}
                  </td>
                  <td className="py-4 pr-6 pl-4 text-right font-bold tabular text-foreground">
                    {type._count.requests}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ArrowLeft, Lock, FileText, Check, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Document Types & Compliance - SeloraX EMS',
  description: 'Manage valid document classifications, sensitive privacy restrictions, and expiration alerts.',
};

export default async function DocumentTypesPage() {
  const types = await prisma.documentType.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: { documents: true },
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
              href="/employees"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Employees</span>
            </Link>
          </nav>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Document Classifications & Policies
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure compliance documents, privacy flags (hidden from general managers), and expiration tracking.
          </p>
        </div>
      </div>

      {/* Document Types Table */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
        <div className="border-b border-border/60 bg-muted/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h2 className="font-bold text-sm text-foreground">Active Document Categories</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{types.length} types</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 pl-6 pr-4">Type Name</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Confidentiality</th>
                <th className="py-3.5 px-4">Expiration Tracking</th>
                <th className="py-3.5 pr-6 pl-4 text-right">Documents Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {types.map((type) => (
                <tr key={type.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 pl-6 pr-4">
                    <p className="font-bold text-sm text-foreground">{type.name}</p>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-primary">{type.code}</td>
                  <td className="py-4 px-4">
                    {type.isSensitive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 px-2.5 py-0.5 text-xs font-bold">
                        <Lock className="size-3" />
                        <span>Confidential (HR Only)</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Standard (Team Visible)</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {type.hasExpiry ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                        <Check className="size-3.5" /> Tracked with 30-day alerts
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">No Expiration Date</span>
                    )}
                  </td>
                  <td className="py-4 pr-6 pl-4 text-right font-bold tabular text-foreground">
                    {type._count.documents}
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

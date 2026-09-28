import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  User,
  Clock,
  Globe,
  Monitor,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Audit Log Event Diff - SeloraX EMS',
};

export default async function AuditLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const log = await prisma.auditLog.findUnique({
    where: { id },
    include: {
      actor: {
        include: {
          employee: true,
        },
      },
    },
  });

  if (!log) {
    notFound();
  }

  let beforeObj: Record<string, any> | null = null;
  let afterObj: Record<string, any> | null = null;
  try {
    if (log.before) beforeObj = JSON.parse(log.before);
  } catch {}
  try {
    if (log.after) afterObj = JSON.parse(log.after);
  } catch {}

  const actorName = log.actor?.employee
    ? `${log.actor.employee.firstName} ${log.actor.employee.lastName}`
    : log.actor?.email || 'System';

  // Compute all keys that were compared
  const allKeys = Array.from(
    new Set([
      ...(beforeObj ? Object.keys(beforeObj) : []),
      ...(afterObj ? Object.keys(afterObj) : []),
    ])
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/audit-logs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Audit Logs</span>
        </Link>
      </nav>

      {/* Header Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-sm font-mono font-bold text-primary">
                {log.action}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold uppercase text-muted-foreground">
                {log.entityType}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground font-mono">
              Entity ID: {log.entityId || 'N/A'}
            </p>
          </div>

          <div className="text-right sm:text-right">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="size-3.5" />
              {log.createdAt.toUTCString()}
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 justify-end">
              <ShieldCheck className="size-4" />
              <span>Verified Audit Record</span>
            </div>
          </div>
        </div>

        {/* Actor & Device Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
          <div className="flex items-start gap-2.5">
            <User className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">{actorName}</p>
              <p className="text-muted-foreground">{log.actor?.email || 'Internal System User'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Globe className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">IP Address</p>
              <p className="font-mono text-muted-foreground">{log.ip || '127.0.0.1 (Internal)'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Monitor className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">User Agent</p>
              <p className="truncate text-muted-foreground max-w-[200px]" title={log.userAgent || ''}>
                {log.userAgent || 'Server Process'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Field-by-Field Diff Comparison */}
      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border/60 bg-muted/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <h2 className="font-bold text-sm text-foreground">State Mutation Diff</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {allKeys.length} {allKeys.length === 1 ? 'property' : 'properties'} evaluated
          </span>
        </div>

        {allKeys.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No object properties to compare for this event.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {allKeys.map((key) => {
              const beforeVal = beforeObj ? beforeObj[key] : undefined;
              const afterVal = afterObj ? afterObj[key] : undefined;
              const isChanged = JSON.stringify(beforeVal) !== JSON.stringify(afterVal);

              return (
                <div
                  key={key}
                  className={`p-4 sm:px-6 grid grid-cols-1 md:grid-cols-[180px_1fr_auto_1fr] items-center gap-3 transition-colors ${
                    isChanged ? 'bg-amber-500/5 dark:bg-amber-500/10' : ''
                  }`}
                >
                  <div className="font-mono text-xs font-bold text-foreground">
                    {key}
                    {isChanged && (
                      <span className="ml-1.5 inline-block size-1.5 rounded-full bg-[#F37021]" />
                    )}
                  </div>

                  {/* Before */}
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 font-mono text-xs text-rose-700 dark:text-rose-300 overflow-x-auto">
                    {beforeVal !== undefined ? (
                      typeof beforeVal === 'object' ? (
                        JSON.stringify(beforeVal)
                      ) : (
                        String(beforeVal)
                      )
                    ) : (
                      <span className="text-muted-foreground italic">(none)</span>
                    )}
                  </div>

                  <ArrowRight className="hidden md:block size-4 text-muted-foreground mx-auto" />

                  {/* After */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 font-mono text-xs text-emerald-700 dark:text-emerald-300 overflow-x-auto">
                    {afterVal !== undefined ? (
                      typeof afterVal === 'object' ? (
                        JSON.stringify(afterVal)
                      ) : (
                        String(afterVal)
                      )
                    ) : (
                      <span className="text-muted-foreground italic">(removed)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Raw JSON Payloads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Raw Before Snapshot</p>
          <pre className="p-3 rounded-xl bg-muted/60 text-[11px] font-mono overflow-x-auto text-muted-foreground max-h-60">
            {JSON.stringify(beforeObj, null, 2) || '// null (creation event)'}
          </pre>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2">
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Raw After Snapshot</p>
          <pre className="p-3 rounded-xl bg-muted/60 text-[11px] font-mono overflow-x-auto text-muted-foreground max-h-60">
            {JSON.stringify(afterObj, null, 2) || '// null (deletion event)'}
          </pre>
        </div>
      </div>
    </div>
  );
}

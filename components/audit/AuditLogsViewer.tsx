'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ScrollText,
  Search,
  Filter,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  Globe,
  Layers,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface AuditItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actor: {
    id: string | null;
    name: string;
    email?: string | null;
  };
  changedFields: string[];
  before: any;
  after: any;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

const ENTITY_BADGES: Record<string, string> = {
  employee: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  leave: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  department: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  role: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  user: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
};

function formatAction(action: string): string {
  const parts = action.split('.');
  if (parts.length === 2) {
    return `${parts[1].toUpperCase()} ${parts[0].toUpperCase()}`;
  }
  return action.toUpperCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function AuditLogsViewer({ initialLogs }: { initialLogs: AuditItem[] }) {
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      if (entityFilter !== 'ALL' && log.entityType.toLowerCase() !== entityFilter.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchAction = log.action.toLowerCase().includes(q);
        const matchActor = log.actor.name.toLowerCase().includes(q);
        const matchEntity = log.entityType.toLowerCase().includes(q);
        const matchIp = log.ip?.toLowerCase().includes(q);
        const matchField = log.changedFields.some((f) => f.toLowerCase().includes(q));
        if (!matchAction && !matchActor && !matchEntity && !matchIp && !matchField) {
          return false;
        }
      }
      return true;
    });
  }, [initialLogs, search, entityFilter]);

  const entities = ['ALL', 'employee', 'leave', 'department', 'role', 'user'];

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail by actor, action verb, or changed field name..."
              className="pl-9 h-10.5 text-sm bg-background border-border/90"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {entities.map((ent) => (
              <button
                key={ent}
                onClick={() => setEntityFilter(ent)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  entityFilter === ent
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {ent === 'ALL' ? 'All Entities' : ent.charAt(0).toUpperCase() + ent.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs">
        <div className="border-b border-border/60 bg-muted/40 px-5 py-3 flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span>Immutable Audit Trail ({filteredLogs.length} events)</span>
          </div>
          <span>Chronological (Latest First)</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <ScrollText className="size-10 text-muted-foreground mx-auto mb-2 opacity-60" />
            <h4 className="text-sm font-bold text-foreground">No audit entries found</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search terms or clearing the entity filter.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {filteredLogs.map((log) => {
              const badgeClass =
                ENTITY_BADGES[log.entityType.toLowerCase()] ||
                'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';

              return (
                <li
                  key={log.id}
                  className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:px-6 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground font-bold text-xs">
                      {log.actor.name.charAt(0).toUpperCase()}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{log.actor.name}</span>
                        <span className="text-xs text-muted-foreground font-medium">performed</span>
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-mono font-bold text-primary">
                          {log.action}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.2 text-[11px] font-semibold ${badgeClass}`}
                        >
                          {log.entityType}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          <time>{formatDate(log.createdAt)}</time>
                        </span>
                        {log.ip && (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                            <Globe className="size-3 text-muted-foreground" />
                            {log.ip}
                          </span>
                        )}
                        {log.changedFields.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                            <Layers className="size-3" />
                            {log.changedFields.length}{' '}
                            {log.changedFields.length === 1 ? 'field modified' : 'fields modified'}:{' '}
                            <span className="font-mono text-[11px] underline">
                              {log.changedFields.slice(0, 3).join(', ')}
                              {log.changedFields.length > 3 ? '...' : ''}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/audit-logs/${log.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group-hover:translate-x-1 duration-150 shrink-0 self-end sm:self-auto"
                  >
                    <span>View Diff</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

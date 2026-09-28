'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, RotateCcw, Save, Shield, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface PermissionCatalogueItem {
  id: string;
  key: string;
  module: string;
  description: string;
}

export interface RoleModelItem {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: Record<string, string>;
  editable: boolean;
}

const SCOPES = [
  { value: 'NONE', label: 'No Access', desc: 'Forbidden' },
  { value: 'OWN', label: 'Own', desc: 'Own record only' },
  { value: 'TEAM', label: 'Team', desc: 'Direct reports' },
  { value: 'ALL', label: 'Everyone', desc: 'Whole organization' },
];

export function RoleEditor({
  role,
  catalogue,
}: {
  role: RoleModelItem;
  catalogue: PermissionCatalogueItem[];
}) {
  const router = useRouter();
  const [grants, setGrants] = useState<Record<string, string>>({ ...role.permissions });
  const [saving, setSaving] = useState(false);

  // Group by module
  const modules = useMemo(() => {
    const map = new Map<string, PermissionCatalogueItem[]>();
    for (const p of catalogue) {
      const list = map.get(p.module) || [];
      list.push(p);
      map.set(p.module, list);
    }
    return Array.from(map.entries());
  }, [catalogue]);

  // Changed keys
  const changed = useMemo(() => {
    const keys = new Set([...Object.keys(role.permissions), ...Object.keys(grants)]);
    const diffs: string[] = [];
    for (const k of keys) {
      const orig = role.permissions[k] || 'NONE';
      const cur = grants[k] || 'NONE';
      if (orig !== cur) diffs.push(k);
    }
    return diffs;
  }, [role.permissions, grants]);

  const handleScopeChange = (key: string, scope: string) => {
    if (!role.editable) return;
    setGrants((prev) => {
      const next = { ...prev };
      if (scope === 'NONE') {
        delete next[key];
      } else {
        next[key] = scope;
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/roles/${role.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: grants }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update permissions');
      }

      toast.success(`${role.name}: ${changed.length} permissions updated.`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Could not save permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setGrants({ ...role.permissions });
  };

  return (
    <div className="space-y-6">
      {!role.editable && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-accent/60 p-4 text-xs text-foreground">
          <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Lock className="size-4" />
          </div>
          <div>
            <p className="font-bold text-foreground">Super Admin Full System Privileges</p>
            <p className="text-muted-foreground mt-0.5">
              Super Admin always holds every permission organization-wide so administrative control is never lost.
            </p>
          </div>
        </div>
      )}

      {modules.map(([moduleName, perms]) => (
        <section
          key={moduleName}
          className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs"
        >
          <div className="border-b border-border/60 bg-muted/40 px-5 py-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              {moduleName.replaceAll('_', ' ')}
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              {perms.length} actions
            </span>
          </div>

          <div className="divide-y divide-border/60">
            {perms.map((p) => {
              const currentScope = grants[p.key] || 'NONE';
              const isEdited = changed.includes(p.key);

              return (
                <div
                  key={p.key}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:px-5 transition-colors ${
                    isEdited ? 'bg-amber-500/10' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span>{p.description}</span>
                      {isEdited && (
                        <span className="size-1.5 rounded-full bg-[#F37021]" title="Modified" />
                      )}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">{p.key}</p>
                  </div>

                  <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-xl border border-border/60 shrink-0">
                    {SCOPES.map((s) => {
                      const selected = currentScope === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          disabled={!role.editable || saving}
                          onClick={() => handleScopeChange(p.key, s.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            selected
                              ? s.value === 'NONE'
                                ? 'bg-muted-foreground/20 text-foreground shadow-xs'
                                : 'bg-primary text-primary-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/90'
                          } ${!role.editable ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={s.desc}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {role.editable && (
        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl border border-border/90 bg-card/95 p-3.5 shadow-xl backdrop-blur">
          <div className="text-xs">
            {changed.length === 0 ? (
              <span className="text-muted-foreground">All permissions up to date</span>
            ) : (
              <span className="font-bold text-[#F37021]">
                {changed.length} {changed.length === 1 ? 'change' : 'changes'} not saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={saving || changed.length === 0}
              className="text-xs font-semibold"
            >
              <RotateCcw className="size-3.5 mr-1" />
              Undo
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || changed.length === 0}
              className="text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="size-3.5 mr-1" />
              Save {role.name}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

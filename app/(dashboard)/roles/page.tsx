import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { RoleEditor } from '@/components/roles/RoleEditor';
import { Shield, KeyRound, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Roles & Permissions - SeloraX EMS',
  description: 'Manage roles and configure granular permission scopes across all organizational modules.',
};

export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: requestedRoleKey } = await searchParams;

  const [rolesData, catalogueData] = await Promise.all([
    prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { key: 'asc' }],
    }),
  ]);

  const roles = rolesData.map((role) => {
    const permMap: Record<string, string> = {};
    for (const rp of role.permissions) {
      permMap[rp.permission.key] = rp.scope;
    }
    return {
      id: role.id,
      key: role.key,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      userCount: role._count.users,
      permissions: permMap,
      editable: role.key !== 'super_admin',
    };
  });

  const activeRole =
    roles.find((r) => r.key === requestedRoleKey) ||
    roles.find((r) => r.editable) ||
    roles[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Roles & Access Permissions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define access levels across the platform. Scopes control data visibility: <strong>Own</strong> (individual), <strong>Team</strong> (manager’s direct reports), or <strong>Everyone</strong> (organization-wide).
        </p>
      </div>

      {/* Role Navigation Tabs */}
      <nav aria-label="Roles" className="flex items-center gap-2 overflow-x-auto pb-1">
        {roles.map((r) => {
          const isSelected = r.id === activeRole?.id;
          return (
            <Link
              key={r.id}
              href={`/roles?role=${r.key}`}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'bg-card text-muted-foreground border border-border hover:bg-secondary hover:text-foreground'
              }`}
            >
              <span>{r.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {r.userCount} {r.userCount === 1 ? 'user' : 'users'}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Selected Role Meta */}
      {activeRole && (
        <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <KeyRound className="size-4 text-primary" />
              <span>{activeRole.name}</span>
              <span className="font-mono text-xs font-normal text-muted-foreground">
                ({activeRole.key})
              </span>
            </h2>
            {activeRole.description && (
              <p className="text-xs text-muted-foreground">{activeRole.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-4 text-primary" />
            <span className="font-semibold text-foreground">{activeRole.userCount}</span>
            <span>active members assigned</span>
          </div>
        </div>
      )}

      {/* Matrix Editor */}
      {activeRole && (
        <RoleEditor key={activeRole.id} role={activeRole} catalogue={catalogueData} />
      )}
    </div>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Users,
  Briefcase,
  UserCheck,
  Mail,
  Phone,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const dept = await prisma.department.findFirst({
    where: { OR: [{ id }, { code: id }], deletedAt: null },
  });
  if (!dept) return { title: 'Department Not Found - SeloraX' };
  return {
    title: `${dept.name} (${dept.code}) - Department Overview | SeloraX EMS`,
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.charAt(0) ?? ''}${parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? '' : ''}`.toUpperCase();
}

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dept = await prisma.department.findFirst({
    where: {
      OR: [{ id }, { code: id }],
      deletedAt: null,
    },
    include: {
      head: {
        include: { position: true },
      },
      positions: {
        where: { deletedAt: null },
        include: {
          _count: {
            select: { employees: true },
          },
        },
      },
      employees: {
        where: { deletedAt: null },
        include: {
          position: true,
        },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      },
    },
  });

  if (!dept) {
    notFound();
  }

  const activeEmployees = dept.employees.filter((e) => e.status === 'ACTIVE');
  const inactiveEmployees = dept.employees.filter((e) => e.status !== 'ACTIVE');

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/departments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Departments</span>
        </Link>
      </nav>

      {/* Department Summary Header Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {dept.name}
              </h1>
              <span className="rounded-md bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
                {dept.code}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  dept.isActive
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {dept.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {dept.description && (
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                {dept.description}
              </p>
            )}
          </div>

          <Button asChild variant="outline" size="sm" className="font-semibold text-xs shrink-0">
            <Link href={`/employees?departmentId=${dept.id}`}>
              <Users className="size-3.5 mr-1 text-primary" />
              <span>Filter All Staff</span>
            </Link>
          </Button>
        </div>

        {/* Stats & Department Head Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-border/60 pt-5">
          <div className="flex items-center gap-3">
            <span className="size-11 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
              <Users className="size-5 text-primary" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Active Staff</p>
              <p className="text-xl font-extrabold text-foreground tabular">{activeEmployees.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="size-11 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
              <Briefcase className="size-5 text-[#F37021]" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Job Positions</p>
              <p className="text-xl font-extrabold text-foreground tabular">{dept.positions.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="size-11 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shrink-0">
              <Layers className="size-5 text-purple-600" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Inactive / On Leave</p>
              <p className="text-xl font-extrabold text-foreground tabular">{inactiveEmployees.length}</p>
            </div>
          </div>

          {/* Department Head */}
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-secondary/30 border border-border/60">
            {dept.head ? (
              <>
                <Avatar className="size-10 ring-2 ring-primary/20 shrink-0">
                  {dept.head.photoUrl && <AvatarImage src={dept.head.photoUrl} />}
                  <AvatarFallback className="bg-[#252175] text-[#F37021] font-bold text-xs">
                    {getInitials(`${dept.head.firstName} ${dept.head.lastName}`)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Department Head
                  </p>
                  <Link
                    href={`/team-profile/${dept.head.id}`}
                    className="block truncate text-xs font-bold text-foreground hover:text-primary hover:underline"
                  >
                    {dept.head.firstName} {dept.head.lastName}
                  </Link>
                </div>
              </>
            ) : (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Department Head
                </p>
                <p className="text-xs font-semibold text-muted-foreground italic">Not assigned</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Positions in Department */}
      <section className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
        <div className="border-b border-border/60 bg-muted/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 text-primary" />
            <h2 className="font-bold text-sm text-foreground">Positions & Job Titles</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{dept.positions.length} titles</span>
        </div>

        {dept.positions.length === 0 ? (
          <p className="p-8 text-center text-xs text-muted-foreground">No positions assigned to this department yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 pl-6 pr-4">Job Title</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Base Salary</th>
                  <th className="py-3 pr-6 pl-4 text-right">Active Holders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {dept.positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 pl-6 pr-4 font-bold text-foreground">{pos.title}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{pos.level || 'Standard'}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                      ৳{pos.baseSalary.toLocaleString()}
                    </td>
                    <td className="py-3.5 pr-6 pl-4 text-right font-bold text-primary tabular">
                      {pos._count.employees}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Department Team Members Roster */}
      <section className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs">
        <div className="border-b border-border/60 bg-muted/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h2 className="font-bold text-sm text-foreground">Staff & Colleague Roster</h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{dept.employees.length} people</span>
        </div>

        {dept.employees.length === 0 ? (
          <p className="p-8 text-center text-xs text-muted-foreground">No employees currently in this department.</p>
        ) : (
          <div className="divide-y divide-border/60">
            {dept.employees.map((emp) => {
              const fullName = `${emp.firstName} ${emp.lastName}`;
              return (
                <div
                  key={emp.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 px-6 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar className="size-10 ring-2 ring-border shrink-0">
                      {emp.photoUrl && <AvatarImage src={emp.photoUrl} />}
                      <AvatarFallback className="bg-[#252175] text-[#F37021] font-bold text-xs">
                        {getInitials(fullName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/team-profile/${emp.id}`}
                          className="font-bold text-sm text-foreground hover:text-primary hover:underline truncate"
                        >
                          {fullName}
                        </Link>
                        <span className="rounded-md bg-secondary px-2 py-0.2 font-mono text-[10px] text-muted-foreground">
                          {emp.employeeCode}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{emp.position?.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-foreground">{emp.email}</span>
                      <span className="text-[11px]">{emp.phone}</span>
                    </div>

                    <Button asChild variant="outline" size="sm" className="h-8 text-xs font-semibold gap-1">
                      <Link href={`/team-profile/${emp.id}`}>
                        <span>Digital Card</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

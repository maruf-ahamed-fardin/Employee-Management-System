import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Droplet,
  UserCheck,
  Briefcase,
  Share2,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CardActions } from '@/components/employee/CardActions';
import { ProfileLinks } from '@/components/employee/ProfileLinks';
import { SaveContactButton } from '@/components/employee/SaveContactButton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}): Promise<Metadata> {
  const { employeeId } = await params;
  const emp = await prisma.employee.findFirst({
    where: { OR: [{ id: employeeId }, { employeeCode: employeeId }], deletedAt: null },
    include: { position: true },
  });

  if (!emp) return { title: 'Card Not Found - SeloraX' };
  return {
    title: `${emp.firstName} ${emp.lastName} - Digital Profile Card | SeloraX`,
    description: `${emp.firstName} ${emp.lastName}, ${emp.position?.title || 'Team Member'} at SeloraX. Digital Business Card & Contact details.`,
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.charAt(0) ?? ''}${parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? '' : ''}`.toUpperCase();
}

export default async function TeamProfileCardPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;

  const emp = await prisma.employee.findFirst({
    where: {
      OR: [{ id: employeeId }, { employeeCode: employeeId }],
      deletedAt: null,
    },
    include: {
      department: true,
      position: true,
      manager: true,
      teamProfile: {
        include: {
          links: true,
        },
      },
    },
  });

  if (!emp) {
    notFound();
  }

  const tp = emp.teamProfile;
  const fullName = `${emp.firstName} ${emp.lastName}`;
  const links = tp?.links.map((l) => ({ kind: l.kind, url: l.url })) || [];

  const cardData = {
    employeeCode: emp.employeeCode,
    fullName,
    department: emp.department?.name || 'General',
    position: emp.position?.title || 'Team Member',
    email: emp.email,
    businessPhone: tp?.businessPhone || emp.phone,
    personalPhone: tp?.showPersonalPhone !== false ? emp.phone : undefined,
    workLocation: emp.workLocation || 'Dhaka, Bangladesh',
    links,
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 pb-12">
      {/* Back button */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/team-profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Team Directory</span>
        </Link>
      </nav>

      {/* Main Digital Card Article */}
      <article className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xl shadow-primary/5 transition-all">
        {/* SeloraX Brand Gradient Ribbon Bar */}
        <div aria-hidden className="h-3 w-full bg-gradient-to-r from-[#252175] via-[#5b4bff] to-[#F37021]" />

        <div className="flex flex-col items-center px-6 pt-8 pb-7 sm:px-8">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="size-28 ring-4 ring-card shadow-2xl bg-card">
              {emp.photoUrl && <AvatarImage src={emp.photoUrl} alt={fullName} />}
              <AvatarFallback className="bg-[#252175] text-[#F37021] font-extrabold text-2xl">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <span
              className="absolute bottom-1 right-1 size-5 rounded-full bg-emerald-500 ring-3 ring-card"
              title="Active Team Member"
            />
          </div>

          {/* Name & Headline */}
          <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {fullName}
          </h1>

          {(tp?.headline || emp.headline) && (
            <p className="mt-1 text-center text-sm text-muted-foreground max-w-md italic">
              “{tp?.headline || emp.headline}”
            </p>
          )}

          {/* Badge Pills */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-accent px-3.5 py-1 text-xs font-semibold text-accent-foreground border border-primary/20">
              {emp.position?.title || 'Team Member'}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs font-medium text-muted-foreground">
              {emp.employeeCode}
            </span>
            {emp.bloodGroup && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-400 border border-rose-500/20">
                <Droplet className="size-3 text-rose-600 fill-rose-600" />
                {emp.bloodGroup}
              </span>
            )}
          </div>

          {/* Contact Information Block */}
          <div className="mt-6 w-full rounded-2xl border border-border/80 bg-secondary/30 p-2 divide-y divide-border/60">
            {/* Email */}
            <div className="flex items-center gap-3.5 px-3 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Mail className="size-4.5 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <a
                  href={`mailto:${emp.email}`}
                  className="block truncate text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {emp.email}
                </a>
                <span className="text-[11px] text-muted-foreground">Work Email</span>
              </div>
              <SaveContactButton card={cardData} variant="copy" />
            </div>

            {/* Business Phone */}
            {tp?.businessPhone && (
              <div className="flex items-center gap-3.5 px-3 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Phone className="size-4.5 text-[#F37021]" />
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={`tel:${tp.businessPhone}`}
                    className="block truncate text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {tp.businessPhone}
                  </a>
                  <span className="text-[11px] text-muted-foreground">Business Line</span>
                </div>
              </div>
            )}

            {/* Personal Phone (if allowed) */}
            {tp?.showPersonalPhone !== false && emp.phone && (
              <div className="flex items-center gap-3.5 px-3 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Phone className="size-4.5 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={`tel:${emp.phone}`}
                    className="block truncate text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {emp.phone}
                  </a>
                  <span className="text-[11px] text-muted-foreground">Mobile Phone</span>
                </div>
              </div>
            )}

            {/* Department */}
            <div className="flex items-center gap-3.5 px-3 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Building2 className="size-4.5 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {emp.department?.name || 'General'}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {emp.manager
                    ? `Reports to ${emp.manager.firstName} ${emp.manager.lastName}`
                    : 'Department'}
                </span>
              </div>
            </div>

            {/* Location & Joining */}
            <div className="flex items-center gap-3.5 px-3 py-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <MapPin className="size-4.5 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {emp.workLocation || 'Dhaka, Bangladesh'}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Joined {emp.joiningDate}
                </span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {links.length > 0 && (
            <div className="mt-6 w-full text-center">
              <p className="text-xs font-semibold text-muted-foreground mb-2.5">
                Profiles & Portfolio
              </p>
              <ProfileLinks links={links} />
            </div>
          )}

          {/* Card Actions (Save Contact, Show QR, Share) */}
          <div className="mt-6 w-full">
            <CardActions card={cardData} employeeId={emp.id} className="w-full" />
          </div>
        </div>
      </article>
    </div>
  );
}

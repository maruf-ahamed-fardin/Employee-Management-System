import React from 'react';
import { Mail, MapPin, Phone, UserRound, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CardActions } from './CardActions';
import { ProfileLinks } from './ProfileLinks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface TeamProfilePerson {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string | null;
  businessPhone?: string | null;
  position: string;
  department: string;
  workLocation: string;
  photoUrl?: string | null;
  headline?: string | null;
  managerName?: string | null;
  bloodGroup?: string | null;
  joiningDate?: string | null;
  links: { kind: string; url: string }[];
}

const DEPARTMENT_TONES: Record<string, string> = {
  Engineering: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  Design: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  Marketing: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
  Sales: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  HR: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
  Finance: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
};

function getDepartmentClass(dept: string): string {
  return DEPARTMENT_TONES[dept] || 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.charAt(0) ?? ''}${parts.length > 1 ? parts[parts.length - 1]?.charAt(0) ?? '' : ''}`.toUpperCase();
}

export function ProfileCardTile({
  person,
  className = '',
}: {
  person: TeamProfilePerson;
  className?: string;
}) {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 ${className}`}
    >
      {/* Brand Header Banner with SeloraX Navy & Orange Spark Gradient */}
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#1b1754] via-[#252175] to-[#3a34a8]">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:12px_12px]"
        />
        <div aria-hidden className="absolute -top-10 -right-8 size-32 rounded-full bg-[#F37021]/30 blur-2xl" />
        <div className="relative flex items-start justify-between px-4 pt-3 text-white">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-90">
            SeloraX · Team
          </span>
          <span className="rounded-md bg-white/15 px-2 py-0.5 font-mono text-[11px] font-semibold ring-1 ring-white/20 backdrop-blur">
            {person.employeeCode}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5">
        {/* Floating Avatar */}
        <div className="relative z-10 -mt-11 flex justify-center">
          <Avatar className="size-20 ring-4 ring-card shadow-lg bg-card">
            {person.photoUrl && <AvatarImage src={person.photoUrl} alt={person.fullName} />}
            <AvatarFallback className="bg-[#252175] text-[#F37021] font-bold text-lg">
              {getInitials(person.fullName)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name & Title */}
        <h2 className="mt-3.5 text-center text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
          <Link href={`/team-profile/${person.employeeId}`} className="hover:underline">
            {person.fullName}
          </Link>
        </h2>
        <p className="mt-0.5 truncate text-center text-xs font-medium text-muted-foreground">
          {person.position}
        </p>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getDepartmentClass(
              person.department
            )}`}
          >
            {person.department}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary/80 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            <MapPin className="size-3 text-muted-foreground" />
            {person.workLocation}
          </span>
        </div>

        {/* Headline */}
        {person.headline && (
          <p className="mt-3 line-clamp-2 text-center text-xs leading-relaxed text-muted-foreground italic px-2">
            “{person.headline}”
          </p>
        )}

        {/* Contact Info Lines */}
        <div className="mt-4 border-t border-border/60 pt-3 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-3.5 text-primary shrink-0" />
            <a
              href={`mailto:${person.email}`}
              className="truncate hover:text-foreground hover:underline"
            >
              {person.email}
            </a>
          </div>

          {(person.businessPhone || person.phone) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-3.5 text-[#F37021] shrink-0" />
              <a
                href={`tel:${person.businessPhone || person.phone}`}
                className="truncate hover:text-foreground hover:underline"
              >
                {person.businessPhone || person.phone}
              </a>
            </div>
          )}

          {person.managerName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserRound className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">Reports to {person.managerName}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {person.links && person.links.length > 0 && (
          <div className="mt-3 pt-2">
            <ProfileLinks links={person.links} />
          </div>
        )}

        {/* Card Actions Bottom Bar */}
        <div className="mt-auto pt-4">
          <CardActions
            card={{
              employeeCode: person.employeeCode,
              fullName: person.fullName,
              department: person.department,
              position: person.position,
              email: person.email,
              businessPhone: person.businessPhone,
              personalPhone: person.phone,
              workLocation: person.workLocation,
              links: person.links,
            }}
            employeeId={person.employeeId}
            className="border-t border-border/60 pt-3"
          />

          <Link
            href={`/team-profile/${person.employeeId}`}
            className="mt-3 inline-flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-1"
          >
            <span>View Full Digital Card</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}

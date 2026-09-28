'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Download, QrCode as QrIcon, Share2, UserCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { calculateTenure, formatDate } from '@/lib/utils/date';
import { toast } from 'sonner';

export interface EmployeeCardProps {
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department?: { name: string };
    position?: { title: string };
    manager?: { firstName: string; lastName: string } | null;
    workLocation?: string;
    joiningDate?: string;
    headline?: string | null;
    businessPhone?: string | null;
    photoUrl?: string | null;
    socialLinks?: { kind: string; url: string }[];
  };
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const fullName = `${employee.firstName} ${employee.lastName}`;
  const tenure = calculateTenure(employee.joiningDate);
  const initials = `${employee.firstName[0] || ''}${employee.lastName[0] || ''}`.toUpperCase();

  const handleDownloadVCard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${fullName}`,
      `N:${employee.lastName};${employee.firstName};;;`,
      `ORG:SeloraX;${employee.department?.name || 'Department'}`,
      `TITLE:${employee.position?.title || 'Staff'}`,
      `EMAIL;TYPE=WORK:${employee.email}`,
      `TEL;TYPE=WORK:${employee.businessPhone || employee.phone}`,
      `NOTE:SeloraX Employee Code: ${employee.employeeCode}`,
      'END:VCARD',
    ].join('\r\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${employee.employeeCode}-${fullName.replace(/\s+/g, '_')}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Contact saved for ${fullName}`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/employees/${employee.id}` : '';
    if (navigator.share) {
      try {
        await navigator.share({ title: fullName, text: `Contact card for ${fullName}`, url: shareUrl });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Profile link copied to clipboard!');
  };

  return (
    <>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
        {/* Badge Header Banner */}
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-[#1d1b4f] via-[#3b2aa8] to-[#7b3fe4]">
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="relative flex items-center justify-between px-4 pt-3 text-white">
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-90">
              SeloraX · Team
            </span>
            <span className="rounded-md bg-white/20 px-2 py-0.5 font-mono text-xs font-semibold backdrop-blur-sm">
              {employee.employeeCode}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 pb-4">
          {/* Avatar */}
          <div className="relative -mt-12 flex justify-center">
            <Avatar initials={initials} src={employee.photoUrl} size="lg" className="border-4 border-white dark:border-slate-900" />
          </div>

          {/* Name & Title */}
          <div className="mt-3 text-center">
            <Link
              href={`/employees/${employee.id}`}
              className="font-extrabold text-base tracking-tight hover:text-primary transition-colors"
            >
              {fullName}
            </Link>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {employee.position?.title || 'Team Member'}
            </p>
          </div>

          {/* Department & Location Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-inset ring-primary/20">
              {employee.department?.name || 'General'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <MapPin className="size-3" />
              {employee.workLocation || 'Dhaka HQ'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {tenure}
            </span>
          </div>

          {/* Headline */}
          {employee.headline && (
            <p className="mt-3 line-clamp-2 text-center text-xs text-slate-500 dark:text-slate-400 italic">
              “{employee.headline}”
            </p>
          )}

          {/* Contact Details */}
          <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-2 text-xs">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <span className="grid size-6 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                <Mail className="size-3.5" />
              </span>
              <a href={`mailto:${employee.email}`} className="truncate hover:text-primary hover:underline">
                {employee.email}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <span className="grid size-6 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                <Phone className="size-3.5" />
              </span>
              <a href={`tel:${employee.businessPhone || employee.phone}`} className="truncate hover:text-primary hover:underline">
                {employee.businessPhone || employee.phone}
              </a>
            </div>
            {employee.manager && (
              <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                <span className="grid size-6 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <UserCheck className="size-3.5" />
                </span>
                <span className="truncate">Reports to {employee.manager.firstName} {employee.manager.lastName}</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-auto border-t border-slate-100 dark:border-slate-800/80 pt-3 grid grid-cols-4 gap-1 text-[11px] font-semibold text-slate-500">
            <button
              type="button"
              onClick={handleDownloadVCard}
              title="Save Contact"
              className="flex flex-col items-center gap-1 rounded-xl py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Download className="size-4" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              title="View QR Code"
              className="flex flex-col items-center gap-1 rounded-xl py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <QrIcon className="size-4" />
              <span>QR</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              title="Share Card"
              className="flex flex-col items-center gap-1 rounded-xl py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Share2 className="size-4" />
              <span>Share</span>
            </button>
            <Link
              href={`/employees/${employee.id}`}
              className="flex flex-col items-center gap-1 rounded-xl py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <span className="my-auto font-bold">Profile</span>
            </Link>
          </div>
        </div>
      </article>

      {/* QR Code Modal */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>{fullName}</DialogTitle>
            <DialogDescription>
              Scan to view digital employee card
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 dark:border-slate-700 my-2">
            <div className="p-3 bg-white rounded-xl">
              {/* Fallback QR generator display or SVG */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  typeof window !== 'undefined' ? `${window.location.origin}/employees/${employee.id}` : ''
                )}`}
                alt="QR Code"
                className="size-44 object-contain"
              />
            </div>
            <p className="mt-2 text-xs font-mono font-bold text-slate-700">{employee.employeeCode}</p>
          </div>
          <button
            onClick={() => setQrOpen(false)}
            className="w-full h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold hover:bg-slate-200 cursor-pointer"
          >
            Close
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}

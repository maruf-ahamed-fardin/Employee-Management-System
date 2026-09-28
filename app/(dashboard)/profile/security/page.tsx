import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SecurityForms } from '@/components/profile/SecurityForms';

export const metadata: Metadata = {
  title: 'Password & Security - SeloraX EMS',
  description: 'Manage password, sign-in sessions, and account security.',
};

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <nav aria-label="Breadcrumb">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to My Profile</span>
        </Link>
      </nav>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Password & Account Security
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your login password and manage active browser sessions across your devices.
        </p>
      </div>

      <SecurityForms />
    </div>
  );
}

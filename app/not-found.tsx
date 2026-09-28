import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';
import { SeloraLogo } from '@/components/brand/SeloraLogo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
      <div className="mb-6">
        <SeloraLogo size="lg" subtitle="EMS Enterprise" />
      </div>
      <div className="p-4 rounded-3xl bg-[#f37021]/10 text-[#f37021] mb-4">
        <SearchX className="size-10" />
      </div>
      <h2 className="text-2xl font-extrabold text-foreground">
        404 — Page Not Found
      </h2>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm">
        The employee, report or directory view you are looking for does not exist or has been removed.
      </p>
      <Link href="/dashboard" className="mt-5">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  );
}

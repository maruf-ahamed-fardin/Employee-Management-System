'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#090d16]">
      <div className="p-4 rounded-3xl bg-rose-500/10 text-rose-500 mb-4">
        <AlertTriangle className="size-10" />
      </div>
      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
        Something unexpected happened
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
        {error.message || 'An error occurred while loading this page'}
      </p>
      <Button onClick={() => reset()} className="mt-5">
        Try again
      </Button>
    </div>
  );
}

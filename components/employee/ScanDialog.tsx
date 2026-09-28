'use client';

import React, { useState } from 'react';
import { ScanLine, Search, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function ScanDialog({
  className = '',
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const router = useRouter();

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputVal.trim();
    if (!val) return;

    // Check if it's a URL
    try {
      if (val.startsWith('http://') || val.startsWith('https://')) {
        const url = new URL(val);
        const match = url.pathname.match(/\/team-profile\/([^\/]+)/);
        if (match && match[1]) {
          setOpen(false);
          router.push(`/team-profile/${match[1]}`);
          return;
        }
      }
    } catch {}

    // Otherwise navigate to lookup or direct ID
    setOpen(false);
    router.push(`/team-profile?q=${encodeURIComponent(val)}`);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={`gap-2 font-medium border-border/80 hover:bg-accent hover:text-accent-foreground ${className}`}
      >
        <ScanLine className="size-4 text-primary" />
        <span>Scan / Look up</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-6 bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ScanLine className="size-5 text-primary" />
              Scan or Look up Card
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter an employee ID (e.g. SX-001), work email, or paste a card QR link.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLookup} className="space-y-4 my-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. SX-001 or ashek@selorax.com"
                className="pl-9 h-11 text-sm bg-background border-border"
                autoFocus
              />
            </div>

            <div className="rounded-xl border border-dashed border-border/80 p-5 text-center bg-secondary/30">
              <div className="mx-auto size-12 rounded-full bg-accent/60 flex items-center justify-center text-primary mb-2">
                <ScanLine className="size-6 text-[#F37021]" />
              </div>
              <p className="text-xs font-medium text-foreground">Have a physical NFC card or badge?</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tap your phone to read the NFC tag, or point your phone camera at the QR code.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!inputVal.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
              >
                <span>Find Colleague</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

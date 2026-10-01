'use client';

import React, { useState } from 'react';
import { QrCode as QrIcon, Share2, Download, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { QrCode, downloadQrPng } from './QRCode';
import { SaveContactButton } from './SaveContactButton';
import { VCardSource } from '@/lib/vcard';
import { toast } from 'sonner';

export function CardActions({
  card,
  employeeId,
  className = '',
  layout = 'stack',
}: {
  card: VCardSource;
  employeeId: string;
  className?: string;
  layout?: 'stack' | 'grid';
}) {
  const [qrOpen, setQrOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const getCardUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/team-profile/${employeeId}`;
    }
    return `/team-profile/${employeeId}`;
  };

  const handleShare = async () => {
    const url = getCardUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.fullName} - SeloraX Team Profile`,
          text: `Digital business card of ${card.fullName} (${card.position}) at SeloraX`,
          url,
        });
      } catch {
        // User cancelled or share failed, fallback to copy
        copyUrl(url);
      }
    } else {
      copyUrl(url);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success('Card link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      {layout === 'grid' ? (
        <div className={`grid grid-cols-3 gap-2 ${className}`}>
          <SaveContactButton card={card} size="sm" className="w-full text-xs px-2 truncate" />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setQrOpen(true)}
            className="gap-1.5 font-medium border-border/80 hover:bg-accent hover:text-accent-foreground text-xs px-2"
          >
            <QrIcon className="size-3.5 text-primary shrink-0" />
            <span className="truncate">Show QR</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 font-medium border-border/80 hover:bg-accent hover:text-accent-foreground text-xs px-2"
          >
            {copiedLink ? (
              <Check className="size-3.5 text-emerald-600 shrink-0" />
            ) : (
              <Share2 className="size-3.5 text-[#F37021] shrink-0" />
            )}
            <span className="truncate">{copiedLink ? 'Copied' : 'Share'}</span>
          </Button>
        </div>
      ) : (
        <div className={`space-y-2 ${className}`}>
          <SaveContactButton
            card={card}
            size="sm"
            className="w-full h-9 rounded-xl text-xs font-semibold shadow-xs justify-center"
          />

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQrOpen(true)}
              className="h-8.5 rounded-xl gap-1.5 font-medium border-border/80 hover:bg-accent hover:text-accent-foreground text-xs justify-center"
            >
              <QrIcon className="size-3.5 text-primary shrink-0" />
              <span>Show QR</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-8.5 rounded-xl gap-1.5 font-medium border-border/80 hover:bg-accent hover:text-accent-foreground text-xs justify-center"
            >
              {copiedLink ? (
                <Check className="size-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Share2 className="size-3.5 text-[#F37021] shrink-0" />
              )}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </Button>
          </div>
        </div>
      )}

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-[380px] sm:max-w-md text-center p-6 bg-card border-border shadow-2xl rounded-3xl">
          <DialogHeader className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#252175]/10 dark:bg-indigo-500/15 border border-[#252175]/20 dark:border-indigo-500/30 text-xs font-bold text-primary mx-auto mb-1">
              <Sparkles className="size-3 text-[#f37021]" />
              <span>Digital Business Card</span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {card.fullName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Scan with a smartphone camera to view this SeloraX Digital Profile
            </DialogDescription>
          </DialogHeader>

          {/* Branded QR Card Showcase */}
          <div className="relative my-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-[#252175]/5 dark:shadow-black/40 flex flex-col items-center">
            {/* White QR Code container */}
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
              <QrCode
                value={getCardUrl()}
                label={`QR Code for ${card.fullName}`}
                className="w-48 h-48 sm:w-56 sm:h-56 max-w-full drop-shadow-xs"
                showLogo={true}
              />
            </div>

            {/* Employee ID & Department Badge */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold border border-slate-200/60 dark:border-slate-700/60">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {card.employeeCode}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {card.department}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyUrl(getCardUrl())}
              className="gap-2 font-semibold h-10 px-4 rounded-xl border-border/80"
            >
              {copiedLink ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              Copy Link
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => downloadQrPng(getCardUrl(), `${card.employeeCode}-qr.png`)}
              className="gap-2 font-semibold h-10 px-4 rounded-xl bg-gradient-to-r from-[#252175] to-[#4f46e5] text-white hover:opacity-95 shadow-md shadow-[#252175]/20 cursor-pointer"
            >
              <Download className="size-3.5" />
              Download PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


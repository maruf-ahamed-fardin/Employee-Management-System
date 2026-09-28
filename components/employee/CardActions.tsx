'use client';

import React, { useState } from 'react';
import { QrCode as QrIcon, Share2, Download, Copy, Check } from 'lucide-react';
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
}: {
  card: VCardSource;
  employeeId: string;
  className?: string;
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
      <div className={`grid grid-cols-3 gap-2 ${className}`}>
        <SaveContactButton card={card} className="w-full text-xs sm:text-sm px-2 sm:px-4" />

        <Button
          variant="outline"
          onClick={() => setQrOpen(true)}
          className="gap-2 font-medium border-border/80 hover:bg-accent hover:text-accent-foreground text-xs sm:text-sm px-2 sm:px-4"
        >
          <QrIcon className="size-4 text-primary" />
          <span>Show QR</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleShare}
          className="gap-2 font-medium border-border/80 hover:bg-accent hover:text-accent-foreground text-xs sm:text-sm px-2 sm:px-4"
        >
          {copiedLink ? (
            <Check className="size-4 text-emerald-600" />
          ) : (
            <Share2 className="size-4 text-[#F37021]" />
          )}
          <span>{copiedLink ? 'Copied' : 'Share'}</span>
        </Button>
      </div>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md text-center p-6 bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {card.fullName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Scan this code with a smartphone camera to view this SeloraX Digital Profile
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center my-4 p-4 rounded-2xl bg-white shadow-inner border border-slate-200">
            <QrCode
              value={getCardUrl()}
              label={`QR Code for ${card.fullName}`}
              className="size-56 sm:size-64 drop-shadow-xs"
            />
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono">
              <span>{card.employeeCode}</span>
              <span>•</span>
              <span>{card.department}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyUrl(getCardUrl())}
              className="gap-2 font-medium"
            >
              {copiedLink ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              Copy Link
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => downloadQrPng(getCardUrl(), `${card.employeeCode}-qr.png`)}
              className="gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90"
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

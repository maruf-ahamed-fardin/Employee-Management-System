'use client';

import React from 'react';
import { UserPlus, Copy, Check } from 'lucide-react';
import { buildVCard, vCardFileName, VCardSource } from '@/lib/vcard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SaveContactButton({
  card,
  variant = 'download',
  className = '',
}: {
  card: VCardSource;
  variant?: 'download' | 'copy';
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleDownload = () => {
    try {
      const vcfData = buildVCard(card);
      const blob = new Blob([vcfData], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = vCardFileName(card);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Contact card for ${card.fullName} downloaded`);
    } catch {
      toast.error('Failed to download contact card');
    }
  };

  const handleCopy = () => {
    try {
      const text = `${card.fullName}\n${card.position} - ${card.department} (SeloraX)\nEmail: ${card.email}${
        card.businessPhone ? `\nWork: ${card.businessPhone}` : ''
      }${card.personalPhone ? `\nPhone: ${card.personalPhone}` : ''}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Contact details copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy contact details');
    }
  };

  if (variant === 'copy') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className={`size-8 text-muted-foreground hover:text-foreground ${className}`}
        title="Copy contact"
      >
        {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      onClick={handleDownload}
      className={`font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 ${className}`}
    >
      <UserPlus className="size-4" />
      Save Contact (.vcf)
    </Button>
  );
}

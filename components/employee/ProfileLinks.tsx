import React from 'react';
import {
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  ExternalLink,
} from 'lucide-react';

interface LinkItem {
  kind: string;
  url: string;
}

export function ProfileLinks({
  links,
  className = '',
}: {
  links: LinkItem[];
  className?: string;
}) {
  if (!links || links.length === 0) return null;

  const getIcon = (kind: string) => {
    switch (kind.toUpperCase()) {
      case 'LINKEDIN':
        return <Linkedin className="size-4" />;
      case 'GITHUB':
        return <Github className="size-4" />;
      case 'TWITTER':
      case 'X':
        return <Twitter className="size-4" />;
      case 'INSTAGRAM':
        return <Instagram className="size-4" />;
      case 'FACEBOOK':
        return <Facebook className="size-4" />;
      case 'WEBSITE':
      case 'PORTFOLIO':
      default:
        return <Globe className="size-4" />;
    }
  };

  const getLabel = (kind: string) => {
    switch (kind.toUpperCase()) {
      case 'LINKEDIN':
        return 'LinkedIn';
      case 'GITHUB':
        return 'GitHub';
      case 'TWITTER':
      case 'X':
        return 'X (Twitter)';
      case 'INSTAGRAM':
        return 'Instagram';
      case 'FACEBOOK':
        return 'Facebook';
      case 'PORTFOLIO':
        return 'Portfolio';
      case 'WEBSITE':
      default:
        return 'Website';
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2.5 ${className}`}>
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-3.5 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/40 hover:bg-accent hover:text-accent-foreground shadow-xs"
        >
          {getIcon(link.kind)}
          <span>{getLabel(link.kind)}</span>
          <ExternalLink className="size-3 text-muted-foreground opacity-70" />
        </a>
      ))}
    </div>
  );
}

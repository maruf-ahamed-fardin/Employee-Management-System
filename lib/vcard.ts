export interface VCardSource {
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  email: string;
  businessPhone?: string | null;
  personalPhone?: string | null;
  workLocation?: string | null;
  links?: { kind: string; url: string }[];
}

function escape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0] ?? '', last: '' };
  return { first: parts.slice(0, -1).join(' '), last: parts.at(-1) ?? '' };
}

export function buildVCard(card: VCardSource): string {
  const { first, last } = splitName(card.fullName);
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escape(last)};${escape(first)};;;`,
    `FN:${escape(card.fullName)}`,
    `ORG:SeloraX;${escape(card.department)}`,
    `TITLE:${escape(card.position)}`,
    `EMAIL;TYPE=WORK:${escape(card.email)}`,
  ];

  if (card.businessPhone) lines.push(`TEL;TYPE=WORK,VOICE:${escape(card.businessPhone)}`);
  if (card.personalPhone) lines.push(`TEL;TYPE=CELL,VOICE:${escape(card.personalPhone)}`);
  if (card.links) {
    for (const link of card.links) lines.push(`URL:${escape(link.url)}`);
  }
  lines.push(`NOTE:${escape(`SeloraX ${card.employeeCode}${card.workLocation ? ` · ${card.workLocation}` : ''}`)}`);
  lines.push('END:VCARD');

  return `${lines.join('\r\n')}\r\n`;
}

export function vCardFileName(card: VCardSource): string {
  const safe = card.fullName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  return `${safe || card.employeeCode}.vcf`;
}

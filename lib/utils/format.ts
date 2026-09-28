import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(firstName: string = '', lastName: string = ''): string {
  const f = firstName.trim().charAt(0) || '';
  const l = lastName.trim().charAt(0) || '';
  return `${f}${l}`.toUpperCase() || 'EM';
}

export function truncate(text: string, length: number = 30): string {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

import { isCalendarDate } from '@/lib/utils/calendar-date';

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 MB

export interface DetectedFile {
  mimeType: string;
  extension: string;
  /** Safe to render inside the app (PDF viewer / <img>); everything else is download-only. */
  previewable: boolean;
}

const startsWith = (buf: Buffer, bytes: number[], offset = 0) => bytes.every((b, i) => buf[offset + i] === b);

/**
 * Identifies an upload from its leading bytes rather than trusting the browser's
 * Content-Type or the file name. Returns null for anything outside the allow-list.
 */
export function detectDocumentFile(buf: Buffer, fileName: string): DetectedFile | null {
  if (startsWith(buf, [0x25, 0x50, 0x44, 0x46])) return { mimeType: 'application/pdf', extension: 'pdf', previewable: true };
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mimeType: 'image/png', extension: 'png', previewable: true };
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return { mimeType: 'image/jpeg', extension: 'jpg', previewable: true };
  if (startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { mimeType: 'image/webp', extension: 'webp', previewable: true };
  }

  // Word formats share their container signature with other Office/zip files, so the extension decides
  const ext = fileName.toLowerCase().split('.').pop();
  if (startsWith(buf, [0x50, 0x4b, 0x03, 0x04]) && ext === 'docx') {
    return {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'docx',
      previewable: false,
    };
  }
  if (startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]) && ext === 'doc') {
    return { mimeType: 'application/msword', extension: 'doc', previewable: false };
  }
  return null;
}

export const PREVIEWABLE_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

/** Normalises an optional expiry date field: '' / null → null, valid date → itself, anything else → undefined (invalid). */
export function parseExpiry(value: unknown): string | null | undefined {
  if (value === null || value === undefined || value === '') return null;
  return isCalendarDate(value) ? value : undefined;
}

import { encode } from 'uqr';

/**
 * QR code matrix generator using uqr
 */
export function qrMatrix(text: string): boolean[][] {
  return encode(Array.from(new TextEncoder().encode(text)), { ecc: 'M', border: 2 }).data;
}

export function cardUrl(origin: string, employeeId: string): string {
  return `${origin}/team-profile/${employeeId}`;
}

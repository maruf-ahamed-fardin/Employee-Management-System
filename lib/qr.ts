import { encode } from 'uqr';

export interface QrMatrixOptions {
  ecc?: 'L' | 'M' | 'Q' | 'H';
  border?: number;
}

export interface QrStructure {
  size: number;
  rawSize: number;
  border: number;
  cx: number;
  cy: number;
  circleRadius: number;
  matrix: boolean[][];
  modules: Array<{ x: number; y: number }>;
  eyes: Array<{ x: number; y: number }>;
}

/**
 * QR code matrix generator using uqr with ECC H for optimal branded QR codes
 */
export function qrMatrix(text: string, options?: QrMatrixOptions): boolean[][] {
  const ecc = options?.ecc || 'H';
  const border = options?.border ?? 3;
  return encode(Array.from(new TextEncoder().encode(text)), { ecc, border }).data;
}

/**
 * Computes QR structure isolating finder eyes and circular center logo region
 */
export function getQrStructure(text: string, showLogo = true, border = 3): QrStructure {
  const qr = encode(Array.from(new TextEncoder().encode(text)), { ecc: 'H', border });
  const matrix = qr.data;
  const size = matrix.length;
  const rawSize = size - border * 2;
  const cx = size / 2;
  const cy = size / 2;
  // Circular center badge covers ~26% of rawSize (well within ECC H's 30% tolerance)
  const circleRadius = showLogo ? Math.max(3.8, rawSize * 0.135) : 0;
  const cutoutRadius = circleRadius > 0 ? circleRadius + 0.35 : 0;

  const isEye = (x: number, y: number) => {
    const inTL = x >= border && x < border + 7 && y >= border && y < border + 7;
    const inTR = x >= size - border - 7 && x < size - border && y >= border && y < border + 7;
    const inBL = x >= border && x < border + 7 && y >= size - border - 7 && y < size - border;
    return inTL || inTR || inBL;
  };

  const isCenter = (x: number, y: number) => {
    if (!showLogo || circleRadius === 0) return false;
    const dx = x + 0.5 - cx;
    const dy = y + 0.5 - cy;
    return Math.sqrt(dx * dx + dy * dy) < cutoutRadius;
  };

  const modules: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y][x] && !isEye(x, y) && !isCenter(x, y)) {
        modules.push({ x, y });
      }
    }
  }

  const eyes = [
    { x: border, y: border },
    { x: size - border - 7, y: border },
    { x: border, y: size - border - 7 },
  ];

  return { size, rawSize, border, cx, cy, circleRadius, matrix, modules, eyes };
}

export function cardUrl(origin: string, employeeId: string): string {
  return `${origin}/team-profile/${employeeId}`;
}


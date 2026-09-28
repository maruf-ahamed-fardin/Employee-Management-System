'use client';

import React from 'react';
import { qrMatrix } from '@/lib/qr';

export function QrCode({
  value,
  label,
  className = '',
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const matrix = qrMatrix(value);
  const size = matrix.length;
  let path = '';
  matrix.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) path += `M${x} ${y}h1v1h-1z`;
    });
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={className}
    >
      <rect width={size} height={size} fill="#ffffff" rx="8" />
      <path d={path} fill="#252175" />
    </svg>
  );
}

export function downloadQrPng(value: string, fileName = 'qr-code.png', pixels = 640): void {
  const matrix = qrMatrix(value);
  const size = matrix.length;
  const scale = Math.max(1, Math.floor(pixels / size));
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#252175';

  matrix.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) ctx.fillRect(x * scale, y * scale, scale, scale);
    });
  });

  const a = document.createElement('a');
  a.download = fileName;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

'use client';

import React, { useId } from 'react';
import { getQrStructure } from '@/lib/qr';

// Authentic SeloraX Brand "X" Vector Paths
export const SELORA_WING_PATH =
  'M 54 86 L 65 99 L 90 134 L 102 144 L 118 145 L 122 140 L 119 128 L 123 124 L 144 122 L 143 118 L 120 89 L 96 68 Z';
export const SELORA_CROSS_PATH =
  'M 266 68 L 215 68 L 196 82 L 175 109 L 160 130 L 157 168 L 153 174 L 148 172 L 142 167 L 66 268 L 54 281 L 55 285 L 90 285 L 105 278 L 120 264 L 150 223 L 159 224 L 191 265 L 211 284 L 269 284 L 268 279 L 250 259 L 222 220 L 193 183 L 192 172 L 196 163 L 223 130 L 265 74 Z';
export const SELORA_STAR_PATH =
  'M 148 140 Q 148 152 160 152 Q 148 152 148 164 Q 148 152 136 152 Q 148 152 148 140 Z';

export interface QrCodeProps {
  value: string;
  label?: string;
  className?: string;
  showLogo?: boolean;
  border?: number;
}

/**
 * Generates an SVG path for a rounded module
 */
function roundedModulePath(x: number, y: number, size = 0.86, r = 0.26): string {
  const x0 = x + r;
  const x1 = x + size - r;
  const y0 = y + r;
  const y1 = y + size - r;
  return `M${x0},${y}H${x1}A${r},${r} 0 0 1 ${x + size},${y0}V${y1}A${r},${r} 0 0 1 ${x1},${y + size}H${x0}A${r},${r} 0 0 1 ${x},${y1}V${y0}A${r},${r} 0 0 1 ${x0},${y}Z`;
}

/**
 * Branded QR Code tailored to the user's reference design:
 * - 3 Corner Finder Eyes: Bold Vibrant Orange outer frame + Dark Navy rounded pupil
 * - Data Modules: Sleek Dark Slate / Navy-Black rounded modules
 * - Center: Pure White Circle badge with the vibrant orange SeloraX "X" emblem
 */
export function QrCode({
  value,
  label = 'SeloraX QR Code',
  className = '',
  showLogo = true,
  border = 3,
}: QrCodeProps) {
  const uniqueId = useId().replace(/:/g, '');
  const qr = getQrStructure(value, showLogo, border);
  const { size, modules, eyes, circleRadius, cx, cy } = qr;

  // Compile all regular data modules into a single, GPU-accelerated SVG path
  const modulesPath = modules
    .map((m) => roundedModulePath(m.x + 0.07, m.y + 0.07, 0.86, 0.26))
    .join(' ');

  // Center logo emblem positioning inside the circle badge
  const logoSize = circleRadius * 1.35;
  const logoX = cx - logoSize / 2;
  const logoY = cy - logoSize / 2;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="geometricPrecision"
      className={`select-none ${className}`}
    >
      <defs>
        {/* Vibrant Orange Gradient for the 3 Finder Outer Frames */}
        <linearGradient
          id={`qr-orange-frame-${uniqueId}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ff8500" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>

        {/* Center Orange "X" Emblem Gradient */}
        <linearGradient
          id={`qr-x-cross-${uniqueId}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#ff7800" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        {/* Subtle drop shadow for center white circle */}
        <filter
          id={`qr-circle-shadow-${uniqueId}`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="0"
            dy="0.25"
            stdDeviation="0.35"
            floodColor="#0f172a"
            floodOpacity="0.16"
          />
        </filter>
      </defs>

      {/* Pure white background with safe corner radius (never touches modules) */}
      <rect
        width={size}
        height={size}
        fill="#ffffff"
        rx={Math.min(2.5, size * 0.05)}
      />

      {/* Dark Slate / Navy-Black Data Modules */}
      {modulesPath && <path d={modulesPath} fill="#0f172a" />}

      {/* 3 Stylized Finder Eyes: Orange Outer Frame + Dark Navy Pupil */}
      {eyes.map((eye, i) => (
        <g key={i}>
          {/* Outer Ring: 7x7 squircle with 1px stroke (centered at x+0.5, y+0.5) */}
          <rect
            x={eye.x + 0.5}
            y={eye.y + 0.5}
            width={6}
            height={6}
            rx={1.75}
            fill="none"
            stroke={`url(#qr-orange-frame-${uniqueId})`}
            strokeWidth={1}
          />
          {/* Inner Pupil: 3x3 rounded square in dark navy / black */}
          <rect
            x={eye.x + 2}
            y={eye.y + 2}
            width={3}
            height={3}
            rx={0.95}
            fill="#0f172a"
          />
        </g>
      ))}

      {/* Center Circular Badge with Orange SeloraX "X" Logo */}
      {showLogo && circleRadius > 0 && (
        <g>
          {/* Crisp White Circle Badge with subtle outline & shadow */}
          <circle
            cx={cx}
            cy={cy}
            r={circleRadius}
            fill="#ffffff"
            stroke="#f1f5f9"
            strokeWidth={0.12}
            filter={`url(#qr-circle-shadow-${uniqueId})`}
          />

          {/* Embedded Orange "X" Logo Mark */}
          <svg
            x={logoX}
            y={logoY}
            width={logoSize}
            height={logoSize}
            viewBox="0 0 336 336"
            className="overflow-visible"
          >
            {/* Top-left wing with warm amber-orange */}
            <path d={SELORA_WING_PATH} fill="#ff8a00" />
            {/* Main cross with energy orange */}
            <path d={SELORA_CROSS_PATH} fill={`url(#qr-x-cross-${uniqueId})`} />
            {/* Center 4-pointed star spark */}
            <path d={SELORA_STAR_PATH} fill="#ffffff" />
          </svg>
        </g>
      )}
    </svg>
  );
}

/**
 * Helper to draw rounded rectangles on HTML5 Canvas
 */
function drawCanvasRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}

/**
 * Downloads a high-definition 1024x1024 PNG matching the user's reference design
 */
export function downloadQrPng(
  value: string,
  fileName = 'selorax-qr-code.png',
  pixels = 1024
): void {
  const qr = getQrStructure(value, true, 3);
  const { size, modules, eyes, circleRadius, cx, cy } = qr;
  const scale = pixels / size;

  const canvas = document.createElement('canvas');
  canvas.width = pixels;
  canvas.height = pixels;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Crisp pure white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, pixels, pixels);

  // 2. Gradients
  const orangeFrameGrad = ctx.createLinearGradient(0, 0, pixels, pixels);
  orangeFrameGrad.addColorStop(0, '#ff8500');
  orangeFrameGrad.addColorStop(1, '#f97316');

  const orangeCrossGrad = ctx.createLinearGradient(0, 0, pixels, pixels);
  orangeCrossGrad.addColorStop(0, '#ff7800');
  orangeCrossGrad.addColorStop(1, '#ea580c');

  // 3. Draw Dark Slate / Navy-Black Modules
  ctx.fillStyle = '#0f172a';
  const modSize = 0.86 * scale;
  const modRadius = 0.26 * scale;
  modules.forEach((m) => {
    drawCanvasRoundRect(
      ctx,
      (m.x + 0.07) * scale,
      (m.y + 0.07) * scale,
      modSize,
      modSize,
      modRadius
    );
    ctx.fill();
  });

  // 4. Draw 3 Finder Eyes: Orange Outer Frame + Dark Navy Pupil
  eyes.forEach((eye) => {
    // Outer Orange Frame
    ctx.strokeStyle = orangeFrameGrad;
    ctx.lineWidth = 1 * scale;
    drawCanvasRoundRect(
      ctx,
      (eye.x + 0.5) * scale,
      (eye.y + 0.5) * scale,
      6 * scale,
      6 * scale,
      1.75 * scale
    );
    ctx.stroke();

    // Inner Dark Pupil
    ctx.fillStyle = '#0f172a';
    drawCanvasRoundRect(
      ctx,
      (eye.x + 2) * scale,
      (eye.y + 2) * scale,
      3 * scale,
      3 * scale,
      0.95 * scale
    );
    ctx.fill();
  });

  // 5. Draw Center Circular Badge with Orange "X" Emblem
  if (circleRadius > 0) {
    const centerPxX = cx * scale;
    const centerPxY = cy * scale;
    const radiusPx = circleRadius * scale;

    // White Circle Badge with Soft Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(15, 23, 42, 0.16)';
    ctx.shadowBlur = 12 * (pixels / 500);
    ctx.shadowOffsetY = 3 * (pixels / 500);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerPxX, centerPxY, radiusPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Circle Border
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1.5 * (pixels / 500);
    ctx.beginPath();
    ctx.arc(centerPxX, centerPxY, radiusPx, 0, Math.PI * 2);
    ctx.stroke();

    // Vector "X" Logo Paths
    const logoPxSize = circleRadius * 1.35 * scale;
    const logoPxX = centerPxX - logoPxSize / 2;
    const logoPxY = centerPxY - logoPxSize / 2;
    const logoScale = logoPxSize / 336;

    ctx.save();
    ctx.translate(logoPxX, logoPxY);
    ctx.scale(logoScale, logoScale);

    // Warm amber-orange wing
    ctx.fillStyle = '#ff8a00';
    ctx.fill(new Path2D(SELORA_WING_PATH));

    // Energy orange cross
    ctx.fillStyle = orangeCrossGrad;
    ctx.fill(new Path2D(SELORA_CROSS_PATH));

    // White 4-point star spark
    ctx.fillStyle = '#ffffff';
    ctx.fill(new Path2D(SELORA_STAR_PATH));

    ctx.restore();
  }

  // 6. Trigger Download
  const a = document.createElement('a');
  a.download = fileName;
  a.href = canvas.toDataURL('image/png');
  a.click();
}

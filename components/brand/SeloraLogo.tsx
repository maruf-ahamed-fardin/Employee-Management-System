import React from 'react';
import { cn } from '@/lib/utils/format';

export interface SeloraIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  showStar?: boolean;
}

/**
 * The official SeloraX "X" Brand Emblem
 * Features:
 * - Deep Royal Navy Wing: #252175 (light) or #818cf8 (dark)
 * - Energy Orange Cross: #F37021
 * - Negative space 4-point star spark
 */
export function SeloraIcon({
  size = 32,
  className,
  showStar = true,
  ...props
}: SeloraIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 336 336"
      width={size}
      height={size}
      className={cn('shrink-0 select-none overflow-visible', className)}
      fill="none"
      {...props}
    >
      <g id="selorax-icon-mark">
        {/* Blue top-left wing with aerodynamic speed cut */}
        <path
          d="M 54 86 L 65 99 L 90 134 L 102 144 L 118 145 L 122 140 L 119 128 L 123 124 L 144 122 L 143 118 L 120 89 L 96 68 Z"
          className="fill-[#252175] dark:fill-[#818cf8] transition-colors duration-200"
        />
        {/* Vibrant Energy Orange Cross and legs */}
        <path
          d="M 266 68 L 215 68 L 196 82 L 175 109 L 160 130 L 157 168 L 153 174 L 148 172 L 142 167 L 66 268 L 54 281 L 55 285 L 90 285 L 105 278 L 120 264 L 150 223 L 159 224 L 191 265 L 211 284 L 269 284 L 268 279 L 250 259 L 222 220 L 193 183 L 192 172 L 196 163 L 223 130 L 265 74 Z"
          fill="#F37021"
        />
        {/* 4-pointed Star Sparkle at intersection */}
        {showStar && (
          <path
            d="M 148 140 Q 148 152 160 152 Q 148 152 148 164 Q 148 152 136 152 Q 148 152 148 140 Z"
            className="fill-white dark:fill-[#0b1120] transition-colors duration-200"
          />
        )}
      </g>
    </svg>
  );
}

export interface SeloraLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
}

export function SeloraLogo({
  size = 'md',
  showText = true,
  subtitle,
  className,
  ...props
}: SeloraLogoProps) {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 52,
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const currentIconSize = iconSizes[size];

  if (!showText) {
    return (
      <div className={cn('inline-flex items-center justify-center', className)} {...props}>
        <SeloraIcon size={currentIconSize} />
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5 select-none', className)} {...props}>
      <div className="flex flex-col">
        <div className="flex items-center font-black tracking-tight leading-none">
          <span
            className={cn(
              'font-black text-[#252175] dark:text-white tracking-tight',
              textSizes[size]
            )}
            style={{ letterSpacing: '-0.03em' }}
          >
            Selora
          </span>
          <div className="relative -ml-0.5 inline-flex items-center">
            <SeloraIcon size={currentIconSize} className="drop-shadow-sm" />
          </div>
        </div>
        {subtitle && (
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

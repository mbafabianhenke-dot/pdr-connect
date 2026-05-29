'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PdrTechButtonProps {
  /** Haupttext, z.B. "PDR-Techniker" */
  label?: string;
  /** Subtext, z.B. "Globale Einsätze finden" */
  sublabel?: string;
  /** Aktiv / ausgewählt */
  active?: boolean;
  /** Icon-Größe in px (default 36) */
  iconSize?: number;
  /** Nur Icon, kein Text */
  iconOnly?: boolean;
  onClick?: () => void;
  className?: string;
  href?: string;
}

export default function PdrTechButton({
  label = 'PDR-Techniker',
  sublabel,
  active = false,
  iconSize = 36,
  iconOnly = false,
  onClick,
  className,
}: PdrTechButtonProps) {

  const base = cn(
    'inline-flex items-center gap-2.5 rounded-xl transition-all duration-200 cursor-pointer select-none',
    'border bg-gradient-to-br from-[#1e3a5f] to-[#0f1e35]',
    'shadow-md hover:shadow-amber-400/20 hover:-translate-y-0.5',
    iconOnly
      ? 'p-1.5 border-amber-400/30 hover:border-amber-400/70'
      : 'px-4 py-2.5 border-amber-400/30 hover:border-amber-400/60',
    active && [
      'border-amber-400/80',
      'shadow-[0_0_0_3px_rgba(245,158,11,0.18),0_4px_20px_rgba(245,158,11,0.25)]',
    ],
    className
  );

  return (
    <button type="button" onClick={onClick} className={base}>
      <Image
        src="/icons/pdr-tech-icon.svg"
        alt="PDR Techniker"
        width={iconSize}
        height={iconSize}
        unoptimized
        className="flex-shrink-0 rounded-lg"
      />
      {!iconOnly && (
        <div className="leading-tight text-left">
          <span className="block text-sm font-bold text-slate-100">{label}</span>
          {sublabel && (
            <span className="block text-[11px] text-amber-400/80 font-medium">{sublabel}</span>
          )}
        </div>
      )}
    </button>
  );
}

import React from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const styles: Record<Variant, string> = {
  default: 'bg-[#C84B31]/15 text-[#F87171] border-[#C84B31]/40',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  danger: 'bg-red-500/15 text-red-400 border-red-500/40',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
  neutral: 'bg-[#3F3A36] text-[#A89F91] border-[#5C544D]',
};

export function Badge({
  children,
  variant = 'default',
  className = '',
  style,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${styles[variant]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

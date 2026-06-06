import type { ReactNode } from 'react';

interface SectionHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}

/**
 * Title block used at the top of a `SectionCard`. The icon colour is left
 * to the caller (default convention: `text-primary`).
 */
export function SectionHeader({ icon, title, subtitle, trailing }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {icon}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-widest">
            {subtitle}
          </p>
        )}
      </div>
      {trailing && <div className="ml-auto">{trailing}</div>}
    </div>
  );
}

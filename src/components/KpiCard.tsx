import type { ReactNode } from 'react';

export type KpiAccent = 'primary' | 'tertiary' | 'terracotta';

interface KpiCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  hint?: string;
  accent?: KpiAccent;
  /**
   * When true, the value falls back to an em-dash. The `hint` is still
   * rendered (callers usually pass an "empty-state" hint in that case).
   */
  empty?: boolean;
  /**
   * Optional slot for a custom readout below the value (e.g. a sparkline
   * or a bar chart). When provided, the default hint slot is replaced
   * with a free-form area.
   */
  children?: ReactNode;
}

const ACCENT_TEXT: Record<KpiAccent, string> = {
  primary: 'text-primary',
  tertiary: 'text-tertiary',
  terracotta: 'text-terracotta',
};

/**
 * Single source of truth for the dashboard / performance KPI card.
 * Promoted from the local `Kpi` component that lived in `PerformanceScreen`
 * — the dashboard now uses the same component for all 5 of its cards.
 */
export function KpiCard({
  label,
  value,
  icon,
  hint,
  accent = 'primary',
  empty = false,
  children,
}: KpiCardProps) {
  const displayValue = empty ? '—' : value;
  const accentText = ACCENT_TEXT[accent];
  return (
    <div className="bg-surface-container-high p-6 border border-outline-variant rounded flex flex-col justify-between min-h-[160px]">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
            {label}
          </span>
          <span className={accentText}>{icon}</span>
        </div>
        <div className="text-4xl font-bold text-on-surface mb-2 tracking-tighter">
          {displayValue}
        </div>
      </div>
      {children ??
        (hint && (
          <div className="text-sm font-medium text-on-surface-variant mt-4">
            {hint}
          </div>
        ))}
    </div>
  );
}

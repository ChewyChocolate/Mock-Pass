import { didPass } from '../data/questions';

/**
 * 3-tier text color used in tables, lists, and KPIs (tertiary ≥80,
 * primary ≥60, error otherwise). Returns a Tailwind class string.
 */
export function pctColorClass(pct: number): string {
  if (pct >= 80) return 'text-tertiary';
  if (pct >= 60) return 'text-primary';
  return 'text-error';
}

/**
 * 3-tier dot color used in compact session lists and chips.
 * Includes a glow shadow that matches the color tier.
 */
export function dotColorClass(pct: number): string {
  if (pct >= 80) return 'bg-tertiary shadow-[0_0_8px_rgba(78,222,163,0.5)]';
  if (pct >= 60) return 'bg-primary shadow-[0_0_8px_rgba(190,198,224,0.5)]';
  return 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]';
}

/**
 * 2-tier bar/text color used for binary pass/fail readouts (progress bars,
 * topic mastery rows). Cuts at `PASSING_SCORE` — no "okay but not great"
 * middle tier. Returns a Tailwind class string.
 */
export function pctBarClass(pct: number): string {
  return didPass(pct) ? 'bg-primary' : 'bg-error';
}

export function pctBarTextClass(pct: number): string {
  return didPass(pct) ? 'text-primary' : 'text-error';
}

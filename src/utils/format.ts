export interface DateFormatOptions {
  includeYear?: boolean;
  includeTime?: boolean;
}

const BASE_DATE_OPTS: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

/**
 * Format a millisecond timestamp for human display.
 * Defaults to "Mon D" (e.g. "Jun 6"); pass `includeYear: true` for "Mon D, YYYY".
 * The `formatTime` clock format is always `HH:MM:SS` and is reserved for
 * countdown/timer use only.
 */
export function formatDate(
  ts: number,
  { includeYear = false, includeTime = false }: DateFormatOptions = {},
): string {
  const opts: Intl.DateTimeFormatOptions = {
    ...BASE_DATE_OPTS,
    ...(includeYear ? { year: 'numeric' as const } : {}),
    ...(includeTime
      ? { hour: '2-digit' as const, minute: '2-digit' as const, hour12: false }
      : {}),
  };
  return new Date(ts).toLocaleDateString('en-US', opts);
}

/**
 * Format a duration in seconds as `HH:MM:SS` (zero-padded).
 * Use for live timers and the review screen's per-question readout.
 */
export function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Format a duration in seconds as a compact "Xh Ym" / "Xm" string.
 * Use for read-only labels like dashboard and exam-intro cards.
 */
export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/**
 * Format a duration in seconds as `HH:MM:SS` (dropping the hour when 0).
 * Use for total-time readouts (e.g. "1:23:45" / "12:34").
 */
export function formatDurationLong(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

/**
 * Format a duration in seconds as a short `Xm` / `Xh` value. Hides minutes
 * when an hour boundary falls exactly on the hour.
 */
export function formatHours(totalSeconds: number): string {
  return `${(totalSeconds / 3600).toFixed(1)}h`;
}

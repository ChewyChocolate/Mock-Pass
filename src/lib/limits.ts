/**
 * Centralized "how many / how long / how often" tunables. All numbers that
 * control UI window sizes, retention caps, or warning thresholds live here
 * so a product change is a one-line edit, not a grep.
 */
export const LIMITS = {
  /** Seconds-remaining threshold for the "low time" header warning. */
  lowTimeSeconds: 300,
  /** Rolling window for the dashboard "Weekly Goal" KPI. */
  weeklyGoalDays: 7,
  /** Sessions target per weekly window. */
  weeklyGoalSessions: 3,
  /** Local-only history cap (Supabase stores everything; this trims the local cache). */
  maxLocalHistory: 20,
  /** Hard cap on the streak lookback loop in `computePerformanceStats`. */
  maxStreakDays: 365,
  /** "Recent" window for the trend delta and the "last N exams" hint. */
  recentWindow: 3,
  /** Points rendered on the performance trend chart. */
  trendWindow: 12,
  /** Rows shown in the dashboard's "Recent Activity" table. */
  recentActivityRows: 5,
  /** Number of nav items rendered in the top mobile bar. */
  topNavCount: 2,
} as const;

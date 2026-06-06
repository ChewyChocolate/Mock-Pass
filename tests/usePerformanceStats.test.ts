import { describe, expect, it } from 'vitest';
import type { ExamSessionSummary } from '../src/types';
import { computePerformanceStats } from '../src/hooks/usePerformanceStats';
import { PASSING_SCORE } from '../src/data/questions';

const DAY = 24 * 60 * 60 * 1000;
const TODAY = new Date('2026-06-06T12:00:00Z').getTime();

function makeSession(
  id: string,
  score: number,
  daysAgo: number,
  topicStats: Record<string, { correct: number; total: number }> = {},
  timeSpentSeconds = 600,
  level: 'professional' | 'sub-professional' = 'professional',
  totalQuestions = 150,
): ExamSessionSummary {
  return {
    id,
    level,
    startedAt: TODAY - daysAgo * DAY - timeSpentSeconds * 1000,
    submittedAt: TODAY - daysAgo * DAY,
    totalQuestions,
    correct: Math.round((score / 100) * totalQuestions),
    score,
    timeSpentSeconds,
    topicStats,
  };
}

describe('computePerformanceStats', () => {
  it('returns an empty/default state when history is empty', () => {
    const r = computePerformanceStats([]);
    expect(r.hasHistory).toBe(false);
    expect(r.average).toBe(0);
    expect(r.best).toBe(0);
    expect(r.passRate).toBe(0);
    expect(r.totalExams).toBe(0);
    expect(r.streak).toBe(0);
    expect(r.topicMastery).toEqual([]);
    expect(r.levelBreakdown).toEqual([]);
    expect(r.trend).toEqual([]);
  });

  it('computes average, best, passRate, totalExams', () => {
    const r = computePerformanceStats([
      makeSession('a', 60, 0),
      makeSession('b', 80, 1),
      makeSession('c', 90, 2),
    ]);
    expect(r.average).toBe(77); // (60+80+90)/3 = 76.67 → 77
    expect(r.best).toBe(90);
    expect(r.passRate).toBe(67); // 2 of 3 passed (>= 80)
    expect(r.totalExams).toBe(3);
  });

  it('counts only scores >= PASSING_SCORE toward the pass rate', () => {
    const r = computePerformanceStats([
      makeSession('a', PASSING_SCORE, 0), // pass (boundary)
      makeSession('b', PASSING_SCORE - 1, 1), // fail
      makeSession('c', 100, 2),
      makeSession('d', 0, 3),
    ]);
    expect(r.passRate).toBe(50);
  });

  it('aggregates totalSeconds and totalHours from history', () => {
    const r = computePerformanceStats([
      makeSession('a', 50, 0, {}, 600),
      makeSession('b', 70, 1, {}, 1200),
      makeSession('c', 90, 2, {}, 1800),
    ]);
    expect(r.totalSeconds).toBe(3600);
    expect(r.totalHours).toBe('1.0');
  });

  it('computes recentAvg over the last 3 sessions and the trend delta', () => {
    const r = computePerformanceStats([
      makeSession('a', 90, 0),
      makeSession('b', 80, 1),
      makeSession('c', 70, 2),
      makeSession('d', 50, 3),
    ]);
    // recent (last 3) = 90, 80, 70 → 80; overall = (90+80+70+50)/4 = 72.5 → 73
    expect(r.recentAvg).toBe(80);
    expect(r.average).toBe(73);
    expect(r.trendDelta).toBe(7);
  });

  it('falls back to overall average when fewer than 3 sessions', () => {
    const r = computePerformanceStats([makeSession('a', 60, 0), makeSession('b', 80, 1)]);
    expect(r.recentAvg).toBe(70);
    expect(r.trendDelta).toBe(0);
  });

  it('aggregates topic mastery across all sessions, sorted by total', () => {
    const r = computePerformanceStats([
      makeSession('a', 80, 0, {
        Verbal: { correct: 10, total: 20 },
        Numerical: { correct: 5, total: 10 },
      }),
      makeSession('b', 90, 1, {
        Verbal: { correct: 18, total: 20 },
        Numerical: { correct: 9, total: 10 },
      }),
    ]);
    const mastery = r.topicMastery;
    expect(mastery).toHaveLength(2);
    const verbal = mastery.find((m) => m.topic === 'Verbal')!;
    expect(verbal.correct).toBe(28);
    expect(verbal.total).toBe(40);
    expect(verbal.pct).toBe(70);
    const numerical = mastery.find((m) => m.topic === 'Numerical')!;
    expect(numerical.correct).toBe(14);
    expect(numerical.total).toBe(20);
    expect(numerical.pct).toBe(70);
  });

  it('breaks down by level and filters empty levels', () => {
    const r = computePerformanceStats([
      makeSession('a', 80, 0, {}, 600, 'professional'),
      makeSession('b', 90, 1, {}, 600, 'professional'),
      makeSession('c', 70, 2, {}, 600, 'sub-professional'),
    ]);
    const pro = r.levelBreakdown.find((x) => x.level === 'professional')!;
    expect(pro.exams).toBe(2);
    expect(pro.avg).toBe(85);
    const sub = r.levelBreakdown.find((x) => x.level === 'sub-professional')!;
    expect(sub.exams).toBe(1);
    expect(sub.avg).toBe(70);
  });

  it('returns at most 12 trend points', () => {
    const history = Array.from({ length: 20 }, (_, i) => makeSession(`s${i}`, 50 + i, i));
    const r = computePerformanceStats(history);
    expect(r.trend).toHaveLength(12);
    expect(r.trend[0]).toEqual({ ts: history[0]!.submittedAt, score: 50 });
  });

  it('counts a multi-day study streak correctly', () => {
    // 5 sessions on 5 consecutive days, then a 3-day gap, then another session
    const r = computePerformanceStats([
      makeSession('a', 80, 0),
      makeSession('b', 70, 1),
      makeSession('c', 60, 2),
      makeSession('d', 50, 3),
      makeSession('e', 90, 4),
      makeSession('f', 75, 8), // gap day 5/6/7
    ]);
    // The streak counts backwards from today as long as each day has a session.
    // Today=0, -1, -2, -3, -4 → 5; -5 has no session, so streak ends at 5.
    expect(r.streak).toBe(5);
  });

  it('returns a streak of 1 when only today has a session', () => {
    const r = computePerformanceStats([makeSession('a', 80, 0)]);
    expect(r.streak).toBe(1);
  });

  it('returns a streak of 0 when no session was taken today or yesterday', () => {
    const r = computePerformanceStats([makeSession('a', 80, 2)]);
    expect(r.streak).toBe(0);
  });
});

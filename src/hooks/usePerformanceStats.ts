import { useMemo } from 'react';
import type { ExamLevel, ExamSessionSummary } from '../types';
import { PASSING_SCORE } from '../data/questions';

export interface TopicMasteryRow {
  topic: string;
  correct: number;
  total: number;
  pct: number;
}

export interface LevelBreakdownRow {
  level: ExamLevel;
  exams: number;
  avg: number;
}

export interface TrendPoint {
  ts: number;
  score: number;
}

export interface PerformanceStats {
  hasHistory: boolean;
  average: number;
  best: number;
  passRate: number;
  totalSeconds: number;
  totalExams: number;
  streak: number;
  totalHours: string;
  recentAvg: number;
  trendDelta: number;
  topicMastery: TopicMasteryRow[];
  levelBreakdown: LevelBreakdownRow[];
  trend: TrendPoint[];
}

const EMPTY: PerformanceStats = {
  hasHistory: false,
  average: 0,
  best: 0,
  passRate: 0,
  totalSeconds: 0,
  totalExams: 0,
  streak: 0,
  totalHours: '0.0',
  recentAvg: 0,
  trendDelta: 0,
  topicMastery: [],
  levelBreakdown: [],
  trend: [],
};

/**
 * Pure aggregator — easy to test without a React renderer. The
 * `usePerformanceStats` hook below is a thin memoization wrapper.
 */
export function computePerformanceStats(history: ExamSessionSummary[]): PerformanceStats {
  if (history.length === 0) return EMPTY;

  const totalExams = history.length;
  const average = Math.round(history.reduce((a, s) => a + s.score, 0) / totalExams);
  const best = Math.max(...history.map((s) => s.score));
  const passed = history.filter((s) => s.score >= PASSING_SCORE).length;
  const passRate = Math.round((passed / totalExams) * 100);
  const totalSeconds = history.reduce((a, s) => a + s.timeSpentSeconds, 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  const days = new Set(history.map((s) => new Date(s.submittedAt).toDateString()));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) {
      streak += 1;
    } else if (i > 0) {
      break;
    }
  }

  const recentAvg =
    history.length >= 3
      ? Math.round(history.slice(0, 3).reduce((a, s) => a + s.score, 0) / 3)
      : average;
  const trendDelta = recentAvg - average;

  const topicMap = new Map<string, { correct: number; total: number }>();
  for (const s of history) {
    for (const [topic, stat] of Object.entries(s.topicStats)) {
      const entry = topicMap.get(topic) ?? { correct: 0, total: 0 };
      entry.correct += stat.correct;
      entry.total += stat.total;
      topicMap.set(topic, entry);
    }
  }
  const topicMastery = Array.from(topicMap.entries())
    .map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      pct: total === 0 ? 0 : Math.round((correct / total) * 100),
    }))
    .sort((a, b) => b.total - a.total);

  const byLevel: Record<ExamLevel, { exams: number; scoreSum: number }> = {
    professional: { exams: 0, scoreSum: 0 },
    'sub-professional': { exams: 0, scoreSum: 0 },
  };
  for (const s of history) {
    const entry = byLevel[s.level];
    entry.exams += 1;
    entry.scoreSum += s.score;
  }
  const levelBreakdown = (Object.entries(byLevel) as [ExamLevel, { exams: number; scoreSum: number }][])
    .map(([level, { exams, scoreSum }]) => ({
      level,
      exams,
      avg: exams === 0 ? 0 : Math.round(scoreSum / exams),
    }))
    .filter((row) => row.exams > 0);

  const trend = history.slice(0, 12).map((s) => ({ ts: s.submittedAt, score: s.score }));

  return {
    hasHistory: true,
    average,
    best,
    passRate,
    totalSeconds,
    totalExams,
    streak,
    totalHours,
    recentAvg,
    trendDelta,
    topicMastery,
    levelBreakdown,
    trend,
  };
}

/**
 * Single source of truth for everything the dashboard KPIs and the
 * performance page need. Both pages call this with `state.history` so
 * the numbers cannot drift.
 */
export function usePerformanceStats(history: ExamSessionSummary[]): PerformanceStats {
  return useMemo(() => computePerformanceStats(history), [history]);
}

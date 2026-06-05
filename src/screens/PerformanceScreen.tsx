import React, { useMemo } from 'react';
import { BaseScreenProps } from '../types';
import MainLayout from '../components/MainLayout';
import {
  TrendingUp,
  Trophy,
  Timer,
  Target,
  Flame,
  Award,
  BarChart3,
} from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { PASSING_SCORE } from '../data/questions';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function pctColorClass(pct: number) {
  if (pct >= 80) return 'text-tertiary';
  if (pct >= 60) return 'text-primary';
  return 'text-error';
}

interface KpiProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
  accent?: 'primary' | 'tertiary' | 'terracotta';
}

function Kpi({ label, value, icon, hint, accent = 'primary' }: KpiProps) {
  const accentText = {
    primary: 'text-primary',
    tertiary: 'text-tertiary',
    terracotta: 'text-terracotta',
  }[accent];
  return (
    <div className="bg-surface-container-high p-6 border border-outline-variant rounded flex flex-col justify-between min-h-[150px]">
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
            {label}
          </span>
          <span className={accentText}>{icon}</span>
        </div>
        <div className="text-3xl md:text-4xl font-bold text-on-surface tracking-tighter">
          {value}
        </div>
      </div>
      {hint && (
        <div className="text-xs text-on-surface-variant mt-3 font-medium">{hint}</div>
      )}
    </div>
  );
}

function ScoreTrendChart({ points }: { points: { ts: number; score: number }[] }) {
  if (points.length === 0) return null;
  const W = 600;
  const H = 200;
  const padX = 32;
  const padY = 24;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const sorted = [...points].sort((a, b) => a.ts - b.ts);
  const xStep = sorted.length > 1 ? innerW / (sorted.length - 1) : 0;

  const toX = (i: number) => padX + i * xStep;
  const toY = (score: number) => padY + innerH - (score / 100) * innerH;

  const linePath = sorted
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.score).toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${toX(sorted.length - 1).toFixed(1)} ${(padY + innerH).toFixed(1)} L ${padX} ${(padY + innerH).toFixed(1)} Z`;

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Score trend over time"
    >
      {yTicks.map((t) => (
        <g key={t}>
          <line
            x1={padX}
            x2={W - padX}
            y1={toY(t)}
            y2={toY(t)}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeDasharray="2 4"
          />
          <text
            x={padX - 8}
            y={toY(t) + 3}
            textAnchor="end"
            fontSize="9"
            fill="currentColor"
            opacity="0.5"
            fontFamily="JetBrains Mono"
          >
            {t}
          </text>
        </g>
      ))}
      <line
        x1={padX}
        x2={W - padX}
        y1={toY(PASSING_SCORE)}
        y2={toY(PASSING_SCORE)}
        stroke="var(--color-tertiary)"
        strokeOpacity="0.6"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />
      <text
        x={W - padX}
        y={toY(PASSING_SCORE) - 4}
        textAnchor="end"
        fontSize="9"
        fill="var(--color-tertiary)"
        fontFamily="JetBrains Mono"
        fontWeight="700"
      >
        PASS
      </text>

      <path d={areaPath} fill="var(--color-primary)" opacity="0.08" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {sorted.map((p, i) => (
        <g key={i}>
          <circle
            cx={toX(i)}
            cy={toY(p.score)}
            r="4"
            fill="var(--color-primary)"
            stroke="var(--color-surface)"
            strokeWidth="2"
          />
          <text
            x={toX(i)}
            y={H - 4}
            textAnchor="middle"
            fontSize="9"
            fill="currentColor"
            opacity="0.5"
            fontFamily="JetBrains Mono"
          >
            {formatDate(p.ts)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function PerformanceScreen({ onNavigate }: BaseScreenProps) {
  const { state, reset } = useExam();
  const history = state.history;
  const hasHistory = history.length > 0;

  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        average: 0,
        best: 0,
        passRate: 0,
        totalSeconds: 0,
        totalExams: 0,
        streak: 0,
      };
    }
    const totalExams = history.length;
    const average = Math.round(history.reduce((a, s) => a + s.score, 0) / totalExams);
    const best = Math.max(...history.map((s) => s.score));
    const passed = history.filter((s) => s.score >= PASSING_SCORE).length;
    const passRate = Math.round((passed / totalExams) * 100);
    const totalSeconds = history.reduce((a, s) => a + s.timeSpentSeconds, 0);

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

    return { average, best, passRate, totalSeconds, totalExams, streak };
  }, [history]);

  const trend = useMemo(
    () => history.slice(0, 12).map((s) => ({ ts: s.submittedAt, score: s.score })),
    [history],
  );

  const topicMastery = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();
    for (const s of history) {
      const session = s as typeof s & { topicStats?: Record<string, { correct: number; total: number }> };
    }
    const last = history[0];
    if (!last) return [];
    const rows: { topic: string; pct: number; correct: number; total: number }[] = [];
    return rows;
  }, [history]);

  const totalHours = (stats.totalSeconds / 3600).toFixed(1);
  const recentAvg =
    history.length >= 3
      ? Math.round(history.slice(0, 3).reduce((a, s) => a + s.score, 0) / 3)
      : stats.average;
  const trendDelta = recentAvg - stats.average;

  return (
    <MainLayout onNavigate={onNavigate} currentScreen="performance">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-2">
              Performance
            </h1>
            <p className="text-base text-on-surface-variant">
              Track your progress, identify weak areas, and prepare smarter.
            </p>
          </div>
          {hasHistory && (
            <button
              onClick={() => {
                reset();
                onNavigate('dashboard');
              }}
              className="bg-primary text-on-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded whitespace-nowrap"
            >
              Take Another Exam
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Kpi
            label="Average Score"
            value={hasHistory ? `${stats.average}%` : '—'}
            icon={<TrendingUp className="w-5 h-5" />}
            hint={
              hasHistory
                ? `Last 3 exams: ${recentAvg}% (${trendDelta >= 0 ? '+' : ''}${trendDelta})`
                : 'No data yet'
            }
            accent="primary"
          />
          <Kpi
            label="Best Score"
            value={hasHistory ? `${stats.best}%` : '—'}
            icon={<Trophy className="w-5 h-5" />}
            hint={hasHistory ? `${stats.totalExams} ${stats.totalExams === 1 ? 'session' : 'sessions'} total` : 'No data yet'}
            accent="tertiary"
          />
          <Kpi
            label="Pass Rate"
            value={hasHistory ? `${stats.passRate}%` : '—'}
            icon={<Target className="w-5 h-5" />}
            hint={hasHistory ? `Passing threshold: ${PASSING_SCORE}%` : 'No data yet'}
            accent={hasHistory && stats.passRate >= 50 ? 'tertiary' : 'terracotta'}
          />
          <Kpi
            label="Study Streak"
            value={hasHistory ? `${stats.streak} day${stats.streak === 1 ? '' : 's'}` : '—'}
            icon={<Flame className="w-5 h-5" />}
            hint={hasHistory ? `${totalHours}h total study time` : 'No data yet'}
            accent="terracotta"
          />
        </div>

        <section className="bg-surface-container-low border border-outline-variant rounded p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Score Trend
              </h2>
              <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-widest">
                Last {Math.min(history.length, 12)} sessions
              </p>
            </div>
            {hasHistory && (
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
                  Hours Studied
                </p>
                <p className="font-mono text-xl font-bold text-on-surface">{totalHours}h</p>
              </div>
            )}
          </div>

          {!hasHistory ? (
            <div className="py-16 text-center">
              <BarChart3 className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
              <p className="text-on-surface-variant mb-1">No sessions yet</p>
              <p className="text-sm text-on-surface-variant opacity-70 mb-6">
                Take a few mock exams to see your score trend.
              </p>
              <button
                onClick={() => onNavigate('dashboard')}
                className="bg-primary text-on-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded"
              >
                Start a Mock Exam
              </button>
            </div>
          ) : (
            <ScoreTrendChart points={trend} />
          )}
        </section>

        <section className="bg-surface-container-low border border-outline-variant rounded p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Recent Performance
              </h2>
              <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-widest">
                Your last 5 attempts
              </p>
            </div>
          </div>
          {hasHistory ? (
            <ul className="divide-y divide-outline-variant/30">
              {history.slice(0, 5).map((s, i) => (
                <li
                  key={s.id}
                  className="py-4 flex items-center gap-4 hover:bg-surface-variant/30 transition-colors px-2 -mx-2 rounded cursor-pointer"
                  onClick={() => onNavigate('review')}
                >
                  <div className="text-xs font-mono font-bold text-on-surface-variant w-8">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Mock Exam · {s.totalQuestions} items</p>
                    <p className="text-xs text-on-surface-variant">{formatDate(s.submittedAt)}</p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs text-on-surface-variant">Correct</span>
                    <span className="text-sm font-mono font-bold text-on-surface">
                      {s.correct}/{s.totalQuestions}
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold font-mono ${pctColorClass(s.score)}`}
                  >
                    {s.score}%
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-on-surface-variant text-sm">No exam history available.</p>
          )}
        </section>

        {hasHistory && (
          <section className="bg-surface-container-low border border-outline-variant rounded p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Timer className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Time Analytics</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 border border-outline-variant rounded">
                <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">
                  Total Time
                </p>
                <p className="text-2xl font-bold font-mono text-on-surface">
                  {Math.floor(stats.totalSeconds / 60)}m
                </p>
              </div>
              <div className="p-4 border border-outline-variant rounded">
                <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">
                  Avg per Session
                </p>
                <p className="text-2xl font-bold font-mono text-on-surface">
                  {Math.round(stats.totalSeconds / stats.totalExams / 60)}m
                </p>
              </div>
              <div className="p-4 border border-outline-variant rounded">
                <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">
                  Fastest Session
                </p>
                <p className="text-2xl font-bold font-mono text-on-surface">
                  {Math.round(Math.min(...history.map((s) => s.timeSpentSeconds)) / 60)}m
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}

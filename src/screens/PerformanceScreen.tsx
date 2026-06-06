import React from 'react';
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
import { usePerformanceStats } from '../hooks/usePerformanceStats';

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
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
  const stats = usePerformanceStats(history);
  const hasHistory = stats.hasHistory;

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
                ? `Last 3 exams: ${stats.recentAvg}% (${stats.trendDelta >= 0 ? '+' : ''}${stats.trendDelta})`
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
            hint={hasHistory ? `${stats.totalHours}h total study time` : 'No data yet'}
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
                <p className="font-mono text-xl font-bold text-on-surface">{stats.totalHours}h</p>
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
            <ScoreTrendChart points={stats.trend} />
          )}
        </section>

        {hasHistory && stats.topicMastery.length > 0 && (
          <section className="bg-surface-container-low border border-outline-variant rounded p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Topic Mastery</h2>
            </div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-6">
              Aggregated across all sessions
            </p>
            <div className="space-y-5">
              {stats.topicMastery.map((row) => {
                const good = row.pct >= 80;
                return (
                  <div key={row.topic}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{row.topic}</span>
                      <span className={`text-xs font-bold ${good ? 'text-primary' : 'text-error'}`}>
                        {row.pct}% · {row.correct}/{row.total}
                      </span>
                    </div>
                    <div className="h-1.5 bg-outline-variant rounded-full overflow-hidden">
                      <div
                        className={`h-full ${good ? 'bg-primary' : 'bg-error'}`}
                        style={{ width: `${row.pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {hasHistory && stats.levelBreakdown.length > 1 && (
          <section className="bg-surface-container-low border border-outline-variant rounded p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">Performance by Level</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.levelBreakdown.map((row) => (
                <div key={row.level} className="p-5 border border-outline-variant rounded">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">
                    {row.level === 'sub-professional' ? 'Sub-Professional' : 'Professional'}
                  </p>
                  <p className="text-3xl font-bold text-on-surface mb-1">{row.avg}%</p>
                  <p className="text-xs text-on-surface-variant">
                    {row.exams} {row.exams === 1 ? 'session' : 'sessions'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

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

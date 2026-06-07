import React, { useMemo } from 'react';
import { BaseScreenProps, ExamLevel, LEVEL_LABELS } from '../types';
import MainLayout from '../components/MainLayout';
import { KpiCard } from '../components/KpiCard';
import RecentSessionList from '../components/RecentSessionList';
import {
  TrendingUp,
  Timer,
  Trophy,
  Target,
  Flame,
  FileEdit,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Check,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import {
  PRO_DURATION_SECONDS,
  SUB_PRO_DURATION_SECONDS,
  PROFESSIONAL_QUESTION_COUNT,
  PROFESSIONAL_SECTIONS,
  SUB_PROFESSIONAL_QUESTION_COUNT,
  PASSING_SCORE,
} from '../data/questions';
import { usePerformanceStats } from '../hooks/usePerformanceStats';
import { formatDuration, formatHours } from '../utils/format';
import { LIMITS } from '../lib/limits';

type LevelOption = {
  id: ExamLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
  questions: number;
  durationSeconds: number;
  topics: { name: string; weight?: number; count?: number }[];
  available: boolean;
  badge?: string;
};

const LEVEL_OPTIONS: LevelOption[] = [
  {
    id: 'sub-professional',
    label: LEVEL_LABELS['sub-professional'],
    description: 'For first-level government positions. Clerical and basic office skills focus.',
    icon: <BookOpen className="w-5 h-5" />,
    questions: SUB_PROFESSIONAL_QUESTION_COUNT,
    durationSeconds: SUB_PRO_DURATION_SECONDS,
    topics: [
      { name: 'Verbal Ability' },
      { name: 'Numerical Ability' },
      { name: 'Clerical Ability' },
    ],
    available: false,
    badge: 'Coming Soon',
  },
  {
    id: 'professional',
    label: LEVEL_LABELS['professional'],
    description: `For second-level government positions. ${PROFESSIONAL_QUESTION_COUNT} items divided across 4 weighted sections.`,
    icon: <GraduationCap className="w-5 h-5" />,
    questions: PROFESSIONAL_QUESTION_COUNT,
    durationSeconds: PRO_DURATION_SECONDS,
    topics: PROFESSIONAL_SECTIONS.map((s) => ({
      name: s.topic,
      weight: s.weight,
      count: s.count,
    })),
    available: true,
  },
];

export default function DashboardScreen({ onNavigate }: BaseScreenProps) {
  const { state, setLevel, start } = useExam();
  const { user } = useAuth();
  const history = state.history;
  const stats = usePerformanceStats(history);

  const lastSevenDays = useMemo(() => {
    const cutoff = Date.now() - LIMITS.weeklyGoalDays * 24 * 60 * 60 * 1000;
    const recent = history.filter((s) => s.submittedAt >= cutoff);
    const progress = Math.min(100, Math.round((recent.length / LIMITS.weeklyGoalSessions) * 100));
    return { progress, sessions: recent.length };
  }, [history]);

  const displayName = useMemo(() => {
    const meta = user?.user_metadata as { full_name?: string; name?: string } | undefined;
    const fullName = (meta?.full_name ?? meta?.name ?? '').trim();
    if (!fullName) return null;
    return fullName.split(/\s+/)[0]?.slice(0, 30) || null;
  }, [user]);

  const hasHistory = stats.hasHistory;
  const inProgress = state.status === 'in-progress';

  const handleStart = () => {
    if (inProgress) {
      onNavigate('exam');
      return;
    }
    start();
    onNavigate('exam');
  };

  const handleSelectSession = () => {
    onNavigate('review');
  };

  return (
    <MainLayout onNavigate={onNavigate} currentScreen="dashboard">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 w-full">
        <section className="relative bg-primary-container rounded-lg overflow-hidden mb-12 border border-outline-variant/30 flex flex-col justify-center min-h-[280px]">
          <div className="p-8 md:p-12 relative z-20 w-full">
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4 tracking-tight">
              {displayName ? `Welcome back, ${displayName}!` : 'Welcome back!'}
            </h2>
            <p className="text-lg text-on-primary-container max-w-lg mb-8 leading-relaxed">
              {hasHistory
                ? `You've completed ${history.length} mock ${history.length === 1 ? 'exam' : 'exams'} so far. Keep the streak going.`
                : 'Your path to civil service excellence starts here. Take a mock exam to see your baseline score.'}
            </p>
            <div className="w-full max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                  Weekly Goal · {lastSevenDays.sessions}/{LIMITS.weeklyGoalSessions} sessions
                </span>
                <span className="text-xs font-bold text-primary">{lastSevenDays.progress}%</span>
              </div>
              <div className="step-indicator rounded-sm"></div>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary to-transparent blur-2xl pointer-events-none"></div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          <KpiCard
            label="Average Score"
            value={`${stats.average}%`}
            icon={<TrendingUp className="text-primary w-5 h-5" />}
            empty={!hasHistory}
          >
            <div className="h-10 flex items-end gap-1 opacity-80 mt-4">
              {hasHistory
                ? history
                    .slice(0, 5)
                    .reverse()
                    .map((s, i, arr) => {
                      const heightPct = Math.max(8, Math.min(100, s.score));
                      const recency = i / Math.max(1, arr.length - 1);
                      const opacity = 0.25 + recency * 0.75;
                      return (
                        <div
                          key={s.id}
                          className="flex-1 rounded-sm bg-primary"
                          style={{ height: `${heightPct}%`, opacity }}
                          title={`Session: ${s.score}%`}
                        ></div>
                      );
                    })
                : [0, 0, 0, 0, 0].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 opacity-50 rounded-sm"
                      style={{ height: '40%' }}
                    ></div>
                  ))}
            </div>
          </KpiCard>

          <KpiCard
            label="Best Score"
            value={`${stats.best}%`}
            icon={<Trophy className="text-tertiary w-5 h-5" />}
            accent="tertiary"
            empty={!hasHistory}
            hint={
              hasHistory
                ? `Across ${stats.totalExams} ${stats.totalExams === 1 ? 'session' : 'sessions'}`
                : 'No exams yet'
            }
          />

          <KpiCard
            label="Pass Rate"
            value={`${stats.passRate}%`}
            icon={<Target className="text-primary w-5 h-5" />}
            empty={!hasHistory}
            hint={
              hasHistory ? `Passing threshold: ${PASSING_SCORE}%` : 'No data yet'
            }
          />

          <KpiCard
            label="Study Streak"
            value={`${stats.streak}d`}
            icon={<Flame className="text-terracotta w-5 h-5" />}
            accent="terracotta"
            empty={!hasHistory}
            hint={hasHistory ? 'Consecutive practice days' : 'Take your first exam'}
          />

          <KpiCard
            label="Hours Studied"
            value={formatHours(stats.totalSeconds)}
            icon={<Timer className="text-primary w-5 h-5" />}
            empty={!hasHistory}
            hint={hasHistory ? 'Cumulative time on task' : 'Take your first exam'}
          />
        </div>

        <div className="mb-12 bg-surface border border-outline-variant rounded p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 opacity-5 group-hover:rotate-45 transition-transform duration-700 pointer-events-none">
            <FileEdit className="w-48 h-48 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2 tracking-tight">Full Mock Exam</h3>
          <p className="text-base text-on-surface-variant mb-6 max-w-xl">
            Choose the level that matches the position you&apos;re applying for, then start a timed, full-length simulation.
          </p>

          <fieldset className="mb-6" disabled={inProgress}>
            <legend className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3">
              Examination Level
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LEVEL_OPTIONS.map((opt) => {
                const selected = state.level === opt.id;
                const disabled = !opt.available || inProgress;
                return (
                  <label
                    key={opt.id}
                    className={`relative flex flex-col gap-2 p-5 border rounded-sm transition-all ${
                      disabled
                        ? 'cursor-not-allowed border-outline-variant/40 bg-surface-container-low/40 opacity-70'
                        : selected
                        ? 'cursor-pointer border-primary bg-secondary-container/40 ring-1 ring-primary'
                        : 'cursor-pointer border-outline-variant bg-surface-container-low hover:border-primary/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exam-level"
                      value={opt.id}
                      checked={selected}
                      disabled={disabled}
                      onChange={() => setLevel(opt.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            selected && !disabled
                              ? 'text-primary'
                              : 'text-on-surface-variant'
                          }
                        >
                          {opt.icon}
                        </span>
                        <span className="font-bold text-on-surface">{opt.label}</span>
                      </div>
                      {opt.badge ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest border border-terracotta/40 text-terracotta px-2 py-0.5 rounded-sm flex items-center gap-1">
                          {opt.id === 'sub-professional' ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          {opt.badge}
                        </span>
                      ) : selected ? (
                        <span className="w-5 h-5 bg-primary text-on-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {opt.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {opt.topics.map((t) => {
                        const label = t.weight
                          ? `${t.name} · ${Math.round(t.weight * 100)}%${t.count ? ` (${t.count})` : ''}`
                          : t.name;
                        return (
                          <span
                            key={t.name}
                            className="text-[10px] font-bold uppercase tracking-widest border border-outline-variant px-2 py-0.5 rounded-sm text-on-surface-variant"
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-on-surface-variant">
                      <span>
                        <strong className="text-on-surface">{opt.questions}</strong> questions
                      </span>
                      <span>·</span>
                      <span>
                        <strong className="text-on-surface">
                          {formatDuration(opt.durationSeconds)}
                        </strong>{' '}
                        duration
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            onClick={handleStart}
            disabled={!LEVEL_OPTIONS.find((o) => o.id === state.level)?.available}
            className="bg-primary text-on-primary px-8 py-3 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100"
          >
            {inProgress ? 'Resume Exam' : 'Start Simulation'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <section className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container/30">
            <h3 className="text-lg font-bold tracking-tight">Recent Activity</h3>
            {hasHistory && (
              <button
                onClick={() => onNavigate('review')}
                className="text-primary text-xs font-bold uppercase tracking-widest hover:underline"
              >
                View All
              </button>
            )}
          </div>
          <RecentSessionList
            sessions={history}
            variant="table"
            onSelect={handleSelectSession}
            emptyMessage="No exam history yet."
          />
        </section>
      </div>
    </MainLayout>
  );
}

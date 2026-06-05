import React, { useMemo } from 'react';
import { BaseScreenProps, ExamLevel } from '../types';
import MainLayout from '../components/MainLayout';
import {
  TrendingUp,
  ClipboardCheck,
  Timer,
  FileEdit,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Check,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useExam } from '../context/ExamContext';
import {
  PRO_DURATION_SECONDS,
  SUB_PRO_DURATION_SECONDS,
  PROFESSIONAL_QUESTION_COUNT,
  PROFESSIONAL_SECTIONS,
  SUB_PROFESSIONAL_QUESTION_COUNT,
} from '../data/questions';

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function dotColorClass(pct: number) {
  if (pct >= 80) return 'bg-tertiary shadow-[0_0_8px_rgba(78,222,163,0.5)]';
  if (pct >= 60) return 'bg-primary shadow-[0_0_8px_rgba(190,198,224,0.5)]';
  return 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]';
}

function pctColorClass(pct: number) {
  if (pct >= 80) return 'text-tertiary';
  if (pct >= 60) return 'text-primary';
  return 'text-error';
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

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
    label: 'Sub-Professional',
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
    label: 'Professional',
    description: 'For second-level government positions. 150 items divided across 4 weighted sections.',
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
  const history = state.history;

  const stats = useMemo(() => {
    if (history.length === 0) {
      return { averageScore: 0, totalQuizzes: 0, totalSeconds: 0 };
    }
    const averageScore = Math.round(
      history.reduce((acc, s) => acc + s.score, 0) / history.length,
    );
    const totalSeconds = history.reduce((acc, s) => acc + s.timeSpentSeconds, 0);
    return {
      averageScore,
      totalQuizzes: history.length,
      totalSeconds,
    };
  }, [history]);

  const totalHours = (stats.totalSeconds / 3600).toFixed(1);
  const lastSevenDays = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = history.filter((s) => s.submittedAt >= cutoff);
    const progress = Math.min(100, Math.round((recent.length / 3) * 100));
    return { progress, sessions: recent.length };
  }, [history]);

  const recentRows = history.slice(0, 5);
  const hasHistory = history.length > 0;
  const inProgress = state.status === 'in-progress';

  const handleStart = () => {
    if (inProgress) {
      onNavigate('exam');
      return;
    }
    start();
    onNavigate('exam');
  };

  return (
    <MainLayout onNavigate={onNavigate} currentScreen="dashboard">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 w-full">
        <section className="relative bg-primary-container rounded-lg overflow-hidden mb-12 border border-outline-variant/30 flex flex-col justify-center min-h-[280px]">
          <div className="p-8 md:p-12 relative z-20 w-full">
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4 tracking-tight">
              Welcome back, Alex!
            </h2>
            <p className="text-lg text-on-primary-container max-w-lg mb-8 leading-relaxed">
              {hasHistory
                ? `You've completed ${history.length} mock ${history.length === 1 ? 'exam' : 'exams'} so far. Keep the streak going.`
                : 'Your path to civil service excellence starts here. Take a mock exam to see your baseline score.'}
            </p>
            <div className="w-full max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                  Weekly Goal · {lastSevenDays.sessions}/3 sessions
                </span>
                <span className="text-xs font-bold text-primary">{lastSevenDays.progress}%</span>
              </div>
              <div className="step-indicator rounded-sm"></div>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary to-transparent blur-2xl pointer-events-none"></div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface-container-high p-6 border border-outline-variant rounded flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                  Average Score
                </span>
                <TrendingUp className="text-primary w-5 h-5" />
              </div>
              <div className="text-4xl font-bold text-on-surface mb-2 tracking-tighter">
                {hasHistory ? `${stats.averageScore}%` : '—'}
              </div>
            </div>
            <div className="h-10 flex items-end gap-1 opacity-80 mt-4">
              {(history.slice(0, 5).reverse().length
                ? history.slice(0, 5).reverse()
                : [0, 0, 0, 0, 0]
              ).map((s, i) => {
                const pct = typeof s === 'number' ? 0 : s.score;
                const heights = ['h-4', 'h-6', 'h-8', 'h-10', 'h-7'];
                const opacities = ['bg-primary/20', 'bg-primary/30', 'bg-primary/40', 'bg-primary', 'bg-primary/60'];
                return (
                  <div
                    key={i}
                    className={`flex-1 ${heights[i]} ${opacities[i]} ${
                      hasHistory ? '' : 'opacity-50'
                    }`}
                  ></div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-high p-6 border border-outline-variant rounded flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                  Exams Taken
                </span>
                <ClipboardCheck className="text-primary w-5 h-5" />
              </div>
              <div className="text-4xl font-bold text-on-surface mb-2 tracking-tighter">
                {stats.totalQuizzes}
              </div>
            </div>
            <div className="text-sm font-medium text-on-surface-variant mt-4">
              {hasHistory
                ? `Best score: ${Math.max(...history.map((s) => s.score))}%`
                : 'No exams yet'}
            </div>
          </div>

          <div className="bg-surface-container-high p-6 border border-outline-variant rounded flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                  Hours Studied
                </span>
                <Timer className="text-primary w-5 h-5" />
              </div>
              <div className="text-4xl font-bold text-on-surface mb-2 tracking-tighter">
                {hasHistory ? `${totalHours}h` : '0h'}
              </div>
            </div>
            <div className="text-sm font-medium text-on-surface-variant mt-4">
              {hasHistory
                ? `Across ${history.length} ${history.length === 1 ? 'session' : 'sessions'}`
                : 'Take your first exam'}
            </div>
          </div>
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

        <div
          onClick={() => onNavigate('review')}
          className="bg-surface p-8 border border-outline-variant rounded mb-12 relative overflow-hidden group hover:border-primary cursor-pointer transition-all active:scale-[0.98]"
        >
          <div className="absolute -right-8 -top-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <ClipboardCheck className="w-48 h-48 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3 tracking-tight">Review Results</h3>
          <p className="text-base text-on-surface-variant mb-8 max-w-sm">
            {hasHistory
              ? `See detailed breakdowns from your last exam and track progress.`
              : 'Take an exam first to unlock detailed review.'}
          </p>
          <div className="flex items-center gap-4 text-primary group-hover:translate-x-2 transition-transform duration-300">
            <span className="text-xs uppercase font-bold tracking-widest">View Report</span>
            <ArrowRight className="w-5 h-5" />
          </div>
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
          {!hasHistory ? (
            <div className="p-10 text-center">
              <p className="text-on-surface-variant mb-2">No exam history yet.</p>
              <p className="text-sm text-on-surface-variant opacity-70">
                Your completed mock exams will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/20 border-b border-outline-variant/50">
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                      Session
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                      Level
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                      Type
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                      Score
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {recentRows.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-surface-variant/30 transition-colors cursor-pointer"
                      onClick={() => onNavigate('review')}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${dotColorClass(s.score)}`}></div>
                          <span className="text-sm font-medium">
                            Mock Exam · {s.totalQuestions} items
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant capitalize">
                        {s.level === 'sub-professional' ? 'Sub-Pro' : 'Professional'}
                      </td>
                      <td className="px-6 py-5 text-sm text-on-surface-variant">Mock Exam</td>
                      <td className={`px-6 py-5 text-sm font-bold ${pctColorClass(s.score)}`}>
                        {s.score}%
                      </td>
                      <td className="px-6 py-5 text-xs text-on-surface-variant">
                        {formatDate(s.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

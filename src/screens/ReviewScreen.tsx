import { useMemo, useState } from 'react';
import { BaseScreenProps, LEVEL_LABELS } from '../types';
import MainLayout from '../components/MainLayout';
import { CheckCircle2, XCircle, BrainCircuit, ChevronDown, Filter, Scale } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import {
  PROFESSIONAL_SECTIONS,
  PROFESSIONAL_TOPIC_WEIGHTS,
  buildTopicStats,
  didPass,
} from '../data/questions';
import { formatDurationLong } from '../utils/format';
import { EmptyState } from '../components/EmptyState';
import { topicAccentBorderText } from '../utils/topicAccent';

type FilterMode = 'all' | 'incorrect' | 'flagged' | 'correct';

export default function ReviewScreen({ onNavigate }: BaseScreenProps) {
  const { state, score, correctCount, reset } = useExam();
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<FilterMode>('all');

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const visibleQuestions = useMemo(() => {
    return state.questions.filter((q) => {
      const answered = state.answers[q.id];
      const isCorrect = answered === q.correctOptionId;
      const isFlagged = state.flags[q.id] === true;
      if (filter === 'incorrect') return answered && !isCorrect;
      if (filter === 'flagged') return isFlagged;
      if (filter === 'correct') return isCorrect;
      return true;
    });
  }, [state.questions, state.answers, state.flags, filter]);

  const total = state.questions.length;
  const incorrectCount = total - correctCount;
  const unanswered = total - Object.keys(state.answers).length;
  const timeSpent =
    state.startedAt && state.submittedAt
      ? Math.floor((state.submittedAt - state.startedAt) / 1000)
      : 0;
  const passed = didPass(score);

  const topicBreakdown = useMemo(() => {
    const stats = buildTopicStats(state.questions, state.answers);
    return Object.entries(stats).map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      pct: total === 0 ? 0 : Math.round((correct / total) * 100),
      weight: PROFESSIONAL_TOPIC_WEIGHTS[topic as keyof typeof PROFESSIONAL_TOPIC_WEIGHTS] ?? 0,
    }));
  }, [state.questions, state.answers]);

  const isProfessional = state.level === 'professional';
  const totalWeight = PROFESSIONAL_SECTIONS.reduce((sum, s) => sum + s.weight, 0);

  if (state.status !== 'submitted') {
    return (
      <MainLayout onNavigate={onNavigate} currentScreen="review">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">No exam results yet</h2>
          <p className="text-on-surface-variant mb-8">
            Submit an exam to see your detailed review here.
          </p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="bg-primary text-on-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout onNavigate={onNavigate} currentScreen="review">
      <div className="printable-report max-w-7xl mx-auto px-4 md:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-surface-container-low border border-outline-variant p-8 rounded relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant opacity-50">
                Report #{state.submittedAt ? new Date(state.submittedAt).getTime().toString().slice(-6) : '—'}
              </span>
            </div>

            <h2 className="text-xs uppercase font-bold tracking-widest text-on-surface-variant mb-2">
              Performance Summary
            </h2>
            <div className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-widest border border-primary/40 text-primary px-2 py-1 rounded-sm">
                {LEVEL_LABELS[state.level]}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="var(--color-outline-variant)"
                    strokeWidth="10"
                    className="opacity-30"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={passed ? 'var(--color-tertiary)' : 'var(--color-error)'}
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - score / 100)}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-on-surface tracking-tighter">
                    {score}
                    <span className="text-2xl text-on-surface-variant">%</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mt-1">
                    Final Score
                  </span>
                </div>
              </div>

              <div
                className={`w-full border py-3 px-6 flex items-center justify-center gap-3 rounded-sm ${
                  passed
                    ? 'bg-tertiary-container/40 border-tertiary/30'
                    : 'bg-error-container/40 border-error/30'
                }`}
              >
                {passed ? (
                  <CheckCircle2 className="text-tertiary w-5 h-5" />
                ) : (
                  <XCircle className="text-error w-5 h-5" />
                )}
                <span
                  className={`text-sm font-bold uppercase tracking-[0.2em] ${
                    passed ? 'text-tertiary' : 'text-error'
                  }`}
                >
                  {passed ? `Passed (${score}%)` : `Did not pass (${score}%)`}
                </span>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div className="flex justify-between items-center text-on-surface-variant border-b border-outline-variant/30 pb-3">
                <span className="text-xs font-semibold tracking-wide">Time Spent</span>
                <span className="text-sm font-mono text-on-surface">{formatDurationLong(timeSpent)}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant border-b border-outline-variant/30 pb-3">
                <span className="text-xs font-semibold tracking-wide">Correct</span>
                <span className="text-sm font-mono text-on-surface">
                  {correctCount}/{total}
                </span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant border-b border-outline-variant/30 pb-3">
                <span className="text-xs font-semibold tracking-wide">Incorrect</span>
                <span className="text-sm font-mono text-on-surface">{incorrectCount}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant pb-3">
                <span className="text-xs font-semibold tracking-wide">Unanswered</span>
                <span className="text-sm font-mono text-on-surface">{unanswered}</span>
              </div>
            </div>

            <button
              onClick={() => {
                reset();
                onNavigate('dashboard');
              }}
              className="w-full mt-8 bg-primary text-on-primary py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded"
            >
              Take Another Exam
            </button>
          </section>

          <section className="bg-surface-container-low border border-outline-variant p-8 rounded">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs uppercase font-bold tracking-widest text-on-surface-variant">
                Domain Proficiency
              </h3>
              {isProfessional && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
                  <Scale className="w-3 h-3" />
                  Weighted Sections
                </span>
              )}
            </div>
            <div className="space-y-6">
              {topicBreakdown.map((row) => {
                const good = didPass(row.pct);
                const weightPct = Math.round(row.weight * 100);
                return (
                  <div key={row.topic}>
                    <div className="flex justify-between mb-2 gap-2">
                      <span className="text-sm font-medium">{row.topic}</span>
                      <span className="text-xs font-mono text-on-surface-variant whitespace-nowrap">
                        {row.correct}/{row.total}
                        {isProfessional && weightPct > 0 && (
                          <span className="ml-2 text-on-surface-variant/70">
                            × {weightPct}%
                          </span>
                        )}
                        <span
                          className={`ml-3 font-bold ${good ? 'text-primary' : 'text-error'}`}
                        >
                          {row.pct}%
                        </span>
                      </span>
                    </div>
                    <div className="h-1 bg-outline-variant rounded-full overflow-hidden">
                      <div
                        className={`h-full ${good ? 'bg-primary' : 'bg-error'}`}
                        style={{ width: `${row.pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            {isProfessional && (
              <div className="mt-6 pt-6 border-t border-outline-variant/40 text-xs text-on-surface-variant leading-relaxed">
                <p>
                  Final score is the weighted sum of each section&apos;s accuracy.
                  Weights: Verbal {Math.round(PROFESSIONAL_TOPIC_WEIGHTS['Verbal Ability'] * 100)}%
                  · Analytical {Math.round(PROFESSIONAL_TOPIC_WEIGHTS['Analytical Reasoning'] * 100)}%
                  · Numerical {Math.round(PROFESSIONAL_TOPIC_WEIGHTS['Numerical Ability'] * 100)}%
                  · General {Math.round(PROFESSIONAL_TOPIC_WEIGHTS['General Information'] * 100)}%
                  (total {Math.round(totalWeight * 100)}%).
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-8">
          <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Review Workspace</h1>
              <p className="text-base text-on-surface-variant">
                Review your mistakes and detailed solutions below.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-primary text-on-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all rounded whitespace-nowrap"
            >
              Download Report
            </button>
          </div>

          <div className="no-print flex items-center gap-2 mb-6 flex-wrap">
            <Filter className="w-4 h-4 text-on-surface-variant" />
            {(['all', 'incorrect', 'flagged', 'correct'] as FilterMode[]).map((mode) => {
              const active = filter === mode;
              const count =
                mode === 'all'
                  ? total
                  : mode === 'incorrect'
                  ? incorrectCount
                  : mode === 'flagged'
                  ? Object.values(state.flags).filter(Boolean).length
                  : correctCount;
              return (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest border rounded-sm transition-colors ${
                    active
                      ? 'bg-primary text-on-primary border-primary'
                      : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
                  }`}
                >
                  {mode} ({count})
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            {visibleQuestions.length === 0 && (
              <EmptyState
                size="md"
                title="No questions match this filter."
                className="bg-surface-container-low border border-outline-variant rounded"
              />
            )}

            {visibleQuestions.map((q) => {
              const userAnswer = state.answers[q.id];
              const isCorrect = userAnswer === q.correctOptionId;
              const isFlagged = state.flags[q.id] === true;
              const wasAnswered = userAnswer !== undefined;
              const accent = isCorrect
                ? 'border-l-4 border-tertiary'
                : 'border-l-4 border-error';

              return (
                <div
                  key={q.id}
                  className="bg-surface-container-low border border-outline-variant rounded overflow-hidden"
                >
                  <div className={`p-6 md:p-8 ${accent}`}>
                    <div className="flex justify-between items-start mb-6 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                          {q.id.toUpperCase()} — {q.topic}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded-sm ${topicAccentBorderText(q.topic)}`}
                        >
                          {q.topic}
                        </span>
                        {isFlagged && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta border border-terracotta/30 px-2 py-0.5 rounded-sm">
                            Flagged
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          isCorrect ? 'text-tertiary' : wasAnswered ? 'text-error' : 'text-on-surface-variant'
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : wasAnswered ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-current" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-widest">
                          {isCorrect ? 'Correct' : wasAnswered ? 'Incorrect' : 'Skipped'}
                        </span>
                      </div>
                    </div>

                    <p className="text-lg font-medium leading-relaxed mb-8 text-on-surface">
                      {q.prompt}
                    </p>

                    <div className="grid gap-3 mb-8">
                      {q.options.map((opt) => {
                        const isUserAnswer = opt.id === userAnswer;
                        const isCorrectAnswer = opt.id === q.correctOptionId;
                        let cls =
                          'p-4 border border-outline-variant/50 rounded flex justify-between items-center';
                        if (isCorrectAnswer) {
                          cls =
                            'p-4 bg-tertiary-container/30 border-2 border-tertiary rounded flex justify-between items-center shadow-[0_0_15px_rgba(78,222,163,0.1)]';
                        } else if (isUserAnswer && !isCorrectAnswer) {
                          cls =
                            'p-4 bg-error-container/20 border-2 border-error rounded flex justify-between items-center shadow-[0_0_15px_rgba(255,180,171,0.1)]';
                        } else {
                          cls += ' opacity-70';
                        }
                        return (
                          <div key={opt.id} className={cls}>
                            <span
                              className={`text-base flex items-center gap-2 ${
                                isUserAnswer && !isCorrectAnswer
                                  ? 'font-medium text-error'
                                  : isCorrectAnswer
                                  ? 'font-medium text-on-surface'
                                  : ''
                              }`}
                            >
                              {isUserAnswer && !isCorrectAnswer && (
                                <XCircle className="w-4 h-4 opacity-50" />
                              )}
                              {opt.id}) {opt.text}
                            </span>
                            {isCorrectAnswer && (
                              <div className="flex items-center gap-2 text-xs font-bold text-tertiary uppercase tracking-widest">
                                Correct Choice
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-outline-variant/40 pt-4">
                      <button
                        onClick={() => toggleAccordion(q.id)}
                        aria-expanded={!!openAccordions[q.id]}
                        aria-controls={`solution-${q.id}`}
                        className="w-full flex items-center justify-between py-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                      >
                        <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4" />
                          Solution Breakdown
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-on-surface-variant transition-transform duration-300 ${
                            openAccordions[q.id] ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <div
                        id={`solution-${q.id}`}
                        role="region"
                        aria-label={`Solution for ${q.id}`}
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openAccordions[q.id] ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="p-4 bg-surface-variant/30 rounded text-sm text-on-surface-variant leading-relaxed border border-outline-variant/30">
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

import { useMemo } from 'react';
import { BaseScreenProps } from '../types';
import MainLayout from '../components/MainLayout';
import { TrendingUp, ClipboardCheck, Timer, FileEdit, ArrowRight } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { QUESTION_BANK } from '../data/questions';

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

export default function DashboardScreen({ onNavigate }: BaseScreenProps) {
  const { state, start } = useExam();
  const history = state.history;
  const totalQuestions = QUESTION_BANK.length;

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
    const target = totalQuestions * 3;
    const progress = Math.min(100, Math.round((recent.length / 3) * 100));
    return { progress, target, sessions: recent.length };
  }, [history, totalQuestions]);

  const recentRows = history.slice(0, 5);
  const hasHistory = history.length > 0;

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div
            onClick={() => {
              if (state.status !== 'in-progress') start();
              onNavigate('exam');
            }}
            className="bg-surface p-8 border border-outline-variant rounded relative overflow-hidden group hover:border-primary cursor-pointer transition-all active:scale-[0.98]"
          >
            <div className="absolute -right-8 -top-8 opacity-5 group-hover:rotate-45 transition-transform duration-700 pointer-events-none">
              <FileEdit className="w-48 h-48 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Full Mock Exam</h3>
            <p className="text-base text-on-surface-variant mb-8 max-w-sm">
              Simulated environment with timed mechanical constraints.
            </p>
            <div className="flex items-center gap-4 text-primary group-hover:translate-x-2 transition-transform duration-300">
              <span className="text-xs uppercase font-bold tracking-widest">
                {state.status === 'in-progress' ? 'Resume Exam' : 'Start Simulation'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('review')}
            className="bg-surface p-8 border border-outline-variant rounded relative overflow-hidden group hover:border-primary cursor-pointer transition-all active:scale-[0.98]"
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
                          <span className="text-sm font-medium">Mock Exam · {s.totalQuestions} items</span>
                        </div>
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

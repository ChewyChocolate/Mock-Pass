import { useState } from 'react';
import { BaseScreenProps } from '../types';
import {
  Timer,
  History,
  Bell,
  LayoutDashboard,
  Bookmark,
  CheckCircle2,
  Lightbulb,
  ArrowLeft,
  Grid,
  ArrowRight,
  Lock,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ExamScreen({ onNavigate }: BaseScreenProps) {
  const exam = useExam();
  const { state, start, selectAnswer, toggleFlag, goTo, next, prev, submit, reset, getStatus } = exam;
  const { currentQuestion, isFirst, isLast, answeredCount, flaggedCount } = exam;
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const confirmRef = useFocusTrap<HTMLDivElement>(showConfirm);
  const navigatorRef = useFocusTrap<HTMLDivElement>(showNavigator);

  const isLowTime = state.timeLeft < 300;
  const total = state.questions.length;
  const progressPct = Math.round((answeredCount / total) * 100);
  const currentStatus = getStatus(currentQuestion);
  const isFlagged = state.flags[currentQuestion.id] === true;
  const selectedOption = state.answers[currentQuestion.id] ?? null;

  if (state.status === 'idle') {
    return (
      <div className="bg-surface text-on-surface font-sans min-h-screen flex items-center justify-center p-6">
        <div className="bg-surface-container border border-outline-variant p-10 max-w-md w-full text-center rounded shadow-sm">
          <h2 className="text-2xl font-bold mb-3 tracking-tight">Ready to begin?</h2>
          <p className="text-on-surface-variant mb-8">
            {total} questions · {Math.floor(state.timeLeft / 60)} minutes
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={start}
              className="w-full bg-primary text-on-primary py-3 rounded font-semibold tracking-widest uppercase text-sm hover:brightness-110 active:scale-[0.99] transition-all"
            >
              Start Exam
            </button>
            <button
              onClick={() => {
                reset();
                onNavigate('dashboard');
              }}
              className="w-full py-3 text-on-surface-variant text-sm font-semibold uppercase tracking-widest hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'submitted') {
    return (
      <div className="bg-surface text-on-surface font-sans min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-tertiary mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Exam submitted</h2>
          <p className="text-on-surface-variant mb-6">Loading review…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-sans h-screen flex flex-col overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none grain-texture opacity-30 z-0"></div>

      <header className="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-4 md:px-8 py-4 z-50 shrink-0">
        <div className="flex flex-col">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-lg font-bold tracking-tight text-left"
          >
            Mock Pass
          </button>
          <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest hidden md:block">
            Civil Service Mock Examination
          </span>
        </div>

        <div className="flex-1 max-w-md mx-4 md:mx-12 hidden md:block">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Progress</span>
            <span className="text-[10px] font-semibold text-on-surface-variant">
              {answeredCount} / {total} Answered
            </span>
          </div>
          <div className="h-1 w-full bg-surface-variant overflow-hidden rounded-full">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 relative z-50">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border rounded shadow-sm transition-colors duration-500 bg-surface-container ${
              isLowTime
                ? 'border-error text-error bg-error-container'
                : 'border-outline-variant text-primary bg-primary-container/20'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span className={`font-mono text-sm md:text-lg tracking-tight font-bold ${isLowTime ? 'animate-pulse' : ''}`}>
              {formatTime(state.timeLeft)}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button className="p-2 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded transition-all">
              <History className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-surface-variant text-on-surface-variant hover:text-on-surface rounded transition-all">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative z-10 pb-[72px]">
        <aside className="w-80 bg-surface-container border-r border-outline-variant hidden md:flex flex-col shrink-0" aria-label="Question navigator">
          <div className="p-6 border-b border-outline-variant">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-secondary-container flex items-center justify-center border border-outline-variant rounded-sm">
                <LayoutDashboard className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Reviewer</p>
                <p className="text-xl font-bold leading-none tracking-tight">Question Navigator</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-secondary-container border border-outline-variant/40 rounded-sm" />
                <span className="text-on-surface-variant">{answeredCount} Done</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-terracotta/20 border border-terracotta/40 rounded-sm" />
                <span className="text-on-surface-variant">{flaggedCount} Flag</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-surface-container-highest border border-outline-variant/40 rounded-sm" />
                <span className="text-on-surface-variant">{total - answeredCount} Left</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-surface-container-low/50">
            <div className="grid grid-cols-5 gap-2">
                {state.questions.map((q, idx) => {
                const status = getStatus(q);
                const isCurrent = idx === state.currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => goTo(idx)}
                    aria-current={isCurrent ? 'true' : undefined}
                    aria-label={`Item ${idx + 1}, ${status}`}
                    className={`aspect-square flex items-center justify-center text-xs font-mono font-bold border rounded-sm relative
                      ${
                        isCurrent
                          ? 'border-primary ring-1 ring-primary ring-offset-1 ring-offset-surface-container-low bg-secondary-container text-on-surface'
                          : status === 'answered'
                          ? 'bg-secondary-container text-on-secondary-container border-transparent hover:border-primary/50 transition-all'
                          : status === 'flagged'
                          ? 'bg-terracotta/10 text-terracotta border-terracotta/30'
                          : 'bg-surface-container-highest text-on-surface-variant border-transparent hover:border-primary/30 transition-all'
                      }
                    `}
                  >
                    {String(idx + 1).padStart(2, '0')}
                    {status === 'flagged' && (
                      <Bookmark className="absolute -top-1 -right-1 w-3 h-3 text-terracotta fill-terracotta" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-surface-dim p-4 md:p-10 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-8 pb-10">
            <div className="bg-surface border border-outline-variant p-6 md:p-12 relative rounded shadow-sm">
              <div className="absolute -top-3 left-8 px-4 bg-surface border border-outline-variant font-mono text-[10px] text-primary uppercase tracking-widest font-bold">
                Item No. {state.currentIndex + 1} of {total} · {currentQuestion.topic}
              </div>

              <h2 className="text-2xl md:text-3xl font-semibold leading-snug mb-10 tracking-tight text-on-surface">
                {currentQuestion.prompt}
              </h2>

              <div className="space-y-4">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => selectAnswer(currentQuestion.id, opt.id)}
                    className={`w-full flex items-center text-left transition-all duration-200 relative overflow-hidden active:scale-[0.99] rounded-sm group
                      ${
                        selectedOption === opt.id
                          ? 'border-2 border-primary bg-secondary-container/80 shadow-[0_4px_20px_rgba(190,198,224,0.05)]'
                          : 'border border-outline-variant hover:border-primary/60 hover:bg-surface-container-lowest'
                      }
                    `}
                  >
                    <div
                      className={`w-12 h-14 md:w-16 md:h-16 flex items-center justify-center border-r shrink-0 font-mono font-bold text-lg md:text-xl transition-colors ${
                        selectedOption === opt.id
                          ? 'border-primary bg-primary-container text-primary'
                          : 'border-outline-variant text-on-surface-variant group-hover:text-primary'
                      }`}
                    >
                      {opt.id}
                    </div>
                    <div
                      className={`flex-1 px-4 md:px-6 py-4 text-base md:text-lg transition-colors ${
                        selectedOption === opt.id ? 'font-medium text-on-surface' : 'text-on-surface-variant'
                      }`}
                    >
                      {opt.text}
                    </div>
                    {selectedOption === opt.id && (
                      <CheckCircle2 className="w-5 h-5 mx-4 md:mx-6 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-16 pt-8 border-t border-outline-variant/40 flex justify-between items-center opacity-40">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
                  {currentQuestion.id.toUpperCase()}
                </span>
                <div className="flex gap-2">
                  <div className="w-8 h-[1px] bg-outline"></div>
                  <div className="w-4 h-[1px] bg-outline"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-70 hover:opacity-100 transition-opacity duration-300">
              <div className="p-6 border border-outline-variant rounded flex items-start gap-4 bg-surface-container-lowest/50">
                <Lightbulb className="w-6 h-6 text-tertiary shrink-0" />
                <div>
                  <h4 className="text-sm font-bold mb-1 uppercase tracking-widest text-on-surface">Status</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    {currentStatus === 'flagged'
                      ? 'This item is flagged for review. Tap the Flag Item button again to unflag.'
                      : currentStatus === 'answered'
                      ? 'You have selected an answer. You may change it before submitting.'
                      : 'No answer selected yet. Pick one of the options above to continue.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 w-full z-50 bg-surface-container-highest/90 backdrop-blur-md border-t border-outline-variant flex justify-around items-center px-4 py-3 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center w-full max-w-7xl mx-auto justify-between">
          <div className="flex items-center gap-2 md:gap-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary transition-all group px-4 py-2 rounded border border-transparent hover:border-outline-variant/30"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Exit Exam</span>
            </button>
            <button
              onClick={() => setShowNavigator(true)}
              className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all md:hidden mx-2"
            >
              <Grid className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase mt-1">Grid</span>
            </button>
            <button
              onClick={() => toggleFlag(currentQuestion.id)}
              aria-pressed={isFlagged}
              aria-label={isFlagged ? 'Unflag this item' : 'Flag this item for review'}
              className={`flex flex-col md:flex-row items-center justify-center gap-2 transition-all group pt-1 md:pt-0 mx-2 ${
                isFlagged ? 'text-terracotta' : 'text-on-surface-variant hover:text-terracotta'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isFlagged ? 'fill-terracotta' : ''}`} />
              <span className="text-[10px] md:text-xs md:font-bold uppercase tracking-widest mt-1 md:mt-0">
                {isFlagged ? 'Flagged' : 'Flag Item'}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                disabled={isFirst}
                className="hidden md:flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all px-3 py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Prev</span>
              </button>
              <button
                onClick={next}
                disabled={isLast}
                className="flex flex-col md:flex-row items-center justify-center gap-2 text-primary font-bold transition-all px-4 py-2 hover:bg-primary/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-[10px] md:text-xs uppercase tracking-widest mt-1 md:mt-0 md:order-1 order-2">
                  {isLast ? 'Last Item' : 'Next Item'}
                </span>
                <ArrowRight className="w-5 h-5 md:order-2 order-1" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end mr-4">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Time Remaining</span>
              <span
                className={`font-mono font-bold tracking-tight ${
                  isLowTime ? 'text-error animate-pulse' : 'text-on-surface'
                }`}
              >
                {formatTime(state.timeLeft)}
              </span>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-6 md:px-8 py-3 md:py-3.5 bg-error/90 hover:bg-error text-on-error text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all border border-transparent active:scale-95 flex items-center gap-2 rounded-sm shadow-md"
            >
              <span className="hidden md:inline">Submit Exam</span>
              <span className="md:hidden">Submit</span>
              <Lock className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </footer>

      {showConfirm && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="presentation"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowConfirm(false);
          }}
        >
          <div
            ref={confirmRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-confirm-title"
            aria-describedby="submit-confirm-desc"
            className="bg-surface-container border border-outline-variant max-w-md w-full rounded shadow-2xl p-8 relative focus:outline-none"
          >
            <button
              onClick={() => setShowConfirm(false)}
              aria-label="Close submit confirmation"
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-error" />
              <h3 id="submit-confirm-title" className="text-xl font-bold tracking-tight">
                Submit exam?
              </h3>
            </div>
            <p id="submit-confirm-desc" className="text-on-surface-variant mb-6 text-sm leading-relaxed">
              You answered <strong className="text-on-surface">{answeredCount}</strong> of {total} items.
              {flaggedCount > 0 && (
                <>
                  {' '}
                  <strong className="text-terracotta">{flaggedCount}</strong> {flaggedCount === 1 ? 'is' : 'are'} flagged for review.
                </>
              )}{' '}
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border border-outline-variant text-on-surface font-bold uppercase tracking-widest text-xs hover:bg-surface-variant transition-all"
              >
                Continue
              </button>
              <button
                onClick={submit}
                className="flex-1 py-3 bg-error text-on-error font-bold uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showNavigator && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center md:hidden"
          role="presentation"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowNavigator(false);
          }}
        >
          <div
            ref={navigatorRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Question navigator"
            className="bg-surface-container border-t md:border border-outline-variant w-full md:max-w-2xl md:rounded rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto custom-scrollbar focus:outline-none"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold tracking-tight">Question Navigator</h3>
              <button
                onClick={() => setShowNavigator(false)}
                aria-label="Close navigator"
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {state.questions.map((q, idx) => {
                const status = getStatus(q);
                const isCurrent = idx === state.currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      goTo(idx);
                      setShowNavigator(false);
                    }}
                    aria-current={isCurrent ? 'true' : undefined}
                    aria-label={`Item ${idx + 1}, ${status}`}
                    className={`aspect-square flex items-center justify-center text-xs font-mono font-bold border rounded-sm relative
                      ${
                        isCurrent
                          ? 'border-primary ring-1 ring-primary bg-secondary-container text-on-surface'
                          : status === 'answered'
                          ? 'bg-secondary-container text-on-secondary-container border-transparent'
                          : status === 'flagged'
                          ? 'bg-terracotta/10 text-terracotta border-terracotta/30'
                          : 'bg-surface-container-highest text-on-surface-variant border-transparent'
                      }
                    `}
                  >
                    {String(idx + 1).padStart(2, '0')}
                    {status === 'flagged' && (
                      <Bookmark className="absolute -top-1 -right-1 w-3 h-3 text-terracotta fill-terracotta" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

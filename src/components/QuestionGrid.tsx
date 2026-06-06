import { Bookmark } from 'lucide-react';
import type { Question, QuestionStatus } from '../types';

export type QuestionGridStyle = 'sidebar' | 'modal';

export interface QuestionGridProps {
  questions: Question[];
  allQuestions: Question[];
  currentIndex: number;
  getStatus: (q: Question) => QuestionStatus;
  onSelect: (index: number) => void;
  style?: QuestionGridStyle;
  className?: string;
}

/**
 * Tile grid for the question navigator. Used in both the desktop sidebar
 * and the mobile bottom-sheet modal — `style="sidebar"` adds the
 * ring-offset and hover transitions that the modal doesn't need.
 * `allQuestions` is the unfiltered set so the component can map the
 * filtered `questions` back to the original index for `goTo(index)`.
 */
export function QuestionGrid({
  questions,
  allQuestions,
  currentIndex,
  getStatus,
  onSelect,
  style = 'sidebar',
  className = '',
}: QuestionGridProps) {
  const isSidebar = style === 'sidebar';
  return (
    <div className={`grid grid-cols-5 gap-2 ${className}`}>
      {questions.map((q) => {
        const idx = allQuestions.indexOf(q);
        const status = getStatus(q);
        const isCurrent = idx === currentIndex;
        const isAnswered = status === 'answered';
        const isFlagged = status === 'flagged';

        const stateCls = isCurrent
          ? isSidebar
            ? 'border-primary ring-1 ring-primary ring-offset-1 ring-offset-surface-container-low bg-secondary-container text-on-surface'
            : 'border-primary ring-1 ring-primary bg-secondary-container text-on-surface'
          : isAnswered
          ? isSidebar
            ? 'bg-secondary-container text-on-secondary-container border-transparent hover:border-primary/50 transition-all'
            : 'bg-secondary-container text-on-secondary-container border-transparent'
          : isFlagged
          ? 'bg-terracotta/10 text-terracotta border-terracotta/30'
          : isSidebar
          ? 'bg-surface-container-highest text-on-surface-variant border-transparent hover:border-primary/30 transition-all'
          : 'bg-surface-container-highest text-on-surface-variant border-transparent';

        return (
          <button
            key={q.id}
            onClick={() => onSelect(idx)}
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={`Item ${idx + 1}, ${status}`}
            className={`aspect-square flex items-center justify-center text-xs font-mono font-bold border rounded-sm relative ${stateCls}`}
          >
            {String(idx + 1).padStart(2, '0')}
            {isFlagged && (
              <Bookmark className="absolute -top-1 -right-1 w-3 h-3 text-terracotta fill-terracotta" />
            )}
          </button>
        );
      })}
    </div>
  );
}

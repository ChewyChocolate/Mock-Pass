import { ExamSessionSummary } from '../types';
import { dotColorClass, pctColorClass } from '../utils/scoreColors';
import { formatDate } from '../utils/format';

type Variant = 'table' | 'list';

interface RecentSessionListProps {
  sessions: ExamSessionSummary[];
  variant: Variant;
  onSelect: (sessionId: string) => void;
  emptyMessage?: string;
  limit?: number;
}

/**
 * Shared renderer for the 5-most-recent session block. The dashboard uses
 * `variant="table"` (formal columns) and the performance page (when needed)
 * uses `variant="list"` (ranked rows). Both navigate the same way.
 */
export default function RecentSessionList({
  sessions,
  variant,
  onSelect,
  emptyMessage = 'No exam history yet.',
  limit = 5,
}: RecentSessionListProps) {
  const rows = sessions.slice(0, limit);

  if (rows.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-on-surface-variant mb-2">{emptyMessage}</p>
        <p className="text-sm text-on-surface-variant opacity-70">
          Your completed mock exams will appear here.
        </p>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <ul className="divide-y divide-outline-variant/30">
        {rows.map((s, i) => (
          <li
            key={s.id}
            className="py-4 flex items-center gap-4 hover:bg-surface-variant/30 transition-colors px-2 -mx-2 rounded cursor-pointer"
            onClick={() => onSelect(s.id)}
          >
            <div className="text-xs font-mono font-bold text-on-surface-variant w-8">
              #{i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                Mock Exam · {s.totalQuestions} items
              </p>
              <p className="text-xs text-on-surface-variant">{formatDate(s.submittedAt)}</p>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-on-surface-variant">Correct</span>
              <span className="text-sm font-mono font-bold text-on-surface">
                {s.correct}/{s.totalQuestions}
              </span>
            </div>
            <div className={`text-2xl font-bold font-mono ${pctColorClass(s.score)}`}>
              {s.score}%
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
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
          {rows.map((s) => (
            <tr
              key={s.id}
              className="hover:bg-surface-variant/30 transition-colors cursor-pointer"
              onClick={() => onSelect(s.id)}
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
  );
}

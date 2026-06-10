import React, { useMemo, useState } from 'react';
import {
  Crown,
  Trophy,
  Calendar,
  BarChart3,
  ChevronDown,
  Hourglass,
  CalendarRange,
} from 'lucide-react';
import { BaseScreenProps, ExamLevel, LEVEL_LABELS, LeaderboardTab, PROFESSIONAL_TOPIC_IDS, TOPIC_SHORT_LABELS } from '../types';
import MainLayout from '../components/MainLayout';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { formatDate } from '../utils/format';
import { pctColorClass } from '../utils/scoreColors';
import { LIMITS } from '../lib/limits';
import { formatSeasonCountdown } from '../lib/leaderboard';

const TABS: { id: LeaderboardTab; label: string; icon: React.ReactNode }[] = [
  { id: 'all-time', label: 'Active Season', icon: <Trophy className="w-4 h-4" /> },
  { id: 'week', label: 'This Week', icon: <Calendar className="w-4 h-4" /> },
  { id: 'topic', label: 'Per Topic', icon: <BarChart3 className="w-4 h-4" /> },
];

export default function LeaderboardScreen({ onNavigate }: BaseScreenProps) {
  const { user } = useAuth();
  const { state: examState } = useExam();
  const [tab, setTab] = useState<LeaderboardTab>('all-time');
  const [level, setLevel] = useState<ExamLevel>(examState.level);
  const [topic, setTopic] = useState<string>(
    examState.level === 'professional' ? PROFESSIONAL_TOPIC_IDS[0] : 'Verbal Ability',
  );

  const { status, entries, userRank, error, season, seasonError } = useLeaderboard(
    { tab, level, topic: tab === 'topic' ? topic : null },
    user?.id ?? null,
  );

  const seasonLabel = useMemo(() => {
    if (!season) return null;
    return season.label;
  }, [season]);

  const seasonCountdown = useMemo(() => {
    if (!season) return null;
    return formatSeasonCountdown(season);
  }, [season]);

  const handleLevelChange = (next: ExamLevel) => {
    setLevel(next);
    if (next === 'professional' && !PROFESSIONAL_TOPIC_IDS.includes(topic as never)) {
      setTopic(PROFESSIONAL_TOPIC_IDS[0]);
    }
    // If the user is on the "Per Topic" tab but switches to sub-pro, fall
    // back to the All-Time tab — sub-pro per-topic boards aren't shipped yet.
    if (next === 'sub-professional' && tab === 'topic') {
      setTab('all-time');
    }
  };

  const handleTabChange = (next: LeaderboardTab) => {
    setTab(next);
    // Sub-Pro per-topic is intentionally unavailable; the tab is still
    // visible so users see the upcoming-feature affordance, but the
    // empty-state explains why.
  };

  return (
    <MainLayout onNavigate={onNavigate} currentScreen="leaderboard">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-2">
            Leaderboard
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            See how you stack up against reviewers cramming for the same exam.
            The board resets the day after each major Civil Service exam.
          </p>
        </div>

        {season ? (
          <div className="mb-6 p-5 bg-terracotta-container/30 border border-terracotta/30 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-terracotta-container border border-terracotta flex items-center justify-center shrink-0">
                <CalendarRange className="w-5 h-5 text-terracotta" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-terracotta">
                  Active Exam Season
                </p>
                <p className="text-base font-bold text-on-surface">{seasonLabel}</p>
                <p className="text-xs text-on-surface-variant">
                  Exam on {formatDate(new Date(season.exam_date).getTime())} · Board resets the day after
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:text-right">
              <Hourglass className="w-5 h-5 text-terracotta" />
              <span className="text-sm font-bold text-on-surface">
                {seasonCountdown}
              </span>
            </div>
          </div>
        ) : seasonError ? (
          <div className="mb-6 p-4 bg-error-container/30 border border-error/30 rounded-lg">
            <p className="text-xs text-error">
              Could not load the current exam season. Make sure
              <code className="px-1 mx-1 bg-surface-container rounded font-mono">supabase/leaderboard.sql</code>
              has been run in the Supabase SQL editor.
            </p>
          </div>
        ) : (
          <div className="mb-6 p-5 bg-surface-container-low border border-outline-variant rounded-lg flex items-start gap-3">
            <div className="w-10 h-10 bg-surface-container border border-outline-variant flex items-center justify-center shrink-0">
              <CalendarRange className="w-5 h-5 text-on-surface-variant" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                No active exam season
              </p>
              <p className="text-sm text-on-surface">
                The leaderboard is paused between exam batches. Add a new
                <code className="px-1 mx-1 bg-surface-container rounded font-mono">exam_seasons</code>
                row in Supabase to start the next competition.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="inline-flex p-1 bg-surface-container-low border border-outline-variant rounded-sm self-start">
            {(['professional', 'sub-professional'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                  level === lvl
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {LEVEL_LABELS[lvl]}
              </button>
            ))}
          </div>

          {tab === 'topic' && level === 'professional' && (
            <label className="inline-flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Topic
              </span>
              <div className="relative">
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="appearance-none bg-surface-container-low border border-outline-variant px-3 py-2 pr-8 text-sm font-semibold text-on-surface rounded-sm"
                >
                  {PROFESSIONAL_TOPIC_IDS.map((t) => (
                    <option key={t} value={t}>
                      {TOPIC_SHORT_LABELS[t] ?? t}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-on-surface-variant absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </label>
          )}
        </div>

        <div className="flex gap-1 mb-6 border-b border-outline-variant overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>

        {status === 'loading' && (
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-12 text-center">
            <p className="text-sm text-on-surface-variant">Loading leaderboard…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-error-container/30 border border-error/30 rounded-lg p-8 text-center">
            <p className="text-sm text-error font-semibold">
              {error ?? 'Could not load the leaderboard.'}
            </p>
            <p className="text-xs text-on-surface-variant mt-2">
              Make sure your Supabase project has the leaderboard views set up.
            </p>
          </div>
        )}

        {status === 'ready' && entries.length === 0 && (
          season === null ? (
            <EmptyState
              icon={<Hourglass className="w-12 h-12 text-on-surface-variant opacity-40" />}
              title="Leaderboard paused"
              description="There is no active exam season right now. The board will reopen when an admin schedules the next CSE. Your future attempts will still count toward that season."
              titleAs="h2"
            />
          ) : tab === 'topic' && level === 'sub-professional' ? (
            <EmptyState
              icon={<BarChart3 className="w-12 h-12 text-on-surface-variant opacity-40" />}
              title="Per-topic boards for Sub-Professional are not yet available"
              description="Sub-Professional questions aren't shipped yet. When they are, per-topic boards will appear here. For now, see the All-Time or This Week boards above."
              titleAs="h2"
            />
          ) : (
            <EmptyState
              icon={<Trophy className="w-12 h-12 text-on-surface-variant opacity-40" />}
              title="No submissions yet"
              description={
                tab === 'week'
                  ? 'Be the first reviewer to land on the weekly board this season.'
                  : tab === 'topic'
                  ? 'No one has submitted an attempt for this topic this season.'
                  : `Be the first to claim the top spot for ${season.label}.`
              }
              titleAs="h2"
              action={
                user
                  ? {
                      label: 'Take an Exam',
                      onClick: () => onNavigate('dashboard'),
                    }
                  : undefined
              }
            />
          )
        )}

        {status === 'ready' && entries.length > 0 && (
          <LeaderboardTable
            entries={entries as never}
            tab={tab}
            currentUserId={user?.id ?? null}
          />
        )}

        {userRank !== null && status === 'ready' && entries.length > 0 && (
          <div className="sticky bottom-4 mt-8 flex justify-center pointer-events-none">
            <div className="bg-primary text-on-primary px-6 py-3 rounded-full shadow-2xl pointer-events-auto inline-flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest">You</span>
              <span className="text-lg font-bold">#{userRank}</span>
              {userRank > LIMITS.leaderboardLimit && (
                <span className="text-xs opacity-80">
                  · outside top {LIMITS.leaderboardLimit}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

interface LeaderboardTableProps {
  entries: Array<{
    user_id: string;
    handle: string;
    subtitle: string | null;
    best_score?: number | string;
    best_topic_pct?: number | string;
    best_submitted_at: number;
  }>;
  tab: LeaderboardTab;
  currentUserId: string | null;
}

function LeaderboardTable({ entries, tab, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-surface-container/50">
          <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <th className="px-4 py-3 w-12 text-center">#</th>
            <th className="px-4 py-3">Reviewer</th>
            <th className="px-4 py-3 hidden md:table-cell">Last attempt</th>
            <th className="px-4 py-3 text-right">
              {tab === 'topic' ? 'Accuracy' : 'Score'}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => {
            const isYou = entry.user_id === currentUserId;
            const rank = idx + 1;
            const score =
              tab === 'topic'
                ? Number(entry.best_topic_pct ?? 0)
                : Number(entry.best_score ?? 0);
            return (
              <tr
                key={entry.user_id}
                className={`border-t border-outline-variant/50 transition-colors ${
                  isYou ? 'bg-primary-container/40' : 'hover:bg-surface-container/40'
                }`}
              >
                <td className="px-4 py-3 text-center">
                  {rank === 1 ? (
                    <Crown className="w-5 h-5 text-terracotta inline" />
                  ) : (
                    <span className="text-sm font-bold text-on-surface-variant">
                      {rank}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-bold text-on-surface">{entry.handle}</p>
                  {entry.subtitle ? (
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                      {entry.subtitle}
                    </p>
                  ) : null}
                  {isYou && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      You
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-on-surface-variant hidden md:table-cell">
                  {entry.best_submitted_at
                    ? formatDate(entry.best_submitted_at)
                    : '—'}
                </td>
                <td className={`px-4 py-3 text-right text-base font-bold ${pctColorClass(score)}`}>
                  {Math.round(score)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {entries.length === LIMITS.leaderboardLimit && (
        <p className="px-4 py-3 text-xs text-on-surface-variant text-center border-t border-outline-variant/50">
          Showing top {LIMITS.leaderboardLimit}
        </p>
      )}
    </div>
  );
}

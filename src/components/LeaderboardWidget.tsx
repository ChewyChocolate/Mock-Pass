import React, { useEffect, useState } from 'react';
import { ArrowRight, Crown, Trophy, Users, CalendarRange, Hourglass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import {
  fetchCurrentSeason,
  fetchLeaderboardSeasonWeek,
  formatSeasonCountdown,
  type FetchCurrentSeasonResult,
  type FetchLeaderboardResult,
} from '../lib/leaderboard';
import { getSupabaseClient } from '../lib/supabase';
import { LIMITS } from '../lib/limits';
import type { ExamSeason, LeaderboardEntry } from '../types';
import { formatDate } from '../utils/format';
import { pctColorClass } from '../utils/scoreColors';

interface LeaderboardWidgetProps {
  onNavigate: (screen: 'leaderboard') => void;
}

export default function LeaderboardWidget({ onNavigate }: LeaderboardWidgetProps) {
  const { user } = useAuth();
  const { state } = useExam();
  const [result, setResult] = useState<FetchLeaderboardResult | null>(null);
  const [seasonResult, setSeasonResult] = useState<FetchCurrentSeasonResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const client = getSupabaseClient();
        const [board, season] = await Promise.all([
          fetchLeaderboardSeasonWeek(
            client,
            state.level,
            Math.max(LIMITS.leaderboardWidgetRows, 50),
          ),
          fetchCurrentSeason(client),
        ]);
        if (active) {
          setResult(board);
          setSeasonResult(season);
        }
      } catch (err) {
        if (active) {
          setResult({
            ok: false,
            entries: [],
            error: err instanceof Error ? err.message : 'Failed to load leaderboard.',
          });
          setSeasonResult({ ok: false, season: null });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [state.level]);

  const entries: LeaderboardEntry[] = result?.ok ? result.entries : [];
  const totalPlayers = entries.length;
  const topThree = entries.slice(0, LIMITS.leaderboardWidgetRows);

  const userEntry = user
    ? entries.find((e) => e.user_id === user.id)
    : undefined;
  const userRank = userEntry
    ? entries.findIndex((e) => e.user_id === userEntry.user_id) + 1
    : null;

  const season: ExamSeason | null = seasonResult?.ok ? seasonResult.season : null;
  const seasonLine = season ? season.label : 'Current season';
  const countdown = season ? formatSeasonCountdown(season) : null;

  return (
    <section className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden mb-12">
      <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-surface-container/30">
        <div>
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-terracotta" />
            Active Season · {seasonLine}
          </h3>
          {season ? (
            <p className="text-xs text-on-surface-variant mt-1">
              Exam on {formatDate(new Date(season.exam_date).getTime())} · board resets the day after
            </p>
          ) : (
            <p className="text-xs text-on-surface-variant mt-1">
              No active season configured
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {countdown ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-terracotta">
              <Hourglass className="w-4 h-4" />
              {countdown}
            </span>
          ) : null}
          <button
            onClick={() => onNavigate('leaderboard')}
            className="text-primary text-xs font-bold uppercase tracking-widest hover:underline inline-flex items-center gap-1"
          >
            View Full
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="p-6 border-b md:border-b-0 md:border-r border-outline-variant flex flex-col items-start gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Your Rank
          </span>
          {userEntry ? (
            <>
              <span className="text-3xl font-bold text-primary tracking-tight">
                #{userRank}
              </span>
              <span className="text-xs text-on-surface-variant">
                of {totalPlayers.toLocaleString()} reviewer{totalPlayers === 1 ? '' : 's'} this week
              </span>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold text-on-surface-variant tracking-tight">—</span>
              <span className="text-xs text-on-surface-variant">
                Complete an exam to enter the board
              </span>
            </>
          )}
        </div>

        <div className="md:col-span-2 p-6">
          {loading ? (
            <p className="text-sm text-on-surface-variant">Loading this week's top scorers…</p>
          ) : topThree.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              {season
                ? `No submissions yet for ${season.label}. Be the first to claim the top spot.`
                : 'No submissions yet this season.'}
            </p>
          ) : (
            <ol className="space-y-2">
              {topThree.map((entry, idx) => {
                const isYou = entry.user_id === user?.id;
                const rank = idx + 1;
                return (
                  <li
                    key={entry.user_id}
                    className={`flex items-center gap-3 p-2 rounded-sm ${
                      isYou ? 'bg-primary-container/50 ring-1 ring-primary/30' : ''
                    }`}
                  >
                    <span className="w-7 text-center">
                      {rank === 1 ? (
                        <Crown className="w-5 h-5 text-terracotta inline" />
                      ) : (
                        <span className="text-sm font-bold text-on-surface-variant">
                          {rank}
                        </span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">
                        {entry.handle}
                      </p>
                      {entry.subtitle ? (
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                          {entry.subtitle}
                        </p>
                      ) : null}
                    </div>
                    <span className={`text-base font-bold ${pctColorClass(Number(entry.best_score))}`}>
                      {Math.round(Number(entry.best_score))}%
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>

      <div className="px-6 py-3 border-t border-outline-variant bg-surface-container/20 flex items-center justify-between text-xs text-on-surface-variant">
        <span className="inline-flex items-center gap-1">
          <Users className="w-3 h-3" />
          {totalPlayers.toLocaleString()} reviewer{totalPlayers === 1 ? '' : 's'} ranked
        </span>
        {result && !result.ok && (
          <span className="text-error">Couldn't load — try again later</span>
        )}
      </div>
    </section>
  );
}

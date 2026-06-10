import { useMemo } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CalendarRange,
  RefreshCw,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import { BaseScreenProps } from '../types';
import { AdminLayout, type AdminSectionId } from '../components/AdminLayout';
import { SectionCard } from '../components/SectionCard';
import { SectionHeader } from '../components/SectionHeader';
import { KpiCard } from '../components/KpiCard';
import { useAdmin } from '../lib/admin';
import { useAdminStats } from '../hooks/useAdminStats';

interface AdminStatsScreenProps extends BaseScreenProps {
  onSelectSection?: (id: AdminSectionId) => void;
}

export default function AdminStatsScreen({
  onNavigate,
  onSelectSection,
}: AdminStatsScreenProps) {
  const isAdmin = useAdmin();
  const { status, stats, error, refresh } = useAdminStats(isAdmin);

  const handleSectionSelect = (id: AdminSectionId) => {
    if (onSelectSection) onSelectSection(id);
  };

  const maxDailyCount = useMemo(() => {
    if (!stats) return 0;
    return stats.sessions_last_30_days.reduce(
      (max, d) => (d.count > max ? d.count : max),
      0,
    );
  }, [stats]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface text-on-surface font-sans flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-on-surface-variant opacity-40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">You don't have access to this area</h2>
          <p className="text-sm text-on-surface-variant mb-6">
            This console is reserved for administrators.
          </p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="bg-primary text-on-primary px-6 py-3 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout active="stats" onSelect={handleSectionSelect} onNavigate={onNavigate}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 w-full">
        <SectionHeader
          icon={<BarChart3 className="w-5 h-5 text-terracotta" />}
          title="Stats"
          subtitle="Aggregate numbers from across the app. Read-only."
          trailing={
            <button
              onClick={refresh}
              aria-label="Refresh"
              className="bg-surface-container-high border border-outline-variant text-on-surface px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all inline-flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          }
        />

        {status === 'loading' && (
          <div className="mt-6 bg-surface-container-low border border-outline-variant rounded-lg p-12 text-center">
            <p className="text-sm text-on-surface-variant">Loading stats…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 bg-error-container/30 border border-error/30 rounded-lg p-6">
            <p className="text-sm text-error font-semibold">
              {error ?? 'Failed to load stats.'}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Make sure you ran the latest
              <code className="px-1 mx-1 bg-surface-container rounded font-mono">
                supabase/leaderboard.sql
              </code>
              in the Supabase SQL editor.
            </p>
          </div>
        )}

        {status === 'ready' && stats && (
          <div className="mt-6 space-y-8">
            {/* Top KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                label="Total Users"
                value={stats.total_users.toLocaleString()}
                icon={<Users className="w-5 h-5" />}
                empty={stats.total_users === 0}
                hint="Profiles in the system"
              />
              <KpiCard
                label="Total Sessions"
                value={stats.total_sessions.toLocaleString()}
                icon={<TrendingUp className="w-5 h-5" />}
                accent="primary"
                empty={stats.total_sessions === 0}
                hint="All time"
              />
              <KpiCard
                label="Sessions This Week"
                value={stats.sessions_this_week.toLocaleString()}
                icon={<CalendarRange className="w-5 h-5" />}
                accent="tertiary"
                empty={stats.sessions_this_week === 0}
                hint="Last 7 days"
              />
              <KpiCard
                label="Pass Rate"
                value={`${stats.pass_rate_overall}%`}
                icon={<Target className="w-5 h-5" />}
                accent="terracotta"
                empty={stats.total_sessions === 0}
                hint={`Avg score: ${stats.average_score_overall}%`}
              />
            </div>

            {/* Sessions per day bar chart */}
            <SectionCard>
              <SectionHeader
                icon={<TrendingUp className="w-5 h-5 text-primary" />}
                title="Sessions per day"
                subtitle="Last 30 days"
              />
              <div className="mt-6 flex items-end gap-px h-40">
                {stats.sessions_last_30_days.map((d) => {
                  const pct = maxDailyCount > 0 ? (d.count / maxDailyCount) * 100 : 0;
                  return (
                    <div
                      key={d.day}
                      className="flex-1 flex flex-col items-stretch justify-end group"
                      title={`${d.day}: ${d.count} session${d.count === 1 ? '' : 's'}`}
                    >
                      <div
                        className="bg-primary/70 group-hover:bg-primary transition-colors rounded-t-sm min-h-[2px]"
                        style={{ height: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-on-surface-variant uppercase tracking-widest">
                <span>{stats.sessions_last_30_days[0]?.day ?? ''}</span>
                <span>{stats.sessions_last_30_days[15]?.day ?? ''}</span>
                <span>{stats.sessions_last_30_days[stats.sessions_last_30_days.length - 1]?.day ?? ''}</span>
              </div>
            </SectionCard>

            {/* Pass-rate distribution + session count by level */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SectionCard>
                <SectionHeader
                  icon={<Target className="w-5 h-5 text-terracotta" />}
                  title="Pass-rate distribution"
                  subtitle="How scores are spread across buckets"
                />
                <div className="mt-6 space-y-3">
                  {(
                    [
                      { label: '0-49%', key: '0-49', color: 'bg-error' },
                      { label: '50-79%', key: '50-79', color: 'bg-terracotta' },
                      { label: '80-89% (passing)', key: '80-89', color: 'bg-tertiary' },
                      { label: '90-100% (top)', key: '90-100', color: 'bg-primary' },
                    ] as const
                  ).map((bucket) => {
                    const count = stats.pass_rate_distribution[bucket.key];
                    const total = stats.total_sessions || 1;
                    const pct = (count / total) * 100;
                    return (
                      <div key={bucket.key}>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-semibold text-on-surface">
                            {bucket.label}
                          </span>
                          <span className="text-xs text-on-surface-variant">
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-surface-container rounded-sm overflow-hidden">
                          <div
                            className={`h-full ${bucket.color} transition-all`}
                            style={{ width: `${Math.max(pct, count > 0 ? 1 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard>
                <SectionHeader
                  icon={<Trophy className="w-5 h-5 text-tertiary" />}
                  title="Sessions by level"
                  subtitle="Professional vs Sub-Professional"
                />
                <div className="mt-6 space-y-4">
                  {(
                    [
                      {
                        label: 'Professional',
                        key: 'professional',
                        color: 'bg-primary',
                      },
                      {
                        label: 'Sub-Professional',
                        key: 'sub-professional',
                        color: 'bg-tertiary',
                      },
                    ] as const
                  ).map((level) => {
                    const count = stats.sessions_by_level[level.key];
                    const total = stats.total_sessions || 1;
                    const pct = (count / total) * 100;
                    return (
                      <div key={level.key}>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-sm font-semibold text-on-surface">
                            {level.label}
                          </span>
                          <span className="text-sm font-mono text-on-surface-variant">
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-3 bg-surface-container rounded-sm overflow-hidden">
                          <div
                            className={`h-full ${level.color} transition-all`}
                            style={{ width: `${Math.max(pct, count > 0 ? 1 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </div>

            {/* Topic difficulty */}
            <SectionCard>
              <SectionHeader
                icon={<BarChart3 className="w-5 h-5 text-on-surface-variant" />}
                title="Topic difficulty"
                subtitle="Average score per topic, lowest first (hardest first)"
              />
              {stats.topic_difficulty.length === 0 ? (
                <p className="text-sm text-on-surface-variant mt-4">No topic data yet.</p>
              ) : (
                <table className="w-full mt-4">
                  <thead>
                    <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant">
                      <th className="py-2 pr-4">Topic</th>
                      <th className="py-2 px-4 text-right">Avg score</th>
                      <th className="py-2 pl-4 text-right">Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topic_difficulty.map((row) => (
                      <tr
                        key={row.topic}
                        className="border-b border-outline-variant/30 last:border-b-0"
                      >
                        <td className="py-2 pr-4 text-sm text-on-surface">{row.topic}</td>
                        <td className="py-2 px-4 text-right font-mono text-sm font-bold text-on-surface">
                          {row.avg_score}%
                        </td>
                        <td className="py-2 pl-4 text-right font-mono text-xs text-on-surface-variant">
                          {row.n}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </SectionCard>

            {/* Seasons summary */}
            <SectionCard>
              <SectionHeader
                icon={<CalendarRange className="w-5 h-5 text-terracotta" />}
                title="Exam seasons"
                subtitle="Counts across all exam_seasons rows"
              />
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {(
                  [
                    { label: 'Total', key: 'total' as const, color: 'text-on-surface' },
                    { label: 'Active now', key: 'active_now' as const, color: 'text-tertiary' },
                    { label: 'Upcoming', key: 'upcoming' as const, color: 'text-primary' },
                    { label: 'Past', key: 'past' as const, color: 'text-on-surface-variant' },
                  ]
                ).map((item) => (
                  <div key={item.key}>
                    <div className={`text-3xl font-bold tracking-tight ${item.color}`}>
                      {stats.active_seasons[item.key]}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

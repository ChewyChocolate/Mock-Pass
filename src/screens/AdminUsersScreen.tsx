import { useState } from 'react';
import {
  AlertTriangle,
  UserCog,
  RefreshCw,
  Search,
  X,
  ChevronDown,
  Trash2,
  Mail,
  Calendar,
} from 'lucide-react';
import { BaseScreenProps } from '../types';
import { AdminLayout, type AdminSectionId } from '../components/AdminLayout';
import { SectionCard } from '../components/SectionCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAdmin } from '../lib/admin';
import {
  useAdminUsers,
  useDeleteUser,
  useUserSessions,
} from '../hooks/useAdminUsers';
import { formatDate } from '../utils/format';
import { LEVEL_LABELS } from '../types';

interface AdminUsersScreenProps extends BaseScreenProps {
  onSelectSection?: (id: AdminSectionId) => void;
}

export default function AdminUsersScreen({
  onNavigate,
  onSelectSection,
}: AdminUsersScreenProps) {
  const isAdmin = useAdmin();
  const { status, users, error: searchError, search, refresh } = useAdminUsers(isAdmin);
  const {
    status: sessionsStatus,
    sessions,
    error: sessionsError,
    load: loadSessions,
    refresh: refreshSessions,
    currentUserId,
  } = useUserSessions(isAdmin);
  const { remove, busy: deleteBusy } = useDeleteUser();

  const [searchInput, setSearchInput] = useState('');
  const [section, setSection] = useState<AdminSectionId>('users');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; user_email: string } | null>(null);

  const handleSectionSelect = (id: AdminSectionId) => {
    if (onSelectSection) onSelectSection(id);
  };

  const handleToggle = (userId: string) => {
    if (expanded === userId) {
      setExpanded(null);
    } else {
      setExpanded(userId);
      loadSessions(userId);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const result = await remove(pendingDelete.id);
    if (result.ok) {
      setPendingDelete(null);
      setExpanded(null);
      refresh();
    } else {
      // Surface the error by leaving the dialog open with a new body
      // (overwriting the body for the next render via setPendingDelete).
      setPendingDelete((prev) =>
        prev ? { ...prev, user_email: `${prev.user_email} (error: ${result.error})` } : prev,
      );
    }
  };

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
    <AdminLayout active={section} onSelect={handleSectionSelect} onNavigate={onNavigate}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <UserCog className="w-6 h-6 text-terracotta" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <p className="text-sm text-on-surface-variant">
              Search by email or handle. Click a row to see that user's sessions.
            </p>
          </div>
        </div>

        {/* Search bar */}
        <SectionCard>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  search(e.target.value);
                }}
                placeholder="Search email or handle (leave empty for newest 20)"
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <button
              onClick={refresh}
              aria-label="Refresh"
              className="bg-surface-container-high border border-outline-variant text-on-surface px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all inline-flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </SectionCard>

        {/* Results */}
        {status === 'loading' && (
          <div className="mt-6 bg-surface-container-low border border-outline-variant rounded-lg p-12 text-center">
            <p className="text-sm text-on-surface-variant">Searching…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 bg-error-container/30 border border-error/30 rounded-lg p-6">
            <p className="text-sm text-error font-semibold">
              {searchError ?? 'Search failed.'}
            </p>
          </div>
        )}

        {status === 'ready' && users.length === 0 && (
          <div className="mt-6 bg-surface-container-low border border-outline-variant/50 rounded p-8 text-center">
            <p className="text-sm text-on-surface-variant">No users found.</p>
          </div>
        )}

        {status === 'ready' && users.length > 0 && (
          <div className="mt-6 space-y-2">
            {users.map((u) => {
              const isOpen = expanded === u.user_id;
              return (
                <div
                  key={u.user_id}
                  className="border border-outline-variant/50 rounded bg-surface-container-low overflow-hidden"
                >
                  <button
                    onClick={() => handleToggle(u.user_id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-container/50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-on-surface-variant transition-transform ${
                        isOpen ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-on-surface truncate">{u.user_email}</p>
                      <div className="flex items-center gap-3 text-[10px] text-on-surface-variant uppercase tracking-widest">
                        {u.handle && <span>@{u.handle}</span>}
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(Date.parse(u.created_at))}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-on-surface-variant">
                      {u.sessions_count} session{u.sessions_count === 1 ? '' : 's'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-2 border-t border-outline-variant/30 bg-surface">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="bg-surface-container-low p-3 rounded">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                            Email
                          </p>
                          <p className="text-sm text-on-surface break-all">{u.user_email}</p>
                        </div>
                        <div className="bg-surface-container-low p-3 rounded">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                            User ID
                          </p>
                          <p className="text-xs text-on-surface font-mono break-all">
                            {u.user_id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                          Recent sessions
                        </p>
                        <button
                          onClick={refreshSessions}
                          aria-label="Refresh sessions"
                          className="text-on-surface-variant hover:text-primary"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>

                      {sessionsStatus === 'loading' && (
                        <p className="text-xs text-on-surface-variant">Loading…</p>
                      )}
                      {sessionsStatus === 'error' && (
                        <p className="text-xs text-error">
                          {sessionsError ?? 'Failed to load sessions.'}
                        </p>
                      )}
                      {sessionsStatus === 'ready' && currentUserId === u.user_id && (
                        sessions.length === 0 ? (
                          <p className="text-xs text-on-surface-variant">No sessions yet.</p>
                        ) : (
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-on-surface-variant border-b border-outline-variant/30">
                                <th className="py-1.5 pr-2 font-semibold">Date</th>
                                <th className="py-1.5 px-2 font-semibold">Level</th>
                                <th className="py-1.5 px-2 text-right font-semibold">Score</th>
                                <th className="py-1.5 px-2 text-right font-semibold">Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sessions.map((s) => (
                                <tr
                                  key={s.id}
                                  className="border-b border-outline-variant/20 last:border-b-0"
                                >
                                  <td className="py-1.5 pr-2 text-on-surface">
                                    {formatDate(s.submitted_at)}
                                  </td>
                                  <td className="py-1.5 px-2 text-on-surface-variant">
                                    {LEVEL_LABELS[s.level]}
                                  </td>
                                  <td className="py-1.5 px-2 text-right font-mono text-on-surface">
                                    {Math.round(s.score)}%
                                  </td>
                                  <td className="py-1.5 px-2 text-right font-mono text-on-surface-variant">
                                    {Math.floor(s.time_spent_seconds / 60)}m
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )
                      )}

                      <div className="mt-4 flex flex-wrap gap-2 justify-end">
                        <a
                          href={`mailto:${u.user_email}`}
                          className="bg-surface-container-high border border-outline-variant text-on-surface px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all inline-flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          Email user
                        </a>
                        <button
                          onClick={() =>
                            setPendingDelete({ id: u.user_id, user_email: u.user_email })
                          }
                          className="bg-error-container border border-error/40 text-error px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete user
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete user?"
        body={
          pendingDelete ? (
            <>
              This will permanently remove
              <span className="font-mono text-on-surface mx-1">{pendingDelete.user_email}</span>
              's profile, exam sessions, and support tickets. The
              auth.users row itself is preserved (deferred to v2).
            </>
          ) : null
        }
        confirmLabel="Delete"
        destructive
        busy={deleteBusy}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleteBusy && setPendingDelete(null)}
      />
    </AdminLayout>
  );
}

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Mail,
  RefreshCw,
  CheckCircle2,
  X,
  ChevronDown,
} from 'lucide-react';
import { BaseScreenProps, type SupportTicketStatus } from '../types';
import { AdminLayout, type AdminSectionId } from '../components/AdminLayout';
import { SectionCard } from '../components/SectionCard';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { useAdmin } from '../lib/admin';
import { useAllTickets, useUpdateTicket } from '../hooks/useSupportTickets';
import { formatDate } from '../utils/format';

const STATUS_PILL: Record<
  SupportTicketStatus,
  { label: string; classes: string }
> = {
  open: {
    label: 'Open',
    classes: 'border-terracotta/40 text-terracotta bg-terracotta-container/30',
  },
  closed: {
    label: 'Closed',
    classes: 'border-on-surface-variant/40 text-on-surface-variant bg-surface-container/40',
  },
  archived: {
    label: 'Archived',
    classes: 'border-outline-variant/40 text-on-surface-variant/70 bg-surface-container/20',
  },
};

const TABS: { id: SupportTicketStatus | 'all'; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'closed', label: 'Closed' },
  { id: 'archived', label: 'Archived' },
  { id: 'all', label: 'All' },
];

interface AdminSupportScreenProps extends BaseScreenProps {
  onSelectSection?: (id: AdminSectionId) => void;
}

export default function AdminSupportScreen({
  onNavigate,
  onSelectSection,
}: AdminSupportScreenProps) {
  const isAdmin = useAdmin();
  const { status, tickets, error, refresh } = useAllTickets(isAdmin);
  const { update, busy: updateBusy } = useUpdateTicket();
  const [filter, setFilter] = useState<SupportTicketStatus | 'all'>('open');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [section, setSection] = useState<AdminSectionId>('support');

  const handleSectionSelect = (id: AdminSectionId) => {
    if (onSelectSection) onSelectSection(id);
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return tickets;
    return tickets.filter((t) => t.status === filter);
  }, [tickets, filter]);

  const handleReply = async (ticketId: string, status: SupportTicketStatus) => {
    const note = (replyDrafts[ticketId] ?? '').trim();
    if (!note) return;
    const result = await update(ticketId, { admin_note: note, status });
    if (result.ok) {
      setReplyDrafts((prev) => {
        const { [ticketId]: _drop, ...rest } = prev;
        return rest;
      });
      setExpanded(null);
      refresh();
    }
  };

  const handleClose = async (ticketId: string) => {
    const result = await update(ticketId, { status: 'closed' });
    if (result.ok) refresh();
  };

  const handleReopen = async (ticketId: string) => {
    const result = await update(ticketId, { status: 'open' });
    if (result.ok) refresh();
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
        <SectionHeader
          icon={<Mail className="w-5 h-5 text-terracotta" />}
          title="Support Tickets"
          subtitle="User-submitted questions and bug reports. Reply closes the ticket; reopen if the user replies again."
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

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b border-outline-variant overflow-x-auto">
          {TABS.map((t) => {
            const active = filter === t.id;
            const count = t.id === 'all' ? tickets.length : tickets.filter((x) => x.status === t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t.label}
                {count > 0 && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm ${
                      active ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {status === 'loading' && (
          <div className="mt-6 bg-surface-container-low border border-outline-variant rounded-lg p-12 text-center">
            <p className="text-sm text-on-surface-variant">Loading tickets…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 bg-error-container/30 border border-error/30 rounded-lg p-6">
            <p className="text-sm text-error font-semibold">
              {error ?? 'Failed to load tickets.'}
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

        {status === 'ready' && (
          <div className="mt-6">
            {filtered.length === 0 ? (
              <SectionCard>
                <EmptyState
                  icon={<Mail className="w-12 h-12 text-on-surface-variant opacity-40" />}
                  title="No tickets"
                  description={
                    filter === 'all'
                      ? 'No support tickets have been submitted yet.'
                      : `No ${filter} tickets.`
                  }
                  titleAs="h2"
                />
              </SectionCard>
            ) : (
              <div className="space-y-3">
                {filtered.map((t) => {
                  const pill = STATUS_PILL[t.status];
                  const isOpen = expanded === t.id;
                  return (
                    <div
                      key={t.id}
                      className="border border-outline-variant/50 rounded bg-surface-container-low overflow-hidden"
                    >
                      <button
                        onClick={() => setExpanded(isOpen ? null : t.id)}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-container/50 transition-colors"
                        aria-expanded={isOpen}
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-on-surface-variant transition-transform ${
                            isOpen ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-on-surface truncate">{t.subject}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                            From user {t.user_email.slice(0, 8)}… · {formatDate(Date.parse(t.created_at))}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border ${pill.classes}`}
                        >
                          {pill.label}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-2 border-t border-outline-variant/30 bg-surface">
                          <p className="text-sm text-on-surface whitespace-pre-wrap mb-3">
                            {t.message}
                          </p>
                          {t.admin_note && (
                            <div className="mb-3 p-3 bg-tertiary-container/30 border border-tertiary/40 rounded text-sm">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary mb-1">
                                Previous reply
                              </p>
                              <p className="text-on-surface whitespace-pre-wrap">
                                {t.admin_note}
                              </p>
                            </div>
                          )}
                          <textarea
                            value={replyDrafts[t.id] ?? ''}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({ ...prev, [t.id]: e.target.value }))
                            }
                            placeholder="Type a reply. Sending the reply closes the ticket."
                            rows={3}
                            className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                          />
                          <div className="mt-3 flex flex-wrap gap-2 justify-end">
                            {t.status !== 'closed' && (
                              <button
                                onClick={() => handleClose(t.id)}
                                disabled={updateBusy}
                                className="bg-surface-container-high border border-outline-variant text-on-surface-variant px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all inline-flex items-center gap-1 disabled:opacity-50"
                              >
                                <X className="w-3 h-3" />
                                Close without reply
                              </button>
                            )}
                            {t.status === 'closed' && (
                              <button
                                onClick={() => handleReopen(t.id)}
                                disabled={updateBusy}
                                className="bg-tertiary-container border border-tertiary/40 text-tertiary px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all inline-flex items-center gap-1 disabled:opacity-50"
                              >
                                Reopen
                              </button>
                            )}
                            <button
                              onClick={() => handleReply(t.id, 'closed')}
                              disabled={updateBusy || !replyDrafts[t.id]?.trim()}
                              className="bg-primary text-on-primary px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {updateBusy ? 'Sending…' : 'Send reply & close'}
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
        )}
      </div>
    </AdminLayout>
  );
}

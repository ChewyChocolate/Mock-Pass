import { useMemo, useState } from 'react';
import { Plus, RefreshCw, Pencil, Power, PowerOff, Trash2, CalendarRange, AlertTriangle, ShieldOff } from 'lucide-react';
import { BaseScreenProps, type ExamSeason, type SeasonFormValues } from '../types';
import { AdminLayout, type AdminSectionId } from '../components/AdminLayout';
import { SectionCard } from '../components/SectionCard';
import { SectionHeader } from '../components/SectionHeader';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useExamSeasons } from '../hooks/useExamSeasons';
import { defaultSeasonValues, validateSeasonForm } from '../lib/seasonValidation';
import { formatDate } from '../utils/format';
import { formatSeasonCountdown } from '../lib/leaderboard';
import { useAdmin } from '../lib/admin';
import { getSupabaseClient } from '../lib/supabase';

function isoDateTimeLocalToIso(local: string): string {
  return new Date(local).toISOString();
}

function isoToDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isoToDateLocal(iso: string): string {
  return iso.slice(0, 10);
}

interface FormState {
  open: boolean;
  saving: boolean;
  error: string | null;
  editingId: string | null;
  values: SeasonFormValues;
}

function initialFormState(): FormState {
  return {
    open: false,
    saving: false,
    error: null,
    editingId: null,
    values: defaultSeasonValues(),
  };
}

interface ConfirmState {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  destructive: boolean;
  busy: boolean;
  run: (() => Promise<void>) | null;
}

function initialConfirmState(): ConfirmState {
  return {
    open: false,
    title: '',
    body: '',
    confirmLabel: 'Confirm',
    destructive: false,
    busy: false,
    run: null,
  };
}

export default function AdminSeasonsScreen({ onNavigate }: BaseScreenProps) {
  const isAdmin = useAdmin();
  // Gate the data fetch on isAdmin. A non-admin visiting /admin used to
  // trigger an RLS-denied network call before the access-denied state
  // rendered; the hook now no-ops when disabled.
  const { status, seasons, error, refresh, save, setActive, remove } = useExamSeasons({
    enabled: isAdmin,
  });
  const [section, setSection] = useState<AdminSectionId>('seasons');
  const [form, setForm] = useState<FormState>(initialFormState());
  const [confirm, setConfirm] = useState<ConfirmState>(initialConfirmState());

  const grouped = useMemo(() => {
    const now = Date.now();
    const active: ExamSeason[] = [];
    const upcoming: ExamSeason[] = [];
    const past: ExamSeason[] = [];
    const disabled: ExamSeason[] = [];
    for (const s of seasons) {
      if (s.is_active === false) {
        disabled.push(s);
        continue;
      }
      const start = Date.parse(s.starts_at);
      const end = Date.parse(s.ends_at);
      if (now >= start && now < end) {
        active.push(s);
      } else if (start > now) {
        upcoming.push(s);
      } else {
        past.push(s);
      }
    }
    return { active, upcoming, past, disabled };
  }, [seasons]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface text-on-surface font-sans flex items-center justify-center p-6">
        <EmptyState
          size="lg"
          icon={<ShieldOff className="w-12 h-12 text-on-surface-variant opacity-40" />}
          title="You don't have access to this area"
          description="This console is reserved for administrators."
          titleAs="h2"
          action={{ label: 'Back to Dashboard', onClick: () => onNavigate('dashboard') }}
        />
      </div>
    );
  }

  const openNew = () => {
    setForm({
      open: true,
      saving: false,
      error: null,
      editingId: null,
      values: defaultSeasonValues(),
    });
  };

  const openEdit = (season: ExamSeason) => {
    setForm({
      open: true,
      saving: false,
      error: null,
      editingId: season.id,
      values: {
        label: season.label,
        examDate: isoToDateLocal(season.exam_date),
        startsAt: isoToDateTimeLocal(season.starts_at),
        endsAt: isoToDateTimeLocal(season.ends_at),
      },
    });
  };

  const closeForm = () => {
    if (form.saving) return;
    setForm(initialFormState());
  };

  const handleSave = async () => {
    const validation = validateSeasonForm(form.values);
    if (!validation.ok) {
      setForm((f) => ({ ...f, error: validation.error ?? 'Invalid input.' }));
      return;
    }
    setForm((f) => ({ ...f, saving: true, error: null }));
    try {
      await save(form.values, form.editingId ?? undefined);
      setForm(initialFormState());
    } catch (err) {
      setForm((f) => ({
        ...f,
        saving: false,
        error: err instanceof Error ? err.message : 'Failed to save season.',
      }));
    }
  };

  const askDisable = (season: ExamSeason) => {
    setConfirm({
      open: true,
      title: `Disable ${season.label}?`,
      body: 'It will be hidden from the active board but kept in history. You can re-enable it later.',
      confirmLabel: 'Disable',
      destructive: true,
      busy: false,
      run: async () => {
        await setActive(season.id, false);
        setConfirm(initialConfirmState());
      },
    });
  };

  const askEnable = (season: ExamSeason) => {
    setConfirm({
      open: true,
      title: `Re-enable ${season.label}?`,
      body: 'It will become eligible for the active board again.',
      confirmLabel: 'Enable',
      destructive: false,
      busy: false,
      run: async () => {
        await setActive(season.id, true);
        setConfirm(initialConfirmState());
      },
    });
  };

  const askDelete = (season: ExamSeason) => {
    setConfirm({
      open: true,
      title: `Delete ${season.label}?`,
      body: 'This permanently removes the season row. Leaderboard scores from this season are not deleted — only the season metadata is.',
      confirmLabel: 'Delete',
      destructive: true,
      busy: false,
      run: async () => {
        await remove(season.id);
        setConfirm(initialConfirmState());
      },
    });
  };

  const runConfirm = async () => {
    if (!confirm.run) return;
    setConfirm((c) => ({ ...c, busy: true }));
    try {
      await confirm.run();
    } catch (err) {
      setConfirm((c) => ({
        ...c,
        busy: false,
        body: err instanceof Error ? err.message : 'Action failed.',
      }));
    }
  };

  return (
    <AdminLayout active={section} onSelect={setSection} onNavigate={onNavigate}>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 w-full">
        <SectionHeader
          icon={<CalendarRange className="w-5 h-5 text-terracotta" />}
          title="Exam Seasons"
          subtitle="Manage Civil Service exam windows. The active season is shown to all reviewers; the board resets the day after it."
          trailing={
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                aria-label="Refresh"
                className="bg-surface-container-high border border-outline-variant text-on-surface px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all inline-flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={openNew}
                className="bg-primary text-on-primary px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                New Season
              </button>
            </div>
          }
        />

        {status === 'loading' && (
          <div className="mt-6 bg-surface-container-low border border-outline-variant rounded-lg p-12 text-center">
            <p className="text-sm text-on-surface-variant">Loading seasons…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 bg-error-container/30 border border-error/30 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-error font-semibold">
                  Could not load seasons
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {error ?? 'Unknown error.'} Make sure you ran the latest
                  <code className="px-1 mx-1 bg-surface-container rounded font-mono">
                    supabase/leaderboard.sql
                  </code>
                  and that your account is in the admin allowlist.
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'ready' && (
          <div className="mt-6 space-y-8">
            <SeasonsGroup
              title="Active"
              description="The row whose [starts_at, ends_at] window contains now() and is_active = true."
              seasons={grouped.active}
              emptyHint="No active season. Create one with 'New Season'."
              renderActions={(s) => (
                <SeasonActions
                  season={s}
                  onEdit={openEdit}
                  onDisable={askDisable}
                  onEnable={askEnable}
                  onDelete={askDelete}
                />
              )}
            />

            <SeasonsGroup
              title="Upcoming"
              description="Rows whose starts_at is in the future."
              seasons={grouped.upcoming}
              emptyHint="No upcoming seasons scheduled."
              renderActions={(s) => (
                <SeasonActions
                  season={s}
                  onEdit={openEdit}
                  onDisable={askDisable}
                  onEnable={askEnable}
                  onDelete={askDelete}
                />
              )}
            />

            <SeasonsGroup
              title="Past"
              description="Rows whose ends_at is in the past."
              seasons={grouped.past}
              emptyHint="No past seasons."
              renderActions={(s) => (
                <SeasonActions
                  season={s}
                  onEdit={openEdit}
                  onDisable={askDisable}
                  onEnable={askEnable}
                  onDelete={askDelete}
                />
              )}
            />

            {grouped.disabled.length > 0 && (
              <SeasonsGroup
                title="Disabled"
                description="Hidden from the active board. Re-enable to restore."
                seasons={grouped.disabled}
                emptyHint=""
                renderActions={(s) => (
                  <SeasonActions
                    season={s}
                    onEdit={openEdit}
                    onDisable={askDisable}
                    onEnable={askEnable}
                    onDelete={askDelete}
                  />
                )}
              />
            )}
          </div>
        )}
      </div>

      <Modal
        open={form.open}
        onClose={closeForm}
        title={form.editingId ? 'Edit Season' : 'New Season'}
        panelClassName="max-w-xl"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase" htmlFor="seasonLabel">
              Label
            </label>
            <input
              id="seasonLabel"
              type="text"
              value={form.values.label}
              onChange={(e) => setForm((f) => ({ ...f, values: { ...f.values, label: e.target.value }, error: null }))}
              placeholder="August 2026 CSE"
              maxLength={60}
              className="input-textured w-full bg-surface-container-low border border-outline-variant rounded px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-0 text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase" htmlFor="seasonExamDate">
              Exam Date
            </label>
            <input
              id="seasonExamDate"
              type="date"
              value={form.values.examDate}
              onChange={(e) => setForm((f) => ({ ...f, values: { ...f.values, examDate: e.target.value }, error: null }))}
              className="input-textured w-full bg-surface-container-low border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-0 text-base"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase" htmlFor="seasonStartsAt">
                Window Opens
              </label>
              <input
                id="seasonStartsAt"
                type="datetime-local"
                value={form.values.startsAt}
                onChange={(e) => setForm((f) => ({ ...f, values: { ...f.values, startsAt: e.target.value }, error: null }))}
                className="input-textured w-full bg-surface-container-low border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-0 text-base"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-widest text-on-surface-variant uppercase" htmlFor="seasonEndsAt">
                Window Closes (day after exam)
              </label>
              <input
                id="seasonEndsAt"
                type="datetime-local"
                value={form.values.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, values: { ...f.values, endsAt: e.target.value }, error: null }))}
                className="input-textured w-full bg-surface-container-low border border-outline-variant rounded px-4 py-3 text-on-surface focus:outline-none focus:ring-0 text-base"
              />
            </div>
          </div>

          <p className="text-xs text-on-surface-variant">
            Window must be 1-365 days. Overlapping seasons are allowed; the most recently started active row wins.
          </p>

          {form.error && (
            <p role="alert" className="text-xs text-error bg-error-container/40 border border-error/30 rounded px-3 py-2">
              {form.error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
            <button
              type="button"
              onClick={closeForm}
              disabled={form.saving}
              className="bg-surface-container-high border border-outline-variant text-on-surface px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={form.saving}
              className="bg-primary text-on-primary px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {form.saving ? 'Saving…' : form.editingId ? 'Save Changes' : 'Create Season'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        body={confirm.body}
        confirmLabel={confirm.confirmLabel}
        destructive={confirm.destructive}
        busy={confirm.busy}
        onConfirm={runConfirm}
        onCancel={() => !confirm.busy && setConfirm(initialConfirmState())}
      />
    </AdminLayout>
  );
}

interface SeasonsGroupProps {
  title: string;
  description: string;
  seasons: ExamSeason[];
  emptyHint: string;
  renderActions: (s: ExamSeason) => React.ReactNode;
}

function SeasonsGroup({ title, description, seasons, emptyHint, renderActions }: SeasonsGroupProps) {
  return (
    <section>
      <header className="mb-3">
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </header>
      {seasons.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant/50 rounded p-6 text-center">
          <p className="text-xs text-on-surface-variant">{emptyHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {seasons.map((s) => (
            <SeasonRow key={s.id} season={s} actions={renderActions(s)} />
          ))}
        </div>
      )}
    </section>
  );
}

function SeasonRow({ season, actions }: { season: ExamSeason; actions: React.ReactNode }) {
  const countdown = useMemo(() => formatSeasonCountdown(season), [season]);
  const start = Date.parse(season.starts_at);
  const end = Date.parse(season.ends_at);
  const isActive = season.is_active !== false && Date.now() >= start && Date.now() < end;
  return (
    <SectionCard>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold tracking-tight text-on-surface">{season.label}</h3>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border ${
                isActive
                  ? 'border-tertiary/40 text-tertiary bg-tertiary-container/30'
                  : season.is_active === false
                  ? 'border-outline-variant/50 text-on-surface-variant bg-surface-container/40'
                  : 'border-primary/40 text-primary bg-primary-container/30'
              }`}
            >
              {season.is_active === false ? 'DISABLED' : isActive ? 'ACTIVE' : 'SCHEDULED'}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            Exam {formatDate(new Date(season.exam_date).getTime())} · Window{' '}
            {formatDate(start)} → {formatDate(end)}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            {season.is_active === false ? 'Hidden from the active board.' : countdown}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      </div>
    </SectionCard>
  );
}

interface SeasonActionsProps {
  season: ExamSeason;
  onEdit: (s: ExamSeason) => void;
  onDisable: (s: ExamSeason) => void;
  onEnable: (s: ExamSeason) => void;
  onDelete: (s: ExamSeason) => void;
}

function SeasonActions({ season, onEdit, onDisable, onEnable, onDelete }: SeasonActionsProps) {
  const isDisabled = season.is_active === false;
  return (
    <>
      <button
        onClick={() => onEdit(season)}
        className="bg-surface-container-high border border-outline-variant text-on-surface px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all inline-flex items-center gap-1"
      >
        <Pencil className="w-3 h-3" />
        Edit
      </button>
      {isDisabled ? (
        <button
          onClick={() => onEnable(season)}
          className="bg-tertiary-container border border-tertiary/40 text-tertiary px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all inline-flex items-center gap-1"
        >
          <Power className="w-3 h-3" />
          Enable
        </button>
      ) : (
        <button
          onClick={() => onDisable(season)}
          className="bg-surface-container-high border border-outline-variant text-on-surface-variant px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant hover:text-on-surface transition-all inline-flex items-center gap-1"
        >
          <PowerOff className="w-3 h-3" />
          Disable
        </button>
      )}
      <button
        onClick={() => onDelete(season)}
        aria-label={`Delete ${season.label}`}
        className="bg-surface-container-high border border-outline-variant text-error/80 px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-error-container/30 hover:text-error transition-all inline-flex items-center gap-1"
      >
        <Trash2 className="w-3 h-3" />
        Delete
      </button>
    </>
  );
}

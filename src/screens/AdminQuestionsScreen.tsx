import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  ChevronDown,
  Power,
  PowerOff,
  Pencil,
  X,
  Check,
  Eye,
  Database,
} from 'lucide-react';
import {
  BaseScreenProps,
  TOPIC_SHORT_LABELS,
  QUESTION_TOPICS_BY_LEVEL,
  type ExamLevel,
  type QuestionTopic,
} from '../types';
import { AdminLayout, type AdminSectionId } from '../components/AdminLayout';
import { SectionCard } from '../components/SectionCard';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAdmin } from '../lib/admin';
import { getSupabaseClient } from '../lib/supabase';
import {
  fetchAdminQuestions,
  questionsAreFromDb,
  getQuestionsCacheTimestamp,
  saveQuestion,
  setQuestionActive,
  createNewQuestionId,
  type AdminQuestion,
  type SaveQuestionInput,
} from '../lib/questions';
import { useQuestionsLoaded } from '../hooks/useQuestions';
import { formatRelative } from '../utils/format';
import { useToast } from '../components/Toast';

interface AdminQuestionsScreenProps extends BaseScreenProps {
  onSelectSection?: (id: AdminSectionId) => void;
}

function defaultFormValues(): SaveQuestionInput {
  return {
    id: '',
    level: 'professional',
    topic: 'Verbal Ability',
    prompt: '',
    options: { A: '', B: '', C: '', D: '' },
    correct_option_id: 'A',
    explanation: '',
    is_active: true,
  };
}

export default function AdminQuestionsScreen({
  onNavigate,
  onSelectSection,
}: AdminQuestionsScreenProps) {
  const isAdmin = useAdmin();
  const toast = useToast();
  const { loaded: dbLoaded } = useQuestionsLoaded();
  // Monotonic request token. Each refresh() invocation captures the
  // current value; the resolved promise only writes state if its
  // captured token is still the latest, so a stale response cannot
  // clobber a fresher one.
  const refreshTokenRef = useRef(0);

  const [section, setSection] = useState<AdminSectionId>('questions');
  const [filter, setFilter] = useState<{ level: ExamLevel; topic: QuestionTopic }>({
    level: 'professional',
    topic: 'Verbal Ability',
  });
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    isNew: boolean;
    values: SaveQuestionInput;
    saving: boolean;
    saveError: string | null;
  } | null>(null);
  const [pendingDisable, setPendingDisable] = useState<AdminQuestion | null>(null);

  const handleSectionSelect = (id: AdminSectionId) => {
    if (onSelectSection) onSelectSection(id);
  };

  useEffect(() => {
    const h = window.setTimeout(() => setDebouncedSearch(search), 200);
    return () => window.clearTimeout(h);
  }, [search]);

  const refresh = async () => {
    if (!isAdmin) return;
    const myToken = ++refreshTokenRef.current;
    setStatus('loading');
    setError(null);
    try {
      const client = getSupabaseClient();
      const result = await fetchAdminQuestions(client, {
        level: filter.level,
        topic: filter.topic,
      });
      if (myToken !== refreshTokenRef.current) return; // superseded
      if (!result.ok) {
        setError(result.error ?? 'Failed to load questions.');
        setStatus('error');
        return;
      }
      setQuestions(result.questions);
      setStatus('ready');
    } catch (err) {
      if (myToken !== refreshTokenRef.current) return; // superseded
      setError(err instanceof Error ? err.message : 'Failed to load questions.');
      setStatus('error');
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, filter.level, filter.topic, dbLoaded]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter(
      (x) =>
        x.id.toLowerCase().includes(q) ||
        x.prompt.toLowerCase().includes(q) ||
        x.topic.toLowerCase().includes(q),
    );
  }, [questions, debouncedSearch]);

  const openNew = () => {
    setEditing({
      isNew: true,
      values: { ...defaultFormValues(), topic: filter.topic, level: filter.level },
      saving: false,
      saveError: null,
    });
  };

  const openEdit = (q: AdminQuestion) => {
    setEditing({
      isNew: false,
      values: {
        id: q.id,
        level: q.level,
        topic: q.topic,
        prompt: q.prompt,
        options: { ...q.options },
        correct_option_id: q.correct_option_id,
        explanation: q.explanation,
        is_active: q.is_active,
      },
      saving: false,
      saveError: null,
    });
  };

  const closeForm = () => {
    if (editing?.saving) return;
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    const v = editing.values;
    if (!v.prompt.trim() || v.prompt.length < 10) {
      setEditing((e) => (e ? { ...e, saveError: 'Prompt is required (≥10 chars).' } : e));
      return;
    }
    if (
      !v.options.A.trim() ||
      !v.options.B.trim() ||
      !v.options.C.trim() ||
      !v.options.D.trim()
    ) {
      setEditing((e) => (e ? { ...e, saveError: 'All four options are required.' } : e));
      return;
    }
    if (!v.explanation.trim()) {
      setEditing((e) => (e ? { ...e, saveError: 'Explanation is required.' } : e));
      return;
    }
    setEditing((e) => (e ? { ...e, saving: true, saveError: null } : e));
    try {
      const client = getSupabaseClient();
      const result = await saveQuestion(
        client,
        {
          ...v,
          // Auto-generate id for new admin-authored questions. The
          // q-adm-* namespace is clearly separate from the bundled
          // q-001..q-150 ids, and the 12-hex-char suffix is enough
          // to make collisions astronomically unlikely. saveQuestion
          // retries once on a PK collision as a safety net.
          id: editing.isNew ? createNewQuestionId() : v.id,
        },
        editing.isNew,
      );
      if (!result.ok) {
        const msg = result.error ?? 'Save failed.';
        setEditing((e) => (e ? { ...e, saving: false, saveError: msg } : e));
        toast.show(`Save failed: ${msg}`, 'error');
        return;
      }
      toast.show(editing.isNew ? 'Question created.' : 'Question updated.', 'success');
      setEditing(null);
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed.';
      setEditing((e) => (e ? { ...e, saving: false, saveError: msg } : e));
      toast.show(`Save failed: ${msg}`, 'error');
    }
  };

  const handleDisableConfirm = async () => {
    if (!pendingDisable) return;
    const target = pendingDisable;
    setTogglingId(target.id);
    try {
      const client = getSupabaseClient();
      const result = await setQuestionActive(client, target.id, !target.is_active);
      if (result.ok) {
        toast.show(
          target.is_active
            ? `Disabled ${target.id}. Hidden from the exam screen.`
            : `Re-enabled ${target.id}. Visible in the exam screen.`,
          'success',
        );
        setPendingDisable(null);
        await refresh();
      } else {
        toast.show(`Failed to update ${target.id}: ${result.error ?? 'unknown error'}`, 'error');
        // Leave the dialog open so the admin can retry.
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error';
      toast.show(`Failed to update ${target.id}: ${msg}`, 'error');
    } finally {
      setTogglingId(null);
    }
  };

function CacheStatusBadge({ level, dbLoaded }: { level: ExamLevel; dbLoaded: boolean }) {
  if (!dbLoaded) {
    return (
      <span
        title="Loading the question bank from Supabase…"
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant/40 bg-surface-container/40 px-2 py-0.5 rounded-sm"
      >
        <Database className="w-3 h-3" />
        Loading…
      </span>
    );
  }
  if (!questionsAreFromDb(level)) {
    return (
      <span
        title="DB returned zero active rows for this level. The bundled JS questions are being served."
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant/40 bg-surface-container/40 px-2 py-0.5 rounded-sm"
      >
        <Database className="w-3 h-3" />
        Bundle
      </span>
    );
  }
  const ts = getQuestionsCacheTimestamp(level);
  const label = ts ? formatRelative(ts) : 'just now';
  return (
    <span
      title={
        ts
          ? `Last refreshed ${new Date(ts).toLocaleString()}`
          : 'Cache populated but no timestamp recorded.'
      }
      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-tertiary border border-tertiary/40 bg-tertiary-container/20 px-2 py-0.5 rounded-sm"
    >
      <Database className="w-3 h-3" />
      DB · {label}
    </span>
  );
}

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
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-terracotta" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Question Bank</h1>
            <p className="text-sm text-on-surface-variant">
              Browse, edit, disable, or add questions. Edits are live to all users on next exam start.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <CacheStatusBadge level={filter.level} dbLoaded={dbLoaded} />
            <button
              onClick={refresh}
              disabled={status === 'loading'}
              aria-busy={status === 'loading'}
              aria-label="Refresh"
              className="bg-surface-container-high border border-outline-variant text-on-surface px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`}
              />
              {status === 'loading' ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              onClick={openNew}
              className="bg-primary text-on-primary px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              New Question
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <SectionCard>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="inline-flex p-1 bg-surface-container-low border border-outline-variant rounded-sm self-start">
              {(['professional', 'sub-professional'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilter((f) => ({ ...f, level: lvl }))}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-sm ${
                    filter.level === lvl
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {lvl === 'professional' ? 'Professional' : 'Sub-Professional'}
                </button>
              ))}
            </div>

            <select
              value={filter.topic}
              onChange={(e) =>
                setFilter((f) => ({ ...f, topic: e.target.value as QuestionTopic }))
              }
              className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded text-on-surface text-sm"
            >
              {QUESTION_TOPICS_BY_LEVEL[filter.level].map((t) => (
                <option key={t} value={t}>
                  {TOPIC_SHORT_LABELS[t] ?? t}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by id, prompt, or topic…"
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
        </SectionCard>

        {status === 'loading' && (
          <div className="mt-6 bg-surface-container-low border border-outline-variant rounded-lg p-12 text-center">
            <p className="text-sm text-on-surface-variant">Loading questions…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 bg-error-container/30 border border-error/30 rounded-lg p-6">
            <p className="text-sm text-error font-semibold">{error ?? 'Failed to load.'}</p>
            <p className="text-xs text-on-surface-variant mt-1">
              Make sure you ran
              <code className="px-1 mx-1 bg-surface-container rounded font-mono">
                supabase/questions.sql
              </code>
              in the Supabase SQL editor.
            </p>
          </div>
        )}

        {status === 'ready' && filtered.length === 0 && (
          <div className="mt-6">
            <SectionCard>
              <EmptyState
                icon={<MessageSquare className="w-12 h-12 text-on-surface-variant opacity-40" />}
                title={questions.length === 0 ? 'No questions in this topic yet' : 'No matches'}
                description={
                  questions.length === 0
                    ? 'Add the first one with "New Question" above.'
                    : 'Try a different search term.'
                }
                titleAs="h2"
                action={
                  questions.length === 0
                    ? { label: 'New Question', onClick: openNew }
                    : undefined
                }
              />
            </SectionCard>
          </div>
        )}

        {status === 'ready' && filtered.length > 0 && (
          <div className="mt-6 space-y-2">
            {filtered.map((q) => {
              const isOpen = expanded === q.id;
              return (
                <div
                  key={q.id}
                  className="border border-outline-variant/50 rounded bg-surface-container-low overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : q.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-container/50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-on-surface-variant transition-transform shrink-0 ${
                        isOpen ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-on-surface line-clamp-2">{q.prompt}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                        {q.id} · {q.topic}
                      </p>
                    </div>
                    {!q.is_active && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border border-on-surface-variant/40 text-on-surface-variant bg-surface-container/40 shrink-0">
                        Disabled
                      </span>
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-2 border-t border-outline-variant/30 bg-surface space-y-3">
                      <div className="space-y-2">
                        {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                          const isCorrect = q.correct_option_id === letter;
                          return (
                            <div
                              key={letter}
                              className={`flex items-start gap-2 p-2 rounded text-sm ${
                                isCorrect
                                  ? 'bg-tertiary-container/30 border border-tertiary/40'
                                  : 'bg-surface-container-low border border-outline-variant/30'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                  isCorrect
                                    ? 'bg-tertiary text-on-primary'
                                    : 'bg-surface-container text-on-surface-variant'
                                }`}
                              >
                                {letter}
                              </span>
                              <span
                                className={`flex-1 ${isCorrect ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}
                              >
                                {q.options[letter]}
                              </span>
                              {isCorrect && (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary self-center">
                                  Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-surface-container-low/50 p-3 rounded text-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                          Explanation
                        </p>
                        <p className="text-on-surface">{q.explanation}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={() => openEdit(q)}
                          className="bg-surface-container-high border border-outline-variant text-on-surface px-3 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => setPendingDisable(q)}
                          disabled={togglingId === q.id}
                          aria-busy={togglingId === q.id}
                          className={`px-3 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                            q.is_active
                              ? 'bg-surface-container-high border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
                              : 'bg-tertiary-container border border-tertiary/40 text-tertiary hover:brightness-110'
                          }`}
                        >
                          {togglingId === q.id ? (
                            <span>{q.is_active ? 'Disabling…' : 'Enabling…'}</span>
                          ) : q.is_active ? (
                            <>
                              <PowerOff className="w-3 h-3" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Power className="w-3 h-3" />
                              Enable
                            </>
                          )}
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

      {/* Edit / New modal */}
      <Modal
        open={editing !== null}
        onClose={closeForm}
        title={editing?.isNew ? 'New Question' : 'Edit Question'}
        panelClassName="max-w-2xl"
      >
        {editing && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="qLevel"
                  className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
                >
                  Level
                </label>
                <select
                  id="qLevel"
                  value={editing.values.level}
                  onChange={(e) =>
                    setEditing((s) =>
                      s ? { ...s, values: { ...s.values, level: e.target.value as ExamLevel } } : s,
                    )
                  }
                  className="w-full mt-1 bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-on-surface"
                >
                  <option value="professional">Professional</option>
                  <option value="sub-professional">Sub-Professional</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="qTopic"
                  className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
                >
                  Topic
                </label>
                <select
                  id="qTopic"
                  value={editing.values.topic}
                  onChange={(e) =>
                    setEditing((s) =>
                      s
                        ? {
                            ...s,
                            values: { ...s.values, topic: e.target.value as QuestionTopic },
                          }
                        : s,
                    )
                  }
                  className="w-full mt-1 bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-on-surface"
                >
                  {QUESTION_TOPICS_BY_LEVEL[editing.values.level].map((t) => (
                    <option key={t} value={t}>
                      {TOPIC_SHORT_LABELS[t] ?? t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="qPrompt"
                className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
              >
                Prompt
              </label>
              <textarea
                id="qPrompt"
                rows={3}
                value={editing.values.prompt}
                onChange={(e) =>
                  setEditing((s) =>
                    s ? { ...s, values: { ...s.values, prompt: e.target.value } } : s,
                  )
                }
                className="w-full mt-1 bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                placeholder="The question text…"
                maxLength={4000}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase">
                Options
              </p>
              {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                <div key={letter} className="flex items-center gap-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="correct"
                      checked={editing.values.correct_option_id === letter}
                      onChange={() =>
                        setEditing((s) =>
                          s
                            ? {
                                ...s,
                                values: { ...s.values, correct_option_id: letter },
                              }
                            : s,
                        )
                      }
                      className="sr-only"
                    />
                    <span
                      className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer ${
                        editing.values.correct_option_id === letter
                          ? 'bg-tertiary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant border border-outline-variant'
                      }`}
                    >
                      {letter}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editing.values.options[letter]}
                    onChange={(e) =>
                      setEditing((s) =>
                        s
                          ? {
                              ...s,
                              values: {
                                ...s.values,
                                options: {
                                  ...s.values.options,
                                  [letter]: e.target.value,
                                },
                              },
                            }
                          : s,
                      )
                    }
                    placeholder={`Option ${letter}`}
                    className="flex-1 bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    maxLength={1000}
                  />
                </div>
              ))}
            </div>

            <div>
              <label
                htmlFor="qExplanation"
                className="text-xs font-semibold tracking-widest text-on-surface-variant ml-1 uppercase"
              >
                Explanation
              </label>
              <textarea
                id="qExplanation"
                rows={3}
                value={editing.values.explanation}
                onChange={(e) =>
                  setEditing((s) =>
                    s ? { ...s, values: { ...s.values, explanation: e.target.value } } : s,
                  )
                }
                className="w-full mt-1 bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                placeholder="Why this answer is correct…"
                maxLength={4000}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-on-surface">
              <input
                type="checkbox"
                checked={editing.values.is_active}
                onChange={(e) =>
                  setEditing((s) =>
                    s ? { ...s, values: { ...s.values, is_active: e.target.checked } } : s,
                  )
                }
                className="w-4 h-4"
              />
              <span className="text-xs font-semibold tracking-widest uppercase">
                Active
              </span>
              <span className="text-xs text-on-surface-variant">
                (inactive questions are hidden from the exam screen)
              </span>
            </label>

            {editing.saveError && (
              <p role="alert" className="text-xs text-error">
                {editing.saveError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <button
                type="button"
                onClick={closeForm}
                disabled={editing.saving}
                className="bg-surface-container-high border border-outline-variant text-on-surface px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest hover:bg-surface-variant transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editing.saving}
                className="bg-primary text-on-primary px-5 py-2.5 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-1"
              >
                <Check className="w-3 h-3" />
                {editing.saving ? 'Saving…' : editing.isNew ? 'Create Question' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={pendingDisable !== null}
        title={
          pendingDisable
            ? pendingDisable.is_active
              ? `Disable ${pendingDisable.id}?`
              : `Re-enable ${pendingDisable.id}?`
            : ''
        }
        body={
          pendingDisable ? (
            <>
              {pendingDisable.is_active
                ? 'The question will be hidden from the exam screen. It can be re-enabled later.'
                : 'The question will once again appear in the exam screen.'}
            </>
          ) : null
        }
        confirmLabel={pendingDisable?.is_active ? 'Disable' : 'Enable'}
        destructive={pendingDisable?.is_active ?? false}
        onConfirm={handleDisableConfirm}
        onCancel={() => setPendingDisable(null)}
      />
    </AdminLayout>
  );
}

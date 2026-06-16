import { calculateScore, getQuestionsForLevel, migrateSessionScore, PASSING_SCORE } from '../data/questions';
import { STORAGE_KEYS } from '../lib/storageKeys';

const OPTIONS = ['A', 'B', 'C', 'D'] as const;

type OptionId = (typeof OPTIONS)[number];

interface PersistedQuestion {
  id: string;
  topic: string;
  correctOptionId: string;
}

interface PersistedState {
  status: string;
  questions: PersistedQuestion[];
  answers: Record<string, string>;
  [key: string]: unknown;
}

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.exam);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function saveAndReload(state: PersistedState, count: number) {
  localStorage.setItem(STORAGE_KEYS.exam, JSON.stringify(state));
  console.log(`Filled ${count} answers. Reloading…`);
  location.reload();
}

function computeScore(questions: PersistedQuestion[], answers: Record<string, string>): number {
  const topicStats: Record<string, { correct: number; total: number }> = {};
  for (const q of questions) {
    const entry = topicStats[q.topic] ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answers[q.id] === q.correctOptionId) entry.correct += 1;
    topicStats[q.topic] = entry;
  }
  return calculateScore('professional', topicStats);
}

function randomOption(): OptionId {
  return OPTIONS[Math.floor(Math.random() * OPTIONS.length)];
}

function wrongOption(correct: string): OptionId {
  const wrong = OPTIONS.filter((o) => o !== correct);
  return wrong[Math.floor(Math.random() * wrong.length)]!;
}

export function autoFillCorrect() {
  const state = loadState();
  if (!state) return console.warn('No exam session found.');
  if (state.status !== 'in-progress') return console.warn('Exam is not in progress.');

  const answers: Record<string, string> = {};
  for (const q of state.questions) answers[q.id] = q.correctOptionId;
  state.answers = answers;
  saveAndReload(state, state.questions.length);
}

export function autoFillRandom() {
  const state = loadState();
  if (!state) return console.warn('No exam session found.');
  if (state.status !== 'in-progress') return console.warn('Exam is not in progress.');

  const answers: Record<string, string> = {};
  for (const q of state.questions) answers[q.id] = randomOption();
  state.answers = answers;
  const score = computeScore(state.questions, answers);
  console.log(`Random fill → score: ${score}`);
  saveAndReload(state, state.questions.length);
}

export function autoFillFail() {
  const state = loadState();
  if (!state) return console.warn('No exam session found.');
  if (state.status !== 'in-progress') return console.warn('Exam is not in progress.');

  const answers: Record<string, string> = {};
  for (const q of state.questions) answers[q.id] = randomOption();

  let score = computeScore(state.questions, answers);

  while (score >= PASSING_SCORE) {
    const correctQ = state.questions.find((q) => answers[q.id] === q.correctOptionId);
    if (!correctQ) break;
    answers[correctQ.id] = wrongOption(correctQ.correctOptionId);
    score = computeScore(state.questions, answers);
  }

  state.answers = answers;
  console.log(`Fail fill → score: ${score}`);
  saveAndReload(state, state.questions.length);
}

export function autoFillPass() {
  const state = loadState();
  if (!state) return console.warn('No exam session found.');
  if (state.status !== 'in-progress') return console.warn('Exam is not in progress.');

  const answers: Record<string, string> = {};
  for (const q of state.questions) answers[q.id] = randomOption();

  let score = computeScore(state.questions, answers);

  while (score < PASSING_SCORE) {
    const wrongQ = state.questions.find((q) => answers[q.id] !== q.correctOptionId);
    if (!wrongQ) break;
    answers[wrongQ.id] = wrongQ.correctOptionId;
    score = computeScore(state.questions, answers);
  }

  state.answers = answers;
  console.log(`Pass fill → score: ${score}`);
  saveAndReload(state, state.questions.length);
}

const enableDevTools = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEVTOOLS === 'true';
if (enableDevTools && typeof window !== 'undefined') {
  (window as unknown as { mockpass: unknown }).mockpass = {
    autoFillCorrect,
    autoFillRandom,
    autoFillFail,
    autoFillPass,
    getQuestionsForLevel,
    migrateSessionScore,
    history: {
      local: () => {
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.exam);
          const parsed = raw ? JSON.parse(raw) : null;
          const h = parsed?.history;
          return Array.isArray(h) ? { count: h.length, sessions: h } : { count: 0, sessions: [] };
        } catch (err) {
          return { error: String(err) };
        }
      },
      remote: async () => {
        try {
          const mod = await import('../lib/supabase');
          if (!mod.isSupabaseConfigured()) return { error: 'supabase not configured' };
          const devAuthMod = await import('./devAuth');
          const user = devAuthMod.peekSignedInUser();
          if (!user) return { error: 'not signed in' };
          const syncMod = await import('../lib/sync');
          const result = await syncMod.fetchRemoteHistory(user.id);
          if (!result.ok) return { error: result.error };
          return { count: result.history.length, sessions: result.history };
        } catch (err) {
          return { error: String(err) };
        }
      },
    },
  };
  console.info(
    '[mockpass devTools] window.mockpass helpers attached. ' +
      'Available: autoFillCorrect, autoFillRandom, autoFillFail, autoFillPass, ' +
      'getQuestionsForLevel, migrateSessionScore, history.local(), history.remote().',
  );
}

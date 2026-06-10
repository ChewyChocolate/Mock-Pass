import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import type {
  ExamLevel,
  ExamSessionSummary,
  ExamStatus,
  Question,
  QuestionOption,
  QuestionStatus,
} from '../types';
import {
  calculateScore,
  migrateSessionScore,
  durationForLevel,
  getQuestionsForLevel,
  WEIGHTED_SECTION_TOPICS,
  buildTopicStats,
} from '../data/questions';
import { generateSeed, groupedShuffle } from '../utils/random';
import { useAuth } from './AuthContext';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { fetchRemoteHistory, pushSession } from '../lib/sync';
import { STORAGE_KEYS } from '../lib/storageKeys';
import { LIMITS } from '../lib/limits';

interface ExamState {
  level: ExamLevel;
  questions: Question[];
  sessionSeed: number | null;
  currentIndex: number;
  answers: Record<string, QuestionOption['id']>;
  flags: Record<string, boolean>;
  timeLeft: number;
  endsAt: number | null;
  status: ExamStatus;
  startedAt: number | null;
  submittedAt: number | null;
  history: ExamSessionSummary[];
}

type Action =
  | { type: 'SET_LEVEL'; level: ExamLevel }
  | { type: 'START_EXAM' }
  | { type: 'SELECT_ANSWER'; questionId: string; optionId: QuestionOption['id'] }
  | { type: 'TOGGLE_FLAG'; questionId: string }
  | { type: 'GO_TO'; index: number }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'TICK' }
  | { type: 'SUBMIT' }
  | { type: 'RESET' }
  | { type: 'SIGN_OUT' }
  | { type: 'HYDRATE'; payload: Partial<ExamState> }
  | { type: 'HYDRATE_HISTORY'; history: ExamSessionSummary[] }
  | { type: 'DISCARD_HISTORY' };

const DEFAULT_LEVEL: ExamLevel = 'professional';

const initialState: ExamState = {
  level: DEFAULT_LEVEL,
  questions: getQuestionsForLevel(DEFAULT_LEVEL),
  sessionSeed: null,
  currentIndex: 0,
  answers: {},
  flags: {},
  timeLeft: durationForLevel(DEFAULT_LEVEL),
  endsAt: null,
  status: 'idle',
  startedAt: null,
  submittedAt: null,
  history: [],
};

function reducer(state: ExamState, action: Action): ExamState {
  switch (action.type) {
    case 'SET_LEVEL':
      if (state.status === 'in-progress' || state.status === 'submitted') return state;
      return {
        ...state,
        level: action.level,
        questions: getQuestionsForLevel(action.level),
        sessionSeed: null,
        currentIndex: 0,
        answers: {},
        flags: {},
        timeLeft: durationForLevel(action.level),
      };
    case 'START_EXAM': {
      const now = Date.now();
      const sessionSeed = generateSeed();
      return {
        ...state,
        status: 'in-progress',
        startedAt: now,
        endsAt: now + state.timeLeft * 1000,
        currentIndex: 0,
        answers: {},
        flags: {},
        sessionSeed,
        questions: groupedShuffle(getQuestionsForLevel(state.level), sessionSeed, (q) => q.topic, WEIGHTED_SECTION_TOPICS),
      };
    }
    case 'SELECT_ANSWER':
      if (state.status !== 'in-progress') return state;
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.optionId },
      };
    case 'TOGGLE_FLAG':
      if (state.status !== 'in-progress') return state;
      return {
        ...state,
        flags: { ...state.flags, [action.questionId]: !state.flags[action.questionId] },
      };
    case 'GO_TO': {
      const index = Math.max(0, Math.min(state.questions.length - 1, action.index));
      return { ...state, currentIndex: index };
    }
    case 'NEXT': {
      if (state.currentIndex >= state.questions.length - 1) return state;
      return { ...state, currentIndex: state.currentIndex + 1 };
    }
    case 'PREV': {
      if (state.currentIndex <= 0) return state;
      return { ...state, currentIndex: state.currentIndex - 1 };
    }
    case 'TICK': {
      if (state.status !== 'in-progress') return state;
      if (!state.endsAt) return state;
      const remaining = Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000));
      return { ...state, timeLeft: remaining };
    }
    case 'SUBMIT': {
      if (state.status !== 'in-progress') return state;
      const submittedAt = Date.now();
      const topicStats = buildTopicStats(state.questions, state.answers);
      const correct = Object.values(topicStats).reduce((sum, s) => sum + s.correct, 0);
      const score = calculateScore(state.level, topicStats);
      const timeSpentSeconds = state.startedAt
        ? Math.min(
            durationForLevel(state.level),
            Math.floor((submittedAt - state.startedAt) / 1000),
          )
        : 0;
      const summary: ExamSessionSummary = {
        id: `session-${submittedAt}`,
        level: state.level,
        startedAt: state.startedAt ?? submittedAt,
        submittedAt,
        totalQuestions: state.questions.length,
        correct,
        score,
        timeSpentSeconds,
        topicStats,
      };
      return {
        ...state,
        status: 'submitted',
        submittedAt,
        timeLeft: 0,
        endsAt: null,
        history: [summary, ...state.history].slice(0, LIMITS.maxLocalHistory),
      };
    }
    case 'RESET':
      return {
        ...initialState,
        level: state.level,
        questions: getQuestionsForLevel(state.level),
        timeLeft: durationForLevel(state.level),
        history: state.history,
      };
    case 'SIGN_OUT':
      return {
        ...initialState,
        history: state.history,
      };
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'HYDRATE_HISTORY':
      return { ...state, history: action.history };
    case 'DISCARD_HISTORY':
      return { ...state, history: [] };
    default:
      return state;
  }
}

interface ExamContextValue {
  state: ExamState;
  setLevel: (level: ExamLevel) => void;
  start: () => void;
  selectAnswer: (questionId: string, optionId: QuestionOption['id']) => void;
  toggleFlag: (questionId: string) => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  tick: () => void;
  submit: () => void;
  reset: () => void;
  signOut: () => void;
  getStatus: (question: Question) => QuestionStatus;
  currentQuestion: Question;
  isFirst: boolean;
  isLast: boolean;
  answeredCount: number;
  flaggedCount: number;
  correctCount: number;
  score: number;
  durationSeconds: number;
}

const ExamContext = createContext<ExamContextValue | undefined>(undefined);

function loadPersisted(): Partial<ExamState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.exam);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ExamState> & { questions?: Question[] };
    if (Array.isArray(parsed.history)) {
      parsed.history = parsed.history.map((s) => ({ ...s, score: migrateSessionScore(s.score) }));
    }
    if (parsed.status === 'in-progress' && parsed.endsAt) {
      const remaining = Math.max(0, Math.ceil((parsed.endsAt - Date.now()) / 1000));
      return { ...parsed, timeLeft: remaining };
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePersisted(state: ExamState) {
  try {
    const toSave: Partial<ExamState> = {
      level: state.level,
      questions: state.questions,
      sessionSeed: state.sessionSeed,
      currentIndex: state.currentIndex,
      answers: state.answers,
      flags: state.flags,
      status: state.status,
      startedAt: state.startedAt,
      submittedAt: state.submittedAt,
      endsAt: state.endsAt,
      history: state.history,
    };
    localStorage.setItem(STORAGE_KEYS.exam, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

function migrateLegacy() {
  try {
    const legacy = localStorage.getItem(STORAGE_KEYS.examLegacy);
    if (!legacy) return;
    localStorage.removeItem(STORAGE_KEYS.examLegacy);
  } catch {
    // ignore
  }
}

export function ExamProvider({ children }: { children: ReactNode }) {
  const { user, isSignedIn, isConfigured: authConfigured } = useAuth();

  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    migrateLegacy();
    const persisted = loadPersisted();
    if (!persisted) return init;
    const merged: ExamState = { ...init, ...persisted };
    // Migration: a persisted 'sub-professional' session (from before Sub-Pro
    // became a placeholder) is silently promoted to 'professional' so the
    // dashboard's "Coming Soon" guard cannot strand the user in mid-exam.
    if (merged.level === 'sub-professional') {
      merged.level = 'professional';
      merged.questions = getQuestionsForLevel('professional');
      merged.timeLeft = durationForLevel('professional');
      merged.sessionSeed = null;
    }
    if (persisted.status === 'in-progress' && (persisted.endsAt ?? 0) <= Date.now()) {
      merged.status = 'idle';
      merged.endsAt = null;
      merged.timeLeft = durationForLevel(merged.level);
    }
    return merged;
  });

  useEffect(() => {
    savePersisted(state);
  }, [state]);

  useEffect(() => {
    if (state.status !== 'in-progress') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.status]);

  useEffect(() => {
    if (state.status === 'in-progress' && state.timeLeft === 0) {
      dispatch({ type: 'SUBMIT' });
    }
  }, [state.status, state.timeLeft]);

  // ── Backend sync: discard local history on first sign-in, then fetch remote.
  const lastSyncedUserId = useRef<string | null>(null);
  // Tracks the latest history length so the async sync can detect that
  // the user submitted on this device while we were fetching remote.
  const historyLengthRef = useRef(0);
  useEffect(() => {
    historyLengthRef.current = state.history.length;
  }, [state.history]);

  useEffect(() => {
    if (!authConfigured || !isSupabaseConfigured()) return;
    if (!isSignedIn || !user) {
      lastSyncedUserId.current = null;
      return;
    }
    if (lastSyncedUserId.current === user.id) return;
    lastSyncedUserId.current = user.id;

    // Capture a freshly-submitted local session (if any) before we wipe.
    // This handles the offline-submit-then-sign-in case: the user submits
    // an exam while offline, the sign-in effect fires DISCARD_HISTORY, the
    // just-submitted session would otherwise be lost. We re-merge it after.
    const pending = state.history[0] ?? null;

    let cancelled = false;
    (async () => {
      try {
        const client = getSupabaseClient();
        // First sign-in on a fresh device: drop the local cache so remote
        // becomes the only source of truth.
        dispatch({ type: 'DISCARD_HISTORY' });
        const result = await fetchRemoteHistory(client, user.id);
        if (cancelled) return;
        if (!result.ok) {
          console.warn('[mockpass] fetchRemoteHistory failed:', result.error);
          return;
        }
        // Race guard: if the user submitted on THIS device while we were
        // fetching (historyLengthRef > 0 means SUBMIT landed after our
        // DISCARD_HISTORY), do NOT clobber the just-submitted session with
        // an empty remote. The push-to-backend useEffect will keep remote
        // in sync, and the next sign-in will see the session.
        if (historyLengthRef.current > 0 && result.history.length === 0) {
          return;
        }
        // Offline-submit-then-sign-in case: re-merge the captured pending
        // session if it isn't already in remote. Pre-merge it into the
        // result so the subsequent HYDRATE_HISTORY includes it. The push
        // effect will then upload it to the backend.
        const remoteIds = new Set(result.history.map((s) => s.id));
        if (pending && !remoteIds.has(pending.id)) {
          const merged = [pending, ...result.history].slice(0, LIMITS.maxLocalHistory);
          dispatch({ type: 'HYDRATE_HISTORY', history: merged });
        } else {
          dispatch({ type: 'HYDRATE_HISTORY', history: result.history });
        }
      } catch (err) {
        console.warn('[mockpass] sync init failed:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authConfigured, isSignedIn, user]);

  // ── Push newly-submitted sessions to the backend.
  const lastPushedSessionId = useRef<string | null>(null);
  useEffect(() => {
    const latest = state.history[0];
    if (!latest) return;
    if (lastPushedSessionId.current === latest.id) return;
    lastPushedSessionId.current = latest.id;
    if (!isSignedIn || !user) return;
    if (!isSupabaseConfigured()) return;

    (async () => {
      try {
        const client = getSupabaseClient();
        const result = await pushSession(client, user.id, latest);
        if (!result.ok) {
          console.warn('[mockpass] pushSession failed:', result.error);
        }
      } catch (err) {
        console.warn('[mockpass] push session failed:', err);
      }
    })();
  }, [state.history, isSignedIn, user]);

  const { correctCount, score, answeredCount, flaggedCount } = useMemo(() => {
    const topicStats = buildTopicStats(state.questions, state.answers);
    const correct = Object.values(topicStats).reduce((sum, s) => sum + s.correct, 0);
    return {
      correctCount: correct,
      score: state.questions.length === 0
        ? 0
        : calculateScore(state.level, topicStats),
      answeredCount: Object.keys(state.answers).length,
      flaggedCount: Object.values(state.flags).filter(Boolean).length,
    };
  }, [state.questions, state.answers, state.flags, state.level]);

  const setLevel = useCallback((level: ExamLevel) => dispatch({ type: 'SET_LEVEL', level }), []);

  const getStatus = useCallback(
    (question: Question): QuestionStatus => {
      if (state.flags[question.id]) return 'flagged';
      if (state.answers[question.id]) return 'answered';
      return 'unanswered';
    },
    [state.flags, state.answers],
  );

  const currentQuestion = state.questions[state.currentIndex];
  const isFirst = state.currentIndex === 0;
  const isLast = state.currentIndex === state.questions.length - 1;
  const durationSeconds = durationForLevel(state.level);

  const value: ExamContextValue = {
    state,
    setLevel,
    start: () => dispatch({ type: 'START_EXAM' }),
    selectAnswer: (questionId, optionId) =>
      dispatch({ type: 'SELECT_ANSWER', questionId, optionId }),
    toggleFlag: (questionId) => dispatch({ type: 'TOGGLE_FLAG', questionId }),
    goTo: (index) => dispatch({ type: 'GO_TO', index }),
    next: () => dispatch({ type: 'NEXT' }),
    prev: () => dispatch({ type: 'PREV' }),
    tick: () => dispatch({ type: 'TICK' }),
    submit: () => dispatch({ type: 'SUBMIT' }),
    reset: () => dispatch({ type: 'RESET' }),
    signOut: () => dispatch({ type: 'SIGN_OUT' }),
    getStatus,
    get currentQuestion() {
      return currentQuestion;
    },
    isFirst,
    isLast,
    answeredCount,
    flaggedCount,
    correctCount,
    score,
    durationSeconds,
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return ctx;
}

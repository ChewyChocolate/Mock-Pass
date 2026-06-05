import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
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
  durationForLevel,
  getQuestionsForLevel,
} from '../data/questions';

const STORAGE_KEY = 'mockpass:exam:v2';
const LEGACY_KEY = 'mockpass:exam:v1';

interface ExamState {
  level: ExamLevel;
  questions: Question[];
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
  | { type: 'HYDRATE'; payload: Partial<ExamState> };

const DEFAULT_LEVEL: ExamLevel = 'professional';

const initialState: ExamState = {
  level: DEFAULT_LEVEL,
  questions: getQuestionsForLevel(DEFAULT_LEVEL),
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
        currentIndex: 0,
        answers: {},
        flags: {},
        timeLeft: durationForLevel(action.level),
      };
    case 'START_EXAM': {
      const now = Date.now();
      return {
        ...state,
        status: 'in-progress',
        startedAt: now,
        endsAt: now + state.timeLeft * 1000,
        currentIndex: 0,
        answers: {},
        flags: {},
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
      const topicStats: Record<string, { correct: number; total: number }> = {};
      let correct = 0;
      for (const q of state.questions) {
        const entry = topicStats[q.topic] ?? { correct: 0, total: 0 };
        entry.total += 1;
        if (state.answers[q.id] === q.correctOptionId) {
          entry.correct += 1;
          correct += 1;
        }
        topicStats[q.topic] = entry;
      }
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
        history: [summary, ...state.history].slice(0, 20),
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ExamState> & { questions?: Question[] };
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
      currentIndex: state.currentIndex,
      answers: state.answers,
      flags: state.flags,
      status: state.status,
      startedAt: state.startedAt,
      submittedAt: state.submittedAt,
      endsAt: state.endsAt,
      history: state.history,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

function migrateLegacy() {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // ignore
  }
}

export function ExamProvider({ children }: { children: ReactNode }) {
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

  const { correctCount, score, answeredCount, flaggedCount } = useMemo(() => {
    let correct = 0;
    const topicStats: Record<string, { correct: number; total: number }> = {};
    for (const q of state.questions) {
      const entry = topicStats[q.topic] ?? { correct: 0, total: 0 };
      entry.total += 1;
      if (state.answers[q.id] === q.correctOptionId) {
        entry.correct += 1;
        correct += 1;
      }
      topicStats[q.topic] = entry;
    }
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

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import type {
  ExamSessionSummary,
  ExamStatus,
  Question,
  QuestionOption,
  QuestionStatus,
} from '../types';
import { EXAM_DURATION_SECONDS, QUESTION_BANK } from '../data/questions';

const STORAGE_KEY = 'mockpass:exam:v1';

interface ExamState {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, QuestionOption['id']>;
  flags: Record<string, boolean>;
  timeLeft: number;
  status: ExamStatus;
  startedAt: number | null;
  submittedAt: number | null;
  history: ExamSessionSummary[];
}

type Action =
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

const initialState: ExamState = {
  questions: QUESTION_BANK,
  currentIndex: 0,
  answers: {},
  flags: {},
  timeLeft: EXAM_DURATION_SECONDS,
  status: 'idle',
  startedAt: null,
  submittedAt: null,
  history: [],
};

function reducer(state: ExamState, action: Action): ExamState {
  switch (action.type) {
    case 'START_EXAM':
      return {
        ...state,
        status: 'in-progress',
        startedAt: Date.now(),
        timeLeft: EXAM_DURATION_SECONDS,
        currentIndex: 0,
        answers: {},
        flags: {},
      };
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
      if (state.timeLeft <= 0) return state;
      return { ...state, timeLeft: state.timeLeft - 1 };
    }
    case 'SUBMIT': {
      if (state.status !== 'in-progress') return state;
      const submittedAt = Date.now();
      const correct = state.questions.reduce(
        (acc, q) => (state.answers[q.id] === q.correctOptionId ? acc + 1 : acc),
        0,
      );
      const score = Math.round((correct / state.questions.length) * 100);
      const timeSpentSeconds = state.startedAt
        ? Math.floor((submittedAt - state.startedAt) / 1000)
        : 0;
      const summary: ExamSessionSummary = {
        id: `session-${submittedAt}`,
        startedAt: state.startedAt ?? submittedAt,
        submittedAt,
        totalQuestions: state.questions.length,
        correct,
        score,
        timeSpentSeconds,
      };
      return {
        ...state,
        status: 'submitted',
        submittedAt,
        timeLeft: 0,
        history: [summary, ...state.history].slice(0, 20),
      };
    }
    case 'RESET':
      return {
        ...initialState,
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
}

const ExamContext = createContext<ExamContextValue | undefined>(undefined);

function loadPersisted(): Partial<ExamState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ExamState>;
    if (parsed.status === 'in-progress') {
      return { ...parsed, timeLeft: EXAM_DURATION_SECONDS };
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePersisted(state: ExamState) {
  try {
    const toSave: Partial<ExamState> = {
      questions: state.questions,
      currentIndex: state.currentIndex,
      answers: state.answers,
      flags: state.flags,
      status: state.status,
      startedAt: state.startedAt,
      submittedAt: state.submittedAt,
      history: state.history,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

export function ExamProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const persisted = loadPersisted();
    return persisted ? { ...init, ...persisted } : init;
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

  const value: ExamContextValue = {
    state,
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
    getStatus: (question) => {
      if (state.flags[question.id]) return 'flagged';
      if (state.answers[question.id]) return 'answered';
      return 'unanswered';
    },
    get currentQuestion() {
      return state.questions[state.currentIndex];
    },
    isFirst: state.currentIndex === 0,
    isLast: state.currentIndex === state.questions.length - 1,
    answeredCount: Object.keys(state.answers).length,
    flaggedCount: Object.values(state.flags).filter(Boolean).length,
    correctCount: state.questions.reduce(
      (acc, q) => (state.answers[q.id] === q.correctOptionId ? acc + 1 : acc),
      0,
    ),
    score:
      state.questions.length === 0
        ? 0
        : Math.round(
            (state.questions.reduce(
              (acc, q) => (state.answers[q.id] === q.correctOptionId ? acc + 1 : acc),
              0,
            ) /
              state.questions.length) *
              100,
          ),
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

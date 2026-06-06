const STORAGE_KEY = 'mockpass:exam:v2';

const WEIGHTS: Record<string, number> = {
  'Verbal Ability': 0.30,
  'Analytical Reasoning': 0.35,
  'Numerical Ability': 0.30,
  'General Information': 0.05,
  'Clerical Ability': 0,
};
const TOPIC_ORDER = ['Verbal Ability', 'Analytical Reasoning', 'Numerical Ability', 'General Information'];
const PASSING_SCORE = 80;
const OPTIONS = ['A', 'B', 'C', 'D'];

interface PersistedState {
  status: string;
  questions: { id: string; topic: string; correctOptionId: string }[];
  answers: Record<string, string>;
  [key: string]: any;
}

function loadState(): PersistedState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

function saveAndReload(state: PersistedState, count: number) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  console.log(`Filled ${count} answers. Reloading…`);
  location.reload();
}

function computeScore(questions: PersistedState['questions'], answers: Record<string, string>): number {
  const topicStats: Record<string, { correct: number; total: number }> = {};
  for (const q of questions) {
    const entry = topicStats[q.topic] ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answers[q.id] === q.correctOptionId) entry.correct += 1;
    topicStats[q.topic] = entry;
  }
  let weightedSum = 0;
  for (const topic of TOPIC_ORDER) {
    const stat = topicStats[topic];
    if (!stat || stat.total === 0) continue;
    weightedSum += (stat.correct / stat.total) * 100 * (WEIGHTS[topic] ?? 0);
  }
  return Math.round(weightedSum);
}

function randomOption(): string {
  return OPTIONS[Math.floor(Math.random() * 4)];
}

function wrongOption(correct: string): string {
  const wrong = OPTIONS.filter(o => o !== correct);
  return wrong[Math.floor(Math.random() * wrong.length)];
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
    const correctQ = state.questions.find(q => answers[q.id] === q.correctOptionId);
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
    const wrongQ = state.questions.find(q => answers[q.id] !== q.correctOptionId);
    if (!wrongQ) break;
    answers[wrongQ.id] = wrongQ.correctOptionId;
    score = computeScore(state.questions, answers);
  }

  state.answers = answers;
  console.log(`Pass fill → score: ${score}`);
  saveAndReload(state, state.questions.length);
}

if (typeof window !== 'undefined') {
  (window as any).autoFill = autoFillCorrect;
  (window as any).autoFillCorrect = autoFillCorrect;
  (window as any).autoFillRandom = autoFillRandom;
  (window as any).autoFillFail = autoFillFail;
  (window as any).autoFillPass = autoFillPass;
}

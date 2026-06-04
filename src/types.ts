export type Screen = 'login' | 'dashboard' | 'review' | 'exam';

export interface BaseScreenProps {
  onNavigate: (screen: Screen) => void;
}

export type QuestionTopic =
  | 'Verbal Ability'
  | 'Numerical Ability'
  | 'Analytical Reasoning'
  | 'General Information';

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  topic: QuestionTopic;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: QuestionOption['id'];
  explanation: string;
}

export type ExamStatus = 'idle' | 'in-progress' | 'submitted';

export type QuestionStatus = 'unanswered' | 'answered' | 'flagged';

export interface ExamSessionSummary {
  id: string;
  startedAt: number;
  submittedAt: number;
  totalQuestions: number;
  correct: number;
  score: number;
  timeSpentSeconds: number;
}

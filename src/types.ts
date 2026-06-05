export type Screen = 'login' | 'dashboard' | 'review' | 'exam' | 'performance' | 'support';

export interface BaseScreenProps {
  onNavigate: (screen: Screen) => void;
}

export type ExamLevel = 'sub-professional' | 'professional';

export type QuestionTopic =
  | 'Verbal Ability'
  | 'Numerical Ability'
  | 'Analytical Reasoning'
  | 'General Information'
  | 'Clerical Ability';

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  level: ExamLevel;
  topic: QuestionTopic;
  prompt: string;
  options: QuestionOption[];
  correctOptionId: QuestionOption['id'];
  explanation: string;
}

export type ExamStatus = 'idle' | 'in-progress' | 'submitted';

export type QuestionStatus = 'unanswered' | 'answered' | 'flagged';

export interface TopicStat {
  correct: number;
  total: number;
}

export interface ExamSessionSummary {
  id: string;
  level: ExamLevel;
  startedAt: number;
  submittedAt: number;
  totalQuestions: number;
  correct: number;
  score: number;
  timeSpentSeconds: number;
  topicStats: Record<string, TopicStat>;
}

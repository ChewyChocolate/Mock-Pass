export type Screen = 'login' | 'dashboard' | 'review' | 'exam' | 'performance' | 'support' | 'profile';

export interface BaseScreenProps {
  onNavigate: (screen: Screen) => void;
}

export type ExamLevel = 'sub-professional' | 'professional';

export interface UserProfile {
  first_name?: string;
  last_name?: string;
}

export const LEVEL_LABELS: Record<ExamLevel, string> = {
  'sub-professional': 'Sub-Professional',
  'professional': 'Professional',
};

export const LEVEL_LABELS_SHORT: Record<ExamLevel, string> = {
  'sub-professional': 'Sub-Pro',
  'professional': 'Professional',
};

export type QuestionTopic =
  | 'Verbal Ability'
  | 'Numerical Ability'
  | 'Analytical Reasoning'
  | 'General Information'
  | 'Clerical Ability';

export const TOPIC_SHORT_LABELS: Record<QuestionTopic, string> = {
  'Verbal Ability': 'Verbal',
  'Numerical Ability': 'Numerical',
  'Analytical Reasoning': 'Analytical',
  'General Information': 'General',
  'Clerical Ability': 'Clerical',
};

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

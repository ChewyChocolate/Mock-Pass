export type Screen = 'login' | 'dashboard' | 'review' | 'exam';

export interface BaseScreenProps {
  onNavigate: (screen: Screen) => void;
}

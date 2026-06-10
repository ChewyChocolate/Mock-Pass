import { useEffect, useRef, useState } from 'react';
import type { Screen } from './types';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExamProvider, useExam } from './context/ExamContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ReviewScreen from './screens/ReviewScreen';
import ExamScreen from './screens/ExamScreen';
import PerformanceScreen from './screens/PerformanceScreen';
import SupportScreen from './screens/SupportScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import ProfileScreen from './screens/ProfileScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import AdminSeasonsScreen from './screens/AdminSeasonsScreen';
import AdminStatsScreen from './screens/AdminStatsScreen';
import AdminSupportScreen from './screens/AdminSupportScreen';
import AdminUsersScreen from './screens/AdminUsersScreen';
import AdminQuestionsScreen from './screens/AdminQuestionsScreen';
import { type AdminSectionId } from './components/AdminSidebar';
import { preloadQuestions } from './hooks/useQuestions';
import './index.css';

function AdminRouter({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [section, setSection] = useState<AdminSectionId>('seasons');
  if (section === 'stats') {
    return (
      <AdminStatsScreen
        onNavigate={onNavigate}
        onSelectSection={setSection}
      />
    );
  }
  if (section === 'support') {
    return (
      <AdminSupportScreen
        onNavigate={onNavigate}
        onSelectSection={setSection}
      />
    );
  }
  if (section === 'users') {
    return (
      <AdminUsersScreen
        onNavigate={onNavigate}
        onSelectSection={setSection}
      />
    );
  }
  if (section === 'questions') {
    return (
      <AdminQuestionsScreen
        onNavigate={onNavigate}
        onSelectSection={setSection}
      />
    );
  }
  return (
    <AdminSeasonsScreen
      onNavigate={onNavigate}
      onSelectSection={setSection}
    />
  );
}

function Router() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const { state } = useExam();
  const { isSignedIn, isLoading, recoveryMode } = useAuth();
  const initialized = useRef(false);
  const prevStatus = useRef(state.status);
  const prevSignedIn = useRef<boolean | null>(null);

  // Preload the question bank from the DB so admin edits are live
  // without requiring a redeploy. Idempotent; safe to call on every
  // mount.
  useEffect(() => {
    void preloadQuestions();
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (state.status === 'in-progress') {
      setCurrentScreen('exam');
    }
  }, [state.status]);

  useEffect(() => {
    if (!initialized.current) return;
    if (prevStatus.current === 'in-progress' && state.status === 'submitted') {
      setCurrentScreen('review');
    }
    prevStatus.current = state.status;
  }, [state.status]);

  useEffect(() => {
    if (isLoading) return;
    const wasSignedIn = prevSignedIn.current;
    prevSignedIn.current = isSignedIn;
    if (wasSignedIn === null) return;
    if (wasSignedIn && !isSignedIn) {
      setCurrentScreen('login');
    }
  }, [isSignedIn, isLoading]);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  if (recoveryMode) return <ResetPasswordScreen onNavigate={handleNavigate} />;
  if (currentScreen === 'login') return <LoginScreen onNavigate={handleNavigate} />;
  if (currentScreen === 'dashboard') return <DashboardScreen onNavigate={handleNavigate} />;
  if (currentScreen === 'review') return <ReviewScreen onNavigate={handleNavigate} />;
  if (currentScreen === 'performance') return <PerformanceScreen onNavigate={handleNavigate} />;
  if (currentScreen === 'support') return <SupportScreen onNavigate={handleNavigate} />;
  if (currentScreen === 'profile') return <ProfileScreen onNavigate={handleNavigate} />;
  if (currentScreen === 'leaderboard') return <LeaderboardScreen onNavigate={handleNavigate} />;
  if (currentScreen === 'admin') return <AdminRouter onNavigate={handleNavigate} />;
  return <ExamScreen onNavigate={handleNavigate} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExamProvider>
          <ErrorBoundary>
            <div className="min-h-screen bg-surface font-sans text-on-surface antialiased format-selection">
              <Router />
            </div>
          </ErrorBoundary>
        </ExamProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

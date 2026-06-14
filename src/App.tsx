import { Suspense, lazy, useEffect, useRef, useState } from 'react';
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
import { preloadQuestions } from './hooks/useQuestions';
import {
  readPersistedScreen,
  writePersistedScreen,
} from './lib/persistedNavigation';
import { ToastProvider } from './components/Toast';
import './index.css';

// Admin section is the biggest single chunk in the app (5 screens,
// the questions CRUD UI, the questions table). Code-split it so
// non-admin users don't pay for it on first paint. The chunk is
// fetched on demand when the user navigates to the admin screen.
const AdminRouter = lazy(() => import('./screens/AdminRouter'));

function Router() {
  const [currentScreen, setCurrentScreenState] = useState<Screen>(() => readPersistedScreen());
  const { state } = useExam();
  const { isSignedIn, isLoading, recoveryMode } = useAuth();
  const initialized = useRef(false);
  const prevStatus = useRef(state.status);

  // Wrapper that writes the new screen to localStorage so a hard
  // refresh (or a tab restore) returns the user to the same place.
  // The 'login' screen is intentionally NOT persisted; a sign-out
  // clears the saved value so a logged-out user always lands on
  // login after a refresh.
  const setCurrentScreen = (screen: Screen) => {
    setCurrentScreenState(screen);
    writePersistedScreen(screen);
  };

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

  // Once auth loading finishes, force-redirect to login if the user
  // is signed out. This handles two cases:
  //   1. Cold start with a stale or missing persisted screen.
  //   2. The sign-out flow itself (signed-in -> signed-out transition).
  useEffect(() => {
    if (isLoading) return;
    if (!isSignedIn) {
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
  if (currentScreen === 'admin') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-surface flex items-center justify-center">
            <p className="text-sm text-on-surface-variant">Loading admin console…</p>
          </div>
        }
      >
        <AdminRouter onNavigate={handleNavigate} />
      </Suspense>
    );
  }
  return <ExamScreen onNavigate={handleNavigate} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ExamProvider>
          <ErrorBoundary>
            <ToastProvider>
              <div className="min-h-screen bg-surface font-sans text-on-surface antialiased format-selection">
                <Router />
              </div>
            </ToastProvider>
          </ErrorBoundary>
        </ExamProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

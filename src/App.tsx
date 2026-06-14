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
import { STORAGE_KEYS } from './lib/storageKeys';
import './index.css';

const VALID_SCREENS: ReadonlySet<Screen> = new Set<Screen>([
  'login',
  'dashboard',
  'review',
  'exam',
  'performance',
  'support',
  'profile',
  'leaderboard',
  'admin',
]);

const VALID_ADMIN_SECTIONS: ReadonlySet<AdminSectionId> = new Set<AdminSectionId>([
  'seasons',
  'users',
  'questions',
  'support',
  'stats',
]);

function readPersistedScreen(): Screen {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.screen);
    if (raw && (VALID_SCREENS as ReadonlySet<string>).has(raw)) {
      return raw as Screen;
    }
  } catch {
    // localStorage may be disabled (private mode, sandboxed iframe);
    // fall through to the default.
  }
  return 'login';
}

function writePersistedScreen(screen: Screen): void {
  try {
    if (screen === 'login') {
      localStorage.removeItem(STORAGE_KEYS.screen);
    } else {
      localStorage.setItem(STORAGE_KEYS.screen, screen);
    }
  } catch {
    // Best effort. If localStorage is unavailable the in-memory
    // currentScreen still works for the current page life.
  }
}

function readPersistedAdminSection(): AdminSectionId {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.adminSection);
    if (raw && (VALID_ADMIN_SECTIONS as ReadonlySet<string>).has(raw)) {
      return raw as AdminSectionId;
    }
  } catch {
    // Same localStorage-may-be-disabled caveat as above.
  }
  return 'seasons';
}

function writePersistedAdminSection(section: AdminSectionId): void {
  try {
    localStorage.setItem(STORAGE_KEYS.adminSection, section);
  } catch {
    // Best effort; in-memory state still works for the page life.
  }
}

function AdminRouter({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [section, setSectionState] = useState<AdminSectionId>(() => readPersistedAdminSection());

  // Mirror the screen-level persistence: every section change is
  // written to localStorage so a hard refresh (or a tab restore)
  // brings the admin back to the same section.
  const setSection = (next: AdminSectionId) => {
    setSectionState(next);
    writePersistedAdminSection(next);
  };
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

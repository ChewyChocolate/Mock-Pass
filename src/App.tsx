import { useEffect, useState } from 'react';
import type { Screen } from './types';
import { ThemeProvider } from './ThemeContext';
import { ExamProvider, useExam } from './context/ExamContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ReviewScreen from './screens/ReviewScreen';
import ExamScreen from './screens/ExamScreen';
import './index.css';

function Router() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const { state } = useExam();

  useEffect(() => {
    if (state.status === 'in-progress' && currentScreen !== 'exam') {
      setCurrentScreen('exam');
    }
    if (state.status === 'submitted' && currentScreen !== 'review') {
      setCurrentScreen('review');
    }
  }, [state.status, currentScreen]);

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  if (currentScreen === 'login') return <LoginScreen onNavigate={handleNavigate} />;
  if (currentScreen === 'dashboard') return <DashboardScreen onNavigate={handleNavigate} />;
  if (currentScreen === 'review') return <ReviewScreen onNavigate={handleNavigate} />;
  return <ExamScreen onNavigate={handleNavigate} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ExamProvider>
        <div className="min-h-screen bg-surface font-sans text-on-surface antialiased format-selection">
          <Router />
        </div>
      </ExamProvider>
    </ThemeProvider>
  );
}

import { useState } from 'react';
import type { Screen } from './types';
import { ThemeProvider } from './ThemeContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ReviewScreen from './screens/ReviewScreen';
import ExamScreen from './screens/ExamScreen';
import './index.css';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-surface font-sans text-on-surface antialiased format-selection">
        {currentScreen === 'login' && <LoginScreen onNavigate={handleNavigate} />}
        {currentScreen === 'dashboard' && <DashboardScreen onNavigate={handleNavigate} />}
        {currentScreen === 'review' && <ReviewScreen onNavigate={handleNavigate} />}
        {currentScreen === 'exam' && <ExamScreen onNavigate={handleNavigate} />}
      </div>
    </ThemeProvider>
  );
}

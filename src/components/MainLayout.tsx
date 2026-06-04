import React from 'react';
import { BaseScreenProps, Screen } from '../types';
import { BookOpen, HelpCircle, LayoutDashboard, FileQuestion, BarChart2, Bell, PenTool, Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function MainLayout({ children, onNavigate, currentScreen }: { children: React.ReactNode, onNavigate: BaseScreenProps['onNavigate'], currentScreen: Screen }) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen relative flex">
      {/* Subtle Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none grain-texture z-0 opacity-50"></div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full flex flex-col pt-20 pb-8 bg-surface-container w-64 border-r border-outline-variant z-40 hidden md:flex">
        <div className="px-6 mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Mock Pass</h1>
          <p className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant opacity-70 mt-1">Premium Reviewer</p>
        </div>
        
        <nav className="flex-1 flex flex-col space-y-1">
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`w-full text-left pl-4 py-3 flex items-center gap-3 transition-all ${currentScreen === 'dashboard' ? 'text-primary font-bold border-l-4 border-primary bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-widest uppercase">Dashboard</span>
          </button>
          
          <button 
            onClick={() => onNavigate('exam')}
            className={`w-full text-left pl-4 py-3 flex items-center gap-3 transition-all ${currentScreen === 'exam' ? 'text-primary font-bold border-l-4 border-primary bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-widest uppercase">Take Exam</span>
          </button>
          
          <button 
            onClick={() => onNavigate('review')}
            className={`w-full text-left pl-4 py-3 flex items-center gap-3 transition-all ${currentScreen === 'review' ? 'text-primary font-bold border-l-4 border-primary bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
          >
            <FileQuestion className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-widest uppercase">Review Results</span>
          </button>

          <button className="w-full text-left pl-4 py-3 flex items-center gap-3 transition-all text-on-surface-variant hover:bg-surface-variant hover:text-on-surface">
            <BarChart2 className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-widest uppercase">Performance</span>
          </button>
          
          <button className="w-full text-left pl-4 py-3 flex items-center gap-3 transition-all text-on-surface-variant hover:bg-surface-variant hover:text-on-surface">
            <HelpCircle className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-widest uppercase">Support</span>
          </button>
        </nav>
        
        <div className="px-6 mt-auto">
          <button className="w-full py-3 bg-primary text-on-primary text-xs font-semibold uppercase tracking-widest hover:brightness-110 transition-all border border-transparent hover:border-on-primary rounded">
            Upgrade to Pro
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 z-10 w-full relative">
        {/* Topbar */}
        <header className="bg-surface/90 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
          <div className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" />
                Mock Pass
              </span>
            </div>
            
            <div className="hidden md:flex gap-8 items-center">
              <nav className="flex gap-6">
                <button onClick={() => onNavigate('dashboard')} className={`text-sm font-semibold transition-colors duration-200 ${currentScreen === 'dashboard' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>Home</button>
                <button onClick={() => onNavigate('exam')} className={`text-sm font-semibold transition-colors duration-200 ${currentScreen === 'exam' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>Library</button>
                <button onClick={() => onNavigate('review')} className={`text-sm font-semibold transition-colors duration-200 ${currentScreen === 'review' ? 'text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`}>Community</button>
              </nav>
              
              <div className="flex items-center gap-4 border-l border-outline-variant pl-6">
                <button
                  onClick={toggleTheme}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <Bell className="w-5 h-5 text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
                <div className="w-8 h-8 rounded-full bg-secondary-container overflow-hidden border border-outline-variant flex justify-center items-center">
                    <span className="text-xs uppercase font-bold text-on-secondary">AX</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

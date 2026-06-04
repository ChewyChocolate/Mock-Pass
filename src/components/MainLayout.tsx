import React, { useState, useEffect } from 'react';
import { BaseScreenProps, Screen } from '../types';
import { BookOpen, HelpCircle, LayoutDashboard, FileQuestion, BarChart2, Bell, PenTool, Sun, Moon, Menu, X, LogOut, User } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface NavItem {
  id: Screen;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'exam', label: 'Take Exam', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'review', label: 'Review Results', icon: <FileQuestion className="w-5 h-5" /> },
];

const STUB_ITEMS: { label: string; icon: React.ReactNode }[] = [
  { label: 'Performance', icon: <BarChart2 className="w-5 h-5" /> },
  { label: 'Support', icon: <HelpCircle className="w-5 h-5" /> },
];

export default function MainLayout({ children, onNavigate, currentScreen }: { children: React.ReactNode, onNavigate: BaseScreenProps['onNavigate'], currentScreen: Screen }) {
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
  }, [currentScreen]);

  useEffect(() => {
    if (!drawerOpen && !menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen, menuOpen]);

  const SidebarBody = (
    <>
      <div className="px-6 mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">Mock Pass</h1>
        <p className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant opacity-70 mt-1">
          Premium Reviewer
        </p>
      </div>

      <nav aria-label="Primary" className="flex-1 flex flex-col space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`w-full text-left pl-4 py-3 flex items-center gap-3 transition-all ${
                active
                  ? 'text-primary font-bold border-l-4 border-primary bg-secondary-container text-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
              }`}
            >
              {item.icon}
              <span className="text-xs font-semibold tracking-widest uppercase">{item.label}</span>
            </button>
          );
        })}

        {STUB_ITEMS.map((item) => (
          <button
            key={item.label}
            disabled
            className="w-full text-left pl-4 py-3 flex items-center gap-3 transition-all text-on-surface-variant/50 cursor-not-allowed"
            aria-disabled="true"
          >
            {item.icon}
            <span className="text-xs font-semibold tracking-widest uppercase">{item.label}</span>
            <span className="ml-auto text-[9px] uppercase font-bold tracking-widest border border-outline-variant/40 px-1.5 py-0.5 rounded-sm">
              Soon
            </span>
          </button>
        ))}
      </nav>

      <div className="px-6 mt-auto">
        <button className="w-full py-3 bg-primary text-on-primary text-xs font-semibold uppercase tracking-widest hover:brightness-110 transition-all border border-transparent hover:border-on-primary rounded">
          Upgrade to Pro
        </button>
      </div>
    </>
  );

  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen relative flex">
      <div className="fixed inset-0 pointer-events-none grain-texture z-0 opacity-50"></div>

      <aside className="fixed left-0 top-0 h-full flex flex-col pt-20 pb-8 bg-surface-container w-64 border-r border-outline-variant z-40 hidden md:flex">
        {SidebarBody}
      </aside>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] bg-surface-container h-full flex flex-col pt-8 pb-8 shadow-2xl">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="text-on-surface-variant hover:text-on-surface p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {SidebarBody}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col md:pl-64 z-10 w-full relative">
        <header className="bg-surface/90 backdrop-blur-md border-b border-outline-variant sticky top-0 z-30">
          <div className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden p-2 -ml-2 text-on-surface hover:bg-surface-variant rounded"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" />
                Mock Pass
              </span>
            </div>

            <div className="hidden md:flex gap-8 items-center">
              <nav aria-label="Quick links" className="flex gap-6">
                {NAV_ITEMS.map((item) => {
                  const active = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      aria-current={active ? 'page' : undefined}
                      className={`text-sm font-semibold transition-colors duration-200 ${
                        active
                          ? 'text-primary border-b-2 border-primary pb-1'
                          : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {item.id === 'dashboard' ? 'Home' : item.id === 'exam' ? 'Library' : 'Community'}
                    </button>
                  );
                })}
              </nav>

              <div className="flex items-center gap-4 border-l border-outline-variant pl-6">
                <button
                  onClick={toggleTheme}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  className="text-on-surface-variant cursor-not-allowed opacity-50"
                  aria-label="Notifications (coming soon)"
                  disabled
                >
                  <Bell className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="w-8 h-8 rounded-full bg-secondary-container overflow-hidden border border-outline-variant flex justify-center items-center hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    aria-label="User menu"
                  >
                    <span className="text-xs uppercase font-bold text-on-secondary">AX</span>
                  </button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div
                        role="menu"
                        className="absolute right-0 top-10 w-56 bg-surface-container border border-outline-variant rounded shadow-xl z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-outline-variant">
                          <p className="text-sm font-bold text-on-surface">Alex Aspirant</p>
                          <p className="text-xs text-on-surface-variant">aspirant@gov.ph</p>
                        </div>
                        <button
                          role="menuitem"
                          className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-surface-variant flex items-center gap-2"
                          onClick={() => setMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </button>
                        <button
                          role="menuitem"
                          onClick={() => {
                            setMenuOpen(false);
                            onNavigate('login');
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-surface-variant flex items-center gap-2 border-t border-outline-variant"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="text-on-surface-variant hover:text-primary p-2"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-8 h-8 rounded-full bg-secondary-container overflow-hidden border border-outline-variant flex justify-center items-center"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="User menu"
              >
                <span className="text-xs uppercase font-bold text-on-secondary">AX</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

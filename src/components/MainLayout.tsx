import { useState } from 'react';
import { BaseScreenProps, Screen } from '../types';
import React from 'react';
import { HelpCircle, LayoutDashboard, FileQuestion, BarChart2, Bell, PenTool, Sun, Moon, Menu, X, LogOut, User, Sparkles, Check } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useExam } from '../context/ExamContext';
import { Modal } from './Modal';

interface NavItem {
  id: Screen;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'review', label: 'Review Results', icon: <FileQuestion className="w-5 h-5" /> },
  { id: 'performance', label: 'Performance', icon: <BarChart2 className="w-5 h-5" /> },
  { id: 'support', label: 'Support', icon: <HelpCircle className="w-5 h-5" /> },
];

const PRO_FEATURES = [
  'Unlimited mock exams',
  'Detailed per-topic analytics',
  'Downloadable performance reports',
  'Personalized study plan',
  'Priority support response',
  'No ads, ever',
];

export default function MainLayout({ children, onNavigate, currentScreen }: { children: React.ReactNode, onNavigate: BaseScreenProps['onNavigate'], currentScreen: Screen }) {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useExam();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const closeUpgrade = () => setUpgradeOpen(false);
  const closeMenus = () => {
    setDrawerOpen(false);
    setMenuOpen(false);
  };

  const navigateAndClose = (id: Screen) => {
    onNavigate(id);
    setDrawerOpen(false);
  };

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
              onClick={() => navigateAndClose(item.id)}
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
      </nav>

      <div className="px-6 mt-auto">
        <button
          onClick={() => setUpgradeOpen(true)}
          className="w-full py-3 bg-primary text-on-primary text-xs font-semibold uppercase tracking-widest hover:brightness-110 transition-all border border-transparent hover:border-on-primary rounded flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
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

      <Modal
        open={upgradeOpen}
        onClose={closeUpgrade}
        labelledBy="upgrade-title"
        panelClassName="max-w-2xl"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-container border border-outline-variant flex items-center justify-center rounded-sm">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h2 id="upgrade-title" className="text-2xl font-bold tracking-tight">
            Upgrade to Mock Pass Pro
          </h2>
        </div>
        <p className="text-on-surface-variant mb-6">
          Unlock your full review potential with unlimited exams and deep analytics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-outline-variant rounded p-5">
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-1">
              Free
            </p>
            <p className="text-3xl font-bold text-on-surface mb-3">₱0</p>
            <ul className="text-sm text-on-surface-variant space-y-2">
              <li>3 mock exams / month</li>
              <li>Basic review</li>
              <li>Standard timer</li>
            </ul>
          </div>
          <div className="border-2 border-primary bg-primary-container/30 rounded p-5 relative">
            <span className="absolute -top-2 right-4 bg-primary text-on-primary text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm">
              Most Popular
            </span>
            <p className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">
              Pro · Monthly
            </p>
            <p className="text-3xl font-bold text-on-surface mb-3">
              ₱199<span className="text-base text-on-surface-variant">/mo</span>
            </p>
            <ul className="text-sm text-on-surface space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={closeUpgrade}
            className="flex-1 py-3 border border-outline-variant text-on-surface font-bold uppercase tracking-widest text-xs hover:bg-surface-variant transition-all"
          >
            Maybe Later
          </button>
          <button
            onClick={closeUpgrade}
            className="flex-1 py-3 bg-primary text-on-primary font-bold uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade Now
          </button>
        </div>
        <p className="text-[10px] text-on-surface-variant text-center mt-4 opacity-70">
          Payments are coming soon. This is a preview of the upgrade experience.
        </p>
      </Modal>

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
                {NAV_ITEMS.slice(0, 2).map((item) => {
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
                      {item.label}
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
                            signOut();
                            closeMenus();
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

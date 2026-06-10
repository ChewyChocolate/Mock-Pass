import { CalendarRange, Shield, UserCog, MessageSquare, BarChart3 } from 'lucide-react';
import type { BaseScreenProps } from '../types';

export type AdminSectionId = 'seasons' | 'users' | 'questions' | 'support' | 'stats';

interface AdminNavItem {
  id: AdminSectionId;
  label: string;
  icon: React.ReactNode;
  available: boolean;
}

const ADMIN_NAV: AdminNavItem[] = [
  { id: 'seasons', label: 'Exam Seasons', icon: <CalendarRange className="w-5 h-5" />, available: true },
  { id: 'users', label: 'Users', icon: <UserCog className="w-5 h-5" />, available: false },
  { id: 'questions', label: 'Question Bank', icon: <MessageSquare className="w-5 h-5" />, available: false },
  { id: 'support', label: 'Support', icon: <Shield className="w-5 h-5" />, available: true },
  { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-5 h-5" />, available: true },
];

interface AdminSidebarProps {
  active: AdminSectionId;
  onSelect: (id: AdminSectionId) => void;
}

export function AdminSidebar({ active, onSelect }: AdminSidebarProps) {
  return (
    <nav aria-label="Admin" className="flex-1 flex flex-col space-y-1 px-3">
      {ADMIN_NAV.map((item) => {
        const isActive = active === item.id;
        const base =
          'w-full text-left pl-4 py-3 flex items-center gap-3 transition-all rounded-sm text-xs font-semibold tracking-widest uppercase';
        if (!item.available) {
          return (
            <div
              key={item.id}
              aria-disabled
              className={`${base} text-on-surface-variant/40 cursor-not-allowed`}
              title="Coming soon"
            >
              <span className="opacity-60">{item.icon}</span>
              <span>{item.label}</span>
              <span className="ml-auto text-[9px] border border-outline-variant/40 px-1.5 py-0.5 rounded-sm">
                soon
              </span>
            </div>
          );
        }
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`${base} ${
              isActive
                ? 'text-primary font-bold border-l-4 border-primary bg-secondary-container text-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

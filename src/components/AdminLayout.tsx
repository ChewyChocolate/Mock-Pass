import type { ReactNode } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { AdminSidebar, type AdminSectionId } from './AdminSidebar';
import type { BaseScreenProps } from '../types';

export type { AdminSectionId };

interface AdminLayoutProps {
  children: ReactNode;
  active: AdminSectionId;
  onSelect: (id: AdminSectionId) => void;
  onNavigate: BaseScreenProps['onNavigate'];
}

export function AdminLayout({ children, active, onSelect, onNavigate }: AdminLayoutProps) {
  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen relative flex">
      <div className="fixed inset-0 pointer-events-none grain-texture z-0 opacity-50"></div>

      <aside className="fixed left-0 top-0 h-full flex flex-col pt-6 pb-6 bg-surface-container w-64 border-r border-outline-variant z-40 hidden md:flex">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-terracotta" />
            <h1 className="text-base font-semibold tracking-tight text-on-surface">Admin</h1>
          </div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-on-surface-variant opacity-70">
            Mock Pass Console
          </p>
        </div>
        <AdminSidebar active={active} onSelect={onSelect} />
        <div className="px-6 mt-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full py-2.5 bg-surface-container-high border border-outline-variant text-on-surface text-xs font-semibold uppercase tracking-widest hover:bg-surface-variant transition-all rounded flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to app
          </button>
        </div>
      </aside>

      <div className="flex-1 md:pl-64 relative z-10 flex flex-col min-h-screen">
        <header className="md:hidden bg-surface-container border-b border-outline-variant px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-terracotta" />
            <h1 className="text-base font-semibold tracking-tight">Admin</h1>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-semibold uppercase tracking-widest text-primary inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            App
          </button>
        </header>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

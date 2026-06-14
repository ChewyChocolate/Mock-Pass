import { useState } from 'react';
import type { Screen } from '../types';
import {
  readPersistedAdminSection,
  writePersistedAdminSection,
} from '../lib/persistedNavigation';
import { type AdminSectionId } from '../components/AdminSidebar';
import AdminSeasonsScreen from './AdminSeasonsScreen';
import AdminStatsScreen from './AdminStatsScreen';
import AdminSupportScreen from './AdminSupportScreen';
import AdminUsersScreen from './AdminUsersScreen';
import AdminQuestionsScreen from './AdminQuestionsScreen';

export default function AdminRouter({ onNavigate }: { onNavigate: (s: Screen) => void }) {
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

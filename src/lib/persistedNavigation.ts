import type { Screen } from '../types';
import { type AdminSectionId } from '../components/AdminSidebar';
import { STORAGE_KEYS } from './storageKeys';

/**
 * localStorage-backed persistence of the last-viewed screen.
 *
 * - 'login' is intentionally NOT persisted so a sign-out clears
 *   the saved value and a logged-out user always lands on login
 *   after a refresh.
 * - On read, the raw value is validated against the Screen union
 *   (a hand-edited or corrupt localStorage value cannot inject a
 *   bad screen).
 */

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

export function readPersistedScreen(): Screen {
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

export function writePersistedScreen(screen: Screen): void {
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

const VALID_ADMIN_SECTIONS: ReadonlySet<AdminSectionId> = new Set<AdminSectionId>([
  'seasons',
  'users',
  'questions',
  'support',
  'stats',
]);

export function readPersistedAdminSection(): AdminSectionId {
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

export function writePersistedAdminSection(section: AdminSectionId): void {
  try {
    localStorage.setItem(STORAGE_KEYS.adminSection, section);
  } catch {
    // Best effort; in-memory state still works for the page life.
  }
}

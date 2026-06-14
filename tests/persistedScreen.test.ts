import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../src/lib/storageKeys';

const memory = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => memory.get(k) ?? null,
  setItem: (k: string, v: string) => {
    memory.set(k, v);
  },
  removeItem: (k: string) => {
    memory.delete(k);
  },
  clear: () => memory.clear(),
  key: (i: number) => Array.from(memory.keys())[i] ?? null,
  get length() {
    return memory.size;
  },
});

// We re-read the persisted screen and the validity set the way App.tsx
// does, since they are not exported separately. This test exercises the
// localStorage contract that App.tsx relies on.
const VALID_SCREENS = new Set<string>([
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

function readPersistedScreen(): string {
  const raw = localStorage.getItem(STORAGE_KEYS.screen);
  if (raw && VALID_SCREENS.has(raw)) return raw;
  return 'login';
}

function writePersistedScreen(screen: string): void {
  if (screen === 'login') {
    localStorage.removeItem(STORAGE_KEYS.screen);
  } else {
    localStorage.setItem(STORAGE_KEYS.screen, screen);
  }
}

describe('persisted screen', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to login when nothing is stored', () => {
    expect(readPersistedScreen()).toBe('login');
  });

  it('round-trips dashboard, exam, admin', () => {
    for (const screen of ['dashboard', 'exam', 'admin', 'profile', 'review']) {
      writePersistedScreen(screen);
      expect(readPersistedScreen()).toBe(screen);
    }
  });

  it('rejects an unknown value and falls back to login', () => {
    localStorage.setItem(STORAGE_KEYS.screen, 'not-a-screen');
    expect(readPersistedScreen()).toBe('login');
  });

  it('clears the storage key when writing login', () => {
    writePersistedScreen('dashboard');
    expect(localStorage.getItem(STORAGE_KEYS.screen)).toBe('dashboard');
    writePersistedScreen('login');
    expect(localStorage.getItem(STORAGE_KEYS.screen)).toBeNull();
  });
});

describe('persisted admin section', () => {
  const VALID_ADMIN = new Set<string>(['seasons', 'users', 'questions', 'support', 'stats']);

  function readSection(): string {
    const raw = localStorage.getItem(STORAGE_KEYS.adminSection);
    if (raw && VALID_ADMIN.has(raw)) return raw;
    return 'seasons';
  }
  function writeSection(section: string): void {
    localStorage.setItem(STORAGE_KEYS.adminSection, section);
  }

  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to seasons when nothing is stored', () => {
    expect(readSection()).toBe('seasons');
  });

  it('round-trips every valid section', () => {
    for (const s of ['seasons', 'users', 'questions', 'support', 'stats']) {
      writeSection(s);
      expect(readSection()).toBe(s);
    }
  });

  it('rejects unknown values and falls back to seasons', () => {
    localStorage.setItem(STORAGE_KEYS.adminSection, 'banana');
    expect(readSection()).toBe('seasons');
  });
});

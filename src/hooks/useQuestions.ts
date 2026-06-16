import { useEffect, useState } from 'react';
import { refreshQuestionsFromDb } from '../lib/questions';

let refreshPromise: Promise<void> | null = null;

/**
 * Idempotent: triggers one fetch per app load and caches the result
 * in a module-level variable inside lib/questions.ts. Safe to call
 * from any number of components.
 */
export function preloadQuestions(): Promise<void> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshQuestionsFromDb().catch(() => undefined);
  return refreshPromise;
}

/**
 * React hook variant for components that want to know whether the
 * refresh has completed (e.g. to show a "DB-backed" badge in the admin).
 */
export function useQuestionsLoaded(): { loaded: boolean } {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    preloadQuestions().then(() => {
      if (active) setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);
  return { loaded };
}

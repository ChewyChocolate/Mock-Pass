import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking. Silently no-ops if
 * `VITE_SENTRY_DSN` is unset so the app works fine in development and
 * in deployments that haven't opted into Sentry.
 *
 * Best paired with the Vercel Sentry integration, which auto-populates
 * the DSN env var on deploy.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || typeof dsn !== 'string') {
    if (import.meta.env.DEV) {
      console.info(
        '[mockpass] VITE_SENTRY_DSN is unset; Sentry error tracking is disabled.',
      );
    }
    return;
  }
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: false,
    integrations: [
      Sentry.browserTracingIntegration(),
      // Mask all text in replays and block all media. The login screen
      // captures the user's email + password as they type, and the
      // review screen shows their exam answers — both are PII. Without
      // these options, `replaysOnErrorSampleRate: 1.0` would record
      // them in plaintext to Sentry's servers. `sendDefaultPii: false`
      // does NOT apply to replays; only `maskAllText` does.
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}

export { Sentry };

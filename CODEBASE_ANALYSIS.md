# Mock Pass — Codebase Analysis

## Stack

React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Lucide icons + Motion (Framer). Deployed as an AI Studio applet (Cloud Run). `@google/genai` and `express` are declared in `package.json` but never imported in source.

## Repository Layout

```
.
├── index.html              # Vite entry, mounts #root
├── vite.config.ts          # React + Tailwind plugins, @ alias to repo root, HMR toggle
├── tsconfig.json           # ES2022, react-jsx, bundler resolution, noEmit
├── package.json            # scripts: dev / build / preview / clean / lint
├── metadata.json           # AI Studio capability: SERVER_SIDE_GEMINI_API
├── .env.example            # GEMINI_API_KEY, APP_URL (injected by AI Studio)
├── README.md
└── src/
    ├── main.tsx                # createRoot + StrictMode
    ├── App.tsx                 # Screen router (state-machine, no react-router)
    ├── types.ts                # Screen / Question / ExamSession types
    ├── index.css               # Tailwind v4 @theme tokens, dark mode, print CSS
    ├── ThemeContext.tsx        # light/dark, persisted in localStorage
    ├── context/
    │   └── ExamContext.tsx     # useReducer + persistence + timer
    ├── data/
    │   └── questions.ts        # 25 CSE questions, EXAM_DURATION_SECONDS, PASSING_SCORE
    ├── hooks/
    │   └── useFocusTrap.ts     # A11y focus trap for modals
    ├── components/
    │   └── MainLayout.tsx      # Shell: sidebar, header, upgrade modal
    └── screens/
        ├── LoginScreen.tsx
        ├── DashboardScreen.tsx
        ├── ExamScreen.tsx
        ├── ReviewScreen.tsx
        ├── PerformanceScreen.tsx
        └── SupportScreen.tsx
```

## Architecture

### Routing — `src/App.tsx`
- `currentScreen` is a plain `useState<Screen>` value; no URL routing.
- `App.tsx:17-24` runs an effect that **force-navigates** to `exam` when `state.status === 'in-progress'` and to `review` when `state.status === 'submitted'`, unless the user is on `login`. This is fragile — it can fight user-initiated navigation.
- `handleNavigate` resets scroll to top on every change.

### State — `src/context/ExamContext.tsx`
- Classic `useReducer` with actions:
  `START_EXAM | SELECT_ANSWER | TOGGLE_FLAG | GO_TO | NEXT | PREV | TICK | SUBMIT | RESET | SIGN_OUT | HYDRATE`.
- Persists a subset of state to `localStorage` key `mockpass:exam:v1` on every change.
- Hydrates on mount; if a session was `in-progress`, `timeLeft` is reset to the full duration (elapsed time is lost — see Issues).
- 1 Hz ticker (`setInterval`) only runs while status is `in-progress`.
- Auto-submits when `timeLeft === 0` via a separate effect.
- `correctCount` and `score` are computed by iterating `state.questions` inside the context value object — recalculated on every render (see Issues).

### Theming — `src/ThemeContext.tsx` + `src/index.css`
- `ThemeProvider` defaults to dark, persists `'light' | 'dark'` to `localStorage` key `theme`, toggles the `.dark` class on `<html>`.
- Tailwind v4 `@theme` block declares Material-3-style tokens (`--color-surface`, `--color-primary`, `--color-tertiary`, etc.) once; `.dark` block overrides them. No `dark:` variant clutter in components.
- Custom utilities: `.cse-pattern` (radial dot grid), `.grain-texture`, `.mechanical-button` (animated focus border), `.step-indicator`, `.input-textured`, `.custom-focus`, `.custom-scrollbar`.
- `@media print` strips chrome (header, aside, nav, `.no-print`), grayscales the report (`.printable-report`), and prevents section breaks.

### A11y — `src/hooks/useFocusTrap.ts`
- Generic `useFocusTrap<T>(active)` returns a ref. When active: stores `document.activeElement`, focuses the first focusable child on the next frame, traps `Tab`/`Shift+Tab` cyclically, restores focus on unmount.
- Used by the upgrade modal (MainLayout), the submit-confirm modal (ExamScreen), and the mobile question navigator sheet (ExamScreen).

## Screens

| File | Purpose | Notable details |
|---|---|---|
| `LoginScreen.tsx` | Cosmetic auth form | Any submit → `dashboard`. Theme toggle in footer. Decorative Google SVG path is malformed. |
| `DashboardScreen.tsx` | Welcome + KPIs | Three KPI cards (Average / Exams / Hours), weekly goal bar (`recent.length / 3`), recent-activity table linking to review. |
| `ExamScreen.tsx` | Take the exam | Header with progress bar + timer (turns red+pulse when `< 300s`). Sidebar question navigator on desktop, modal sheet on mobile. Footer toolbar: exit, flag, prev/next, submit. Submit confirm modal and navigator modal both use focus trap. Idle and submitted states render their own small pages. |
| `ReviewScreen.tsx` | Score report | SVG donut score, pass/fail banner (≥ 80%), per-topic proficiency bars, filterable question list (all/incorrect/flagged/correct) with accordion explanations, `window.print()` button. Falls back to a "no results" page when status isn't `submitted`. |
| `PerformanceScreen.tsx` | History analytics | 4 KPIs (Average, Best, Pass Rate, Streak), hand-rolled SVG trend chart with passing-score reference line, last-5 sessions list, time analytics (total / avg / fastest). |
| `SupportScreen.tsx` | Help | Three contact cards, FAQ accordion (6 items), client-only contact form with success state. |

## Data — `src/data/questions.ts`
- `EXAM_DURATION_SECONDS = 9895` (2h 44m 55s).
- `PASSING_SCORE = 80`.
- `QUESTION_BANK`: 25 questions across `Verbal Ability`, `Numerical Ability`, `Analytical Reasoning`, `General Information`, each with `id`, `prompt`, 4 options (A–D), `correctOptionId`, and an `explanation`.

## Types — `src/types.ts`
```ts
type Screen = 'login' | 'dashboard' | 'review' | 'exam' | 'performance' | 'support';
type QuestionTopic = 'Verbal Ability' | 'Numerical Ability' | 'Analytical Reasoning' | 'General Information';
type ExamStatus = 'idle' | 'in-progress' | 'submitted';
type QuestionStatus = 'unanswered' | 'answered' | 'flagged';

interface Question { id; topic; prompt; options[]; correctOptionId; explanation; }
interface ExamSessionSummary { id; startedAt; submittedAt; totalQuestions; correct; score; timeSpentSeconds; }
```
`ExamSessionSummary` does **not** include per-topic stats — see the dead `topicMastery` in PerformanceScreen.

## Issues / Smells

### Functional bugs
- **`src/context/ExamContext.tsx:172`** — reloading mid-exam resets `timeLeft` to the full duration. Either drop the in-progress persistence or persist `startedAt`/`endsAt` and compute `timeLeft` from wall-clock.
- **`src/App.tsx:17-24`** — the navigation effect can override user-initiated screen changes; only `currentScreen !== 'login'` blocks it.
- **`src/screens/PerformanceScreen.tsx:220-229`** — `topicMastery` builds a `Map`, never populates it, returns `[]`. Per-topic mastery across history is impossible because `ExamSessionSummary` doesn't store it. Either remove the dead code or extend the summary.
- **`src/screens/DashboardScreen.tsx:53`** — `target = totalQuestions * 3` is computed but unused; weekly progress is `recent.length / 3`.
- **`src/screens/LoginScreen.tsx:92-94`** — Google SVG `path` is a placeholder/garbled.

### Cross-platform / tooling
- **`package.json:10`** — `"clean": "rm -rf dist server.js"` is POSIX only; fails on Windows PowerShell. Use `rimraf` or a platform-safe script.
- **No tests**, no ESLint, no error boundary. `npm run lint` is just `tsc --noEmit`.
- **`README.md:18`** references `.env.local`, but no code reads `import.meta.env.GEMINI_API_KEY`. The Gemini dependency and the documented setup step are currently no-ops.

### Performance / code quality
- **`src/context/ExamContext.tsx:245-259`** — `correctCount` and `score` iterate `state.questions` twice on every render of the provider value. Compute once with `useMemo` or a derived selector.
- **`src/components/MainLayout.tsx:236-252`** — desktop quick-links relabel `dashboard / exam / review` as `Home / Library / Community`, inconsistent with the sidebar labels and confusing for `aria-current` users.
- **`src/screens/ExamScreen.tsx:50`** — the idle screen shows `Math.floor(state.timeLeft / 60)` minutes, but `EXAM_DURATION_SECONDS` is 2h 44m 55s, so it displays "164 minutes" rather than a friendlier "2h 45m".
- **`src/screens/PerformanceScreen.tsx:412`** — `Math.min(...history.map(...))` will throw `Infinity` if history empties between checks; guarded by `hasHistory` so currently safe, but fragile.

### Security / hygiene
- No input validation on the support form before "send"; harmless because there's no backend.
- `localStorage`-only persistence — clearing browser data wipes everything (documented in FAQ, which is good).
- `vite.config.ts` `server.hmr` toggled by `DISABLE_HMR` env — AI Studio specific.

## Strengths

- Clear separation of concerns (context / hooks / screens / components / data).
- Strong accessibility primitives: focus trap, `aria-modal`, `aria-current`, `aria-expanded`, `aria-controls`, ESC handling, visible focus rings.
- Typed reducer with discriminated-union actions.
- Curated CSE question bank with substantive explanations.
- Thoughtful print stylesheet that turns the review into a clean report.
- Dark mode implemented purely via CSS custom properties — components stay token-driven.
- Sensible use of `useMemo` in screen components for derived stats.

## Suggested Next Steps (in priority order)

1. Fix mid-exam timer persistence (`ExamContext.tsx`) — store `endsAt` instead of `timeLeft`.
2. Replace the force-navigation effect in `App.tsx` with explicit transitions from the screens themselves.
3. Decide on `PerformanceScreen.topicMastery`: either delete the dead code or persist `topicStats` in `ExamSessionSummary`.
4. Make `npm run clean` cross-platform; add ESLint + a basic test setup (Vitest + React Testing Library).
5. Either wire up `@google/genai` (the metadata advertises `SERVER_SIDE_GEMINI_API`) or drop the dependency and the `.env.local` instructions.
6. Add an error boundary at the App root.
7. Memoize `correctCount` / `score` in `ExamContext`.
8. Align desktop quick-link labels with sidebar labels in `MainLayout.tsx`.

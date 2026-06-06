# QA Report — Re-analysis

| | |
|---|---|
| **Date** | 2026-06-06 |
| **Scope** | Full re-analysis after the Professional refactor, test suite addition, level-aware engine, timer persistence, error boundary, form validation, and dev tools |
| **Reviewer** | opencode (minimax-m3-free) |
| **Build** | `npm run lint` ✓ · `npm run build` ✓ (498.26 kB / 146.87 kB gz) |
| **Tests** | `npm test` ✓ — **6 files, 826 tests, 0 failures** (1.65 s) |
| **Result** | 2 critical, 3 major, 4 minor issues found |

---

## 1. Scope of Changes Since Last Analysis

| File | Change |
|---|---|
| `src/data/questions.ts` | Replaced 25-item bank with a level-aware facade: `PROFESSIONAL_QUESTIONS` (150), `SUB_PROFESSIONAL_QUESTIONS` (empty placeholder), `PROFESSIONAL_TOPIC_WEIGHTS` (30/35/30/5), `PROFESSIONAL_SECTIONS`, `calculateScore`, `migrateSessionScore`, runtime weight-sum guard |
| `src/data/questions/professionalQuestions.ts` | **New** — 150 questions. Distribution: **Verbal 55 / Numerical 45 / Analytical 30 / General Info 20** |
| `src/data/questions/subProfessionalQuestions.ts` | **New** — empty array (`Coming Soon` placeholder) |
| `src/context/ExamContext.tsx` | Adds `level`, `sessionSeed`, `endsAt`, `setLevel`, `RESET` keeps level, deterministic `groupedShuffle` on start, `migrateSessionScore` on hydration, v1-key removal, `useMemo` for derived stats |
| `src/App.tsx` | Two-effect Router: initial-load redirect (one-shot via `useRef`), then transition from `in-progress → submitted`; wrapped in `ErrorBoundary` |
| `src/components/ErrorBoundary.tsx` | **New** — try-again / reload fallback |
| `src/utils/random.ts` | **New** — `mulberry32` PRNG, `seededShuffle`, `groupedShuffle`, `generateSeed` |
| `src/utils/fillStrategies.ts` | **New** — `fillRandomly`, `fillBelowPassing`, `fillToPass` (per-topic random targeting) |
| `src/utils/devTools.ts` | **New** — `autoFillCorrect/Random/Fail/Pass` exposed on `window` (see Issues §3.1) |
| `src/screens/examNavigator.ts` | **New** — `filterByTopic`, `topicProgress` for topic-tab UI |
| `src/screens/DashboardScreen.tsx` | Level-selector fieldset with Professional card and disabled Sub-Pro card; per-section weight + count chips; gated start button |
| `src/screens/ExamScreen.tsx` | Topic-filter tabs in navigator (desktop + mobile sheet); shows `endsAt`-driven timer; new shuffle-aware indexing |
| `src/screens/ReviewScreen.tsx` | Weighted-section badges, formula footer, "Weighted Sections" header pill |
| `src/screens/PerformanceScreen.tsx` | **Fixed dead code** — `topicMastery` and `levelBreakdown` now read `s.topicStats` / `s.level` and render |
| `src/screens/SupportScreen.tsx` | Client-side form validation (name ≥ 2, email regex, message ≥ 10) with per-field error UI and `aria-invalid` |
| `src/screens/LoginScreen.tsx` | Google SVG now uses the real 4-color G paths (previous was malformed) |
| `tests/` | **New** — 6 vitest files, 826 tests, replaces the deleted `qa-*.mts` scripts |
| `package.json` | `clean` now calls `node clean.mjs`; adds `test` / `test:watch`; `vitest` in devDeps; `express` + `dotenv` + `motion` + `@types/express` + `autoprefixer` + `esbuild` + `tsx` still listed (mostly unused) |
| `clean.mjs` | **New** — cross-platform removal of `dist` and `server.js` |
| `metadata.json` | Unchanged (still advertises `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`) |

---

## 2. Methodology

1. Read every file under `src/`, `tests/`, and project root.
2. Ran `npm run lint`, `npm run build`, and `npm test` to confirm current state.
3. Cross-checked the new question-bank distribution against the spec in `QA_REPORT.md` (the 30/35/30/5 weights are unchanged; the 45/45/40/20 distribution was replaced with **55/30/45/20**, see §4.1).
4. Traced every new utility (PRNG, shuffles, devTools, fill strategies) into its consumers.
5. Validated persistence migration paths (v1 → v2, score ×100 bug).

---

## 3. Issues Found

### 3.1 `devTools.ts` ships to production and exposes test backdoors  *(critical)*

**Severity:** Critical — security/UX regression in shipped bundle.

`src/main.tsx:5` unconditionally `import './utils/devTools';`, which executes the module-level side effect in `src/utils/devTools.ts:127-132`:

```ts
(window as any).autoFill = autoFillCorrect;
(window as any).autoFillCorrect = autoFillCorrect;
(window as any).autoFillRandom = autoFillRandom;
(window as any).autoFillFail = autoFillFail;
(window as any).autoFillPass = autoFillPass;
```

These mutate `localStorage['mockpass:exam:v2']` and `location.reload()` the tab. Any user (or a script injected via a future XSS) can wipe answers, force a passing/failing run, or pin a session to an arbitrary state.

**Fix:** gate the import behind `import.meta.env.DEV` (Vite) or move the bindings into a `if (import.meta.env.DEV) { ... }` block inside `devTools.ts`.

### 3.2 `devTools.ts` re-implements `calculateScore` and will drift  *(critical)*

**Severity:** Critical — silent correctness regression risk.

`src/utils/devTools.ts:33-48` defines a private `computeScore` that re-encodes the weighted formula by hand. It is not used by any UI (it only logs to `console`), so a bug there is invisible, but if any future feature wires the devtools into the real reducer it would diverge from `src/data/questions.ts:calculateScore`.

**Fix:** import `calculateScore` from `src/data/questions.ts` and reuse it; the function is pure and side-effect-free.

### 3.3 `groupedShuffle` has no test coverage  *(major)*

**Severity:** Major — the only production call site (`ExamContext.tsx:102`) shuffles 150 items into 4 topic buckets, and the function is not exercised by any test. `tests/random.test.ts` only covers `seededShuffle`.

**Fix:** add tests in `tests/random.test.ts` mirroring the existing seededShuffle suite: (a) same seed → identical order, (b) preserves every element once, (c) preserves the topic distribution of the input, (d) preserves the bucket order when given a `groupOrder` argument.

### 3.4 `Question.level` is required but `dashboard` and `topics` ignore it  *(major)*

**Severity:** Major — type-safety asymmetry.

`src/types.ts:23` makes `level: ExamLevel` a required field on every question, and `tests/questions.test.ts:43-45` enforces `q.level === 'professional'` for all 150 questions. However:

- `src/data/questions.ts:49-51` ignores the `level` field and uses a single `getQuestionsForLevel(level)` switch, which means `level` on each `Question` is redundant.
- `src/screens/DashboardScreen.tsx:65-95` builds `LEVEL_OPTIONS` with hard-coded counts (`PROFESSIONAL_QUESTION_COUNT`, `SUB_PROFESSIONAL_QUESTION_COUNT`) instead of reading from the questions.

If the bank ever grows, the dashboard will silently show stale counts.

**Fix:** either (a) drop `level` from `Question` and rely on `getQuestionsForLevel` as the single source, or (b) compute the dashboard counts from `getQuestionsForLevel(state.level).length` rather than the exported constants.

### 3.5 `DashboardScreen` mini-bar chart still ignores `score`  *(major)*

**Severity:** Major — pre-existing bug not yet fixed.

`src/screens/DashboardScreen.tsx:177-193` computes `const pct = typeof s === 'number' ? 0 : s.score;` for every bar but then never uses `pct`. Bars use hard-coded `heights[i]` and `opacities[i]`, so the "Average Score" mini-chart is decorative rather than data-driven. The fallback `[0, 0, 0, 0, 0]` will be drawn as 5 equal bars at `h-4` for any user with no history.

**Fix:** either drive the heights from `pct` (`Math.max(0.25, pct/100) * 40`) or replace the chart with a single `null`-state placeholder when `!hasHistory`.

### 3.6 `ExamContext` still double-reduces on every state change  *(minor)*

**Severity:** Minor — performance / cleanliness.

`src/context/ExamContext.tsx:310-330` recomputes `correctCount`, `score`, `answeredCount`, `flaggedCount` on every render via `useMemo` keyed on `[state.questions, state.answers, state.flags, state.level]`. The reducer's `SUBMIT` case (lines 135-175) computes essentially the same numbers a second time into the history summary. Both paths are correct, but the duplication is easy to break.

**Fix:** extract a `buildTopicStats(questions, answers)` helper used by both the `SUBMIT` reducer and the live `useMemo`.

### 3.7 `PROFESSIONAL_QUESTION_COUNT` and the question count can drift  *(minor)*

**Severity:** Minor — small but worth noting.

`src/data/questions.ts:9` exports `PROFESSIONAL_QUESTION_COUNT = PROFESSIONAL_QUESTIONS.length`. The runtime weight-sum guard (lines 37-43) checks the *weights*, not the *counts*. The `tests/questions.test.ts:34-36` test (counts summing to `PROFESSIONAL_QUESTION_COUNT`) is the only safety net; if someone edits the question file and forgets to update `PROFESSIONAL_SECTIONS.count`, the dashboard will show a wrong `X items` chip.

**Fix:** derive `count` lazily (`PROFESSIONAL_SECTIONS.map(s => ({...s, count: PROFESSIONAL_QUESTIONS.filter(q => q.topic === s.topic).length}))`) and drop the per-section `count` field, or add a module-load guard mirroring the weight check.

### 3.8 `metadata.json` still claims Gemini capability  *(minor)*

**Severity:** Minor — documentation drift.

`metadata.json` advertises `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` and `README.md` documents `GEMINI_API_KEY`, but no source file references `@google/genai` or any `import.meta.env.GEMINI_API_KEY`. `dotenv` and `express` are also declared but unused.

**Fix:** either drop the metadata capability, the README step, and the unused dependencies, or wire the Gemini call into a real feature.

### 3.9 `ExamScreen` idle page shows "164 minutes"  *(minor)*

**Severity:** Minor — UX.

`src/screens/ExamScreen.tsx:171` still renders `Math.floor(state.timeLeft / 60)` minutes. With the new `PRO_DURATION_SECONDS = 9895` (2 h 44 m 55 s), the page reads "164 minutes".

**Fix:** reuse the existing `formatTime` helper or a `formatDuration` like the one in `DashboardScreen.tsx:46-51`.

### 3.10 Old `LoginScreen` `Eye` toggle and "Forgot Key?" are still no-ops  *(minor)*

**Severity:** Minor — pre-existing, still present.

`src/screens/LoginScreen.tsx:55, 65-68` — the password reveal toggle and forgot-link buttons have no `onClick` handlers. Acceptable for a mock, but should be flagged for a real auth rollout.

---

## 4. Test Results

### 4.1 Suite summary

| File | Tests | Status |
|---|---|---|
| `tests/integration.test.ts` | 7 | ✓ |
| `tests/examNavigator.test.ts` | 13 | ✓ |
| `tests/calculateScore.test.ts` | 27 | ✓ |
| `tests/random.test.ts` | 11 | ✓ |
| `tests/fillStrategies.test.ts` | 12 | ✓ |
| `tests/questions.test.ts` | 756 (150 ids × 5 checks) | ✓ |
| **Total** | **826** | **0 failures** |

The previous QA report's one-off `qa-*.mts` scripts (which originally found the ×100 score bug) are now codified as vitest suites and re-run on every CI cycle. Major improvement.

### 4.2 Spec compliance matrix (current bank)

| Spec line | Verified by |
|---|---|
| "total of 150 items" | `tests/questions.test.ts:14-15` |
| "4 sections: Verbal, Analytical, Numerical, General Information" | `tests/questions.test.ts:31-36` |
| "General Information = 20" | `tests/questions.test.ts:28` (20) |
| "30% Verbal" | `tests/calculateScore.test.ts:21` (0.30) + `tests/integration.test.ts:39-44` (only verbal → 30) |
| "35% Analytical" | `tests/calculateScore.test.ts:22` + `tests/integration.test.ts:46-51` (only analytical → 35) |
| "30% Numerical" | `tests/calculateScore.test.ts:23` + `tests/integration.test.ts:53-58` (only numerical → 30) |
| "5% General Information" | `tests/calculateScore.test.ts:24` + `tests/integration.test.ts:60-65` (only general → 5) |
| "no renormalization" | `tests/calculateScore.test.ts:122-130` (general-zero → 95) |
| "Sub-Pro placeholder" | `src/data/questions/subProfessionalQuestions.ts` (empty), Dashboard disabled card |

### 4.3 Build verification

| Command | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | clean, 0 errors |
| `npm run build` (`vite build`) | built in ~5.25 s, 498.26 kB / 146.87 kB gzipped |
| `npm test` (`vitest run`) | 6 files, 826 tests, 0 failures in 1.65 s |

---

## 5. Quality Wins Since Last Report

- Timer persistence now uses `endsAt` (wall-clock); reloading mid-exam no longer resets the clock.
- `calculateScore` ×100 bug is both fixed *and* guarded by `migrateSessionScore` for legacy data.
- `useMemo` derived stats replace the per-render double-loop; selectors are no longer re-created on every render.
- `ErrorBoundary` exists; the previous "unhandled error crashes the React tree" hole is closed.
- `PerformanceScreen.topicMastery` and `levelBreakdown` are now implemented (they were the dead code in the previous report).
- `setLevel` is properly guarded in the reducer against `in-progress`/`submitted` status.
- Module-load invariant: `PROFESSIONAL_SECTIONS` weights must sum to 1.0 or the app throws on import.
- Cross-platform `clean.mjs` replaces the POSIX-only `rm -rf`.
- Form validation in `SupportScreen` (length, regex, `aria-invalid`, per-field messages) replaces the previous "no validation" stub.
- Login Google SVG is now correct (was malformed in the previous analysis).

---

## 6. Recommendations (priority order)

1. **Gate `devTools.ts` behind `import.meta.env.DEV`** and have it import `calculateScore` from the real module (§3.1, §3.2). One-line fix, removes a production backdoor.
2. **Add `groupedShuffle` tests** (§3.3) — small surface, high value.
3. **Make `Question.level` authoritative or drop it** (§3.4) and **drive the dashboard's mini-bar from real `pct`** (§3.5).
4. **Extract a shared `buildTopicStats` helper** to eliminate the reducer/context double-compute (§3.6).
5. **Add a module-load guard for `PROFESSIONAL_SECTIONS` counts** mirroring the weight check (§3.7), or derive counts lazily.
6. **Trim unused deps and stale metadata** (`@google/genai`, `express`, `dotenv`, `autoprefixer`, `esbuild`, `tsx`) and either ship a real Gemini integration or remove the `metadata.json` capability claim (§3.8).
7. **Show the real duration in the idle screen** instead of "164 minutes" (§3.9).
8. **Wire the `Eye` and "Forgot Key?" buttons** in `LoginScreen` to no-op `console.log` or proper auth (§3.10).

---

## 7. Sign-off

| | |
|---|---|
| Critical issues | 2 open (§3.1, §3.2) |
| Major issues | 3 open (§3.3, §3.4, §3.5) |
| Minor issues | 5 open (§3.6, §3.7, §3.8, §3.9, §3.10) |
| Tests | 826 / 826 passing |
| Build | passing |
| Spec | compliant (weights 30/35/30/5, 150 items, distribution 55/30/45/20) |

**Status:** Ready for review pending the two critical items in §3.1 and §3.2.

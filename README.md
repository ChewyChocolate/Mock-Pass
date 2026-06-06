<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Mock Pass — Civil Service Exam Reviewer

A React + Vite single-page app for practicing the Philippine Civil Service
Commission exam (Professional level). Includes a 150-item timed mock, weighted
section scoring, persistent local history, and a topic-by-topic breakdown.

## Run Locally

**Prerequisites:** Node.js (LTS)

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

The dev server runs on port 3000 by default (`http://localhost:3000`).

## Scripts

- `npm run dev` — start the Vite dev server.
- `npm run build` — produce a production build in `dist/`.
- `npm run preview` — preview the production build locally.
- `npm test` / `npm run test:watch` — run the Vitest suite.
- `npm run lint` — type-check the project with `tsc --noEmit`.
- `npm run clean` — delete the `dist/` folder and the legacy `server.js`.

## Project Layout

- `src/data/questions/` — the 150-item Professional bank (q-001 to q-150).
- `src/data/questions.ts` — `calculateScore`, `migrateSessionScore`,
  `buildTopicStats`, and the weighted-section table.
- `src/context/ExamContext.tsx` — reducer, shuffle, persistence, and the
  derived stats surfaced to screens.
- `src/screens/` — `LoginScreen`, `DashboardScreen`, `ExamScreen`,
  `ReviewScreen`, `PerformanceScreen`, `SupportScreen`.

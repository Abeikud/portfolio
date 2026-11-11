# Daniel Dampson — Portfolio

A personal portfolio styled after a football video game's main menu: a full-bleed
stadium scene, a big vertical menu that fades away from the selected item, and a
preview panel that updates as you move through it. Each menu entry opens a
detail screen, and the tiles on those screens open further detail.

Built test-first in small, reviewable phases. See [`docs/PLAN.md`](docs/PLAN.md).

## Stack

React · TypeScript · Vite · React Router · Vitest + Testing Library · Playwright

## Scripts

| Command            | What it does                                    |
| ------------------ | ----------------------------------------------- |
| `npm run dev`      | Start the dev server                            |
| `npm test`         | Unit + component tests (Vitest)                 |
| `npm run test:e2e` | End-to-end tests (Playwright, production build) |
| `npm run check`    | Typecheck, lint, unit tests with coverage, e2e  |
| `npm run build`    | Production build to `dist/`                     |

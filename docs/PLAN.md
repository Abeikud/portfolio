# Plan: FC-menu–style portfolio (TDD, phased, PR per phase)

## Context

Daniel wants a personal portfolio that feels like the FC 27 main menu: a full-bleed stadium scene, a big vertical uppercase menu on the left that fades away from the selected item, and a preview panel that changes with the selection ("Dive straight into the action… [Enter Kick Off]"). Every menu selection should open deeper detail. The content comes from the pasted resume. Work must be test-driven and split into small phases, each opened as a GitHub PR so it can be reviewed and tracked before the next one starts.

**Decisions made:**

- **Stack:** React + TypeScript + Vite. Vitest + React Testing Library for unit and component tests, Playwright for real-browser e2e. Three.js only where it earns its place (optional Phase 10).
- **Workflow:** public GitHub repo `portfolio`. One branch, one issue and one PR per phase. CI runs on every PR, and each merge to `main` auto-deploys to GitHub Pages.
- **Menu labels (plain):** ABOUT, PROJECTS, EXPERIENCE, SKILLS, EDUCATION, CERTIFICATIONS, CONTACT.
- **Visuals:** royalty-free stadium photos with no club crests or logos, one scene per menu item.
- **Original branding:** the site copies the menu's layout and feel only. It uses a "DD" monogram and original copy, with no EA/FC logos, mode names, fonts or game screenshots.
- **Privacy:** the phone number is never published, and a test enforces this. Email, LinkedIn and GitHub are shown.

## Target layout

```
Main menu (desktop)                                         Detail screen (e.g. PROJECTS)
┌───────────────────────────────────────────────────┐       ┌──────────────────────────────────────────┐
│ ⟋DD                           ▓▓▓▓░░ EXPLORED 3/7 │       │ MAIN MENU › PROJECTS      EXPLORED 3/7   │
│ ⚙  ABOUT          (dimmed)                        │       │ PROJECTS   Q [ALL] WEB MACOS E           │
│ ⌥  PROJECTS  ◀ big/white   DIVE INTO THE BUILD    │       │ ┌───────────┐ ┌─────────┐ ┌──────────┐   │
│ ✉  EXPERIENCE              Real-time games, macOS…│       │ │StartingFive│ │ DIsland │ │Portfolio │  │
│ in SKILLS                  StartingFive · DIsland │       │ └───────────┘ └─────────┘ └──────────┘   │
│    EDUCATION   (fading)    [ ⏎ Enter Projects ]   │       │   tile → /projects/startingfive detail   │
│    CERTIFICATIONS                                 │       │                                          │
│    CONTACT     (faintest)    stadium photo + dark │       │ Esc Back   ⏎ Open   Q/E Switch tab       │
│ ↑↓ Navigate ⏎ Select           [📄 Resume]        │       └──────────────────────────────────────────┘
└───────────────────────────────────────────────────┘
```

Interaction: hovering or pressing arrow keys selects an item and updates the preview panel and the background. Clicking an item that is already selected, pressing Enter or using the CTA opens that section's screen; on touch, the first tap selects and the second tap enters. Tiles inside a screen open sub-details. Esc or Backspace goes back, and focus returns to the item you came from.

## Project structure (built up over the phases)

```
src/
  content/   types.ts · resume.ts (single source of truth) · sections.ts (menu config + preview copy)
  features/
    menu/    menuReducer.ts · useMenuKeyboard.ts · MainMenu.tsx · MenuList.tsx · PreviewPanel.tsx · SceneBackground.tsx
    screens/ ScreenLayout.tsx · TabBar.tsx · TileGrid.tsx · About/Projects/ProjectDetail/Experience/RoleDetail/Skills/Education/Certifications/Contact/NotFound
    hud/     TopHud.tsx · KeyPrompts.tsx · IconRail.tsx · Toast.tsx · progress.ts
    scene3d/ (optional) shouldRender3D.ts · Scene3D.tsx
  styles/    tokens.css (colors, type scale, easing, z-layers) · global.css
  test/      setup.ts · renderWithRouter.tsx (createMemoryRouter helper)
e2e/         smoke · menu · navigation · screens · a11y · mobile specs
.github/workflows/  ci.yml · deploy.yml
docs/        PLAN.md (copy of this plan) · CREDITS.md (photo licences) · screenshots/phase-N/
```

Libraries: react-router v7 (data router; `viewTransition` for animated screen changes), @fontsource/barlow + barlow-condensed (self-hosted heavy uppercase type), lucide-react (UI icons), sharp (image optimisation script), @axe-core/playwright. Optional: three + @react-three/fiber.

## How every phase runs (TDD + review loop)

1. Create branch `phase-N-<slug>` from `main`.
2. **Red:** write the phase's tests from its acceptance list, run them, and confirm they fail for the right reason. Commit as `test(pN): …`.
3. **Green:** write the minimum implementation that passes. Commit as `feat(pN): …`.
4. **Refactor/style** with the tests still green. Commit as `refactor(pN)` or `style(pN)`.
5. Run `npm run check` (typecheck, lint, unit tests with an 80% coverage gate, Playwright e2e). For UI phases, save screenshots at 1440×900 and 390×844 to `docs/screenshots/phase-N/`.
6. Push and open the PR "Phase N: …". It contains a summary, the list of new tests, screenshots and "Closes #issue". CI must be green.
7. **Stop and wait for your review.** I address feedback with extra commits. You merge with a merge commit or rebase, not squash, so the red→green history survives. The merge auto-deploys to Pages.

---

## Phase 0: Scaffold, test harness, CI/CD, tracking

- **Build:**
  - Vite React-TS with strict TS. ESLint (typescript-eslint, react-hooks, jsx-a11y) and Prettier.
  - Vitest + jsdom + RTL + user-event + jest-dom. Playwright with Chromium desktop and a Pixel 7 viewport, running against `vite preview`.
  - Scripts: `dev build preview typecheck lint test test:e2e check`.
  - `git init`, then `gh repo create portfolio --public`.
  - `ci.yml` runs all checks on PRs. `deploy.yml` builds and deploys to Pages on pushes to `main`. Vite `base: '/portfolio/'`, and the build copies `index.html` to `404.html` so deep links work.
  - One GitHub issue per phase, with acceptance checkboxes, under milestone "v1 launch". `docs/PLAN.md`.
- **Tests first:** `App.test.tsx` checks that a `main` landmark renders. `e2e/smoke.spec.ts` checks that the page loads with title "Daniel Dampson | Portfolio" and no console errors.
- **Review focus:** tooling config only. The site is live at `https://<you>.github.io/portfolio/` from this phase on.

## Phase 1: Content model from the resume (no UI)

- **Build:**
  - `content/types.ts`.
  - `content/resume.ts`: profile, education, 3 roles, 3 projects, skills in 4 categories, 2 certifications, contact.
  - `content/sections.ts`: the 7 sections, each with id, label, route, preview {kicker, headline, blurb, highlights[], ctaLabel} and background key.
  - Small copy fixes from the resume, all visible in the diff: "the serve" → "the server", "agent- proposed" → "agent-proposed".
- **Tests first** (`content.test.ts`):
  - There are exactly 7 sections, in order ABOUT…CONTACT, with unique ids and routes, and none has empty preview copy.
  - Roles are sorted newest first, and each has a title, company, dates, ≥1 bullet and stack tags.
  - Project slugs are URL-safe and unique, and each project has ≥1 stack tag and ≥2 bullets.
  - No skill is duplicated across categories.
  - No phone-number pattern appears anywhere in the serialised content.
  - The email is valid, and the LinkedIn and GitHub links are `https://` URLs.

## Phase 2: Menu navigation logic (pure)

- **Build:**
  - `menuReducer.ts`: NEXT, PREV, SELECT(i), FIRST and LAST. It clamps at the ends.
  - `useMenuKeyboard.ts` maps keys to actions: ↑/W, ↓/S, Home/End, and Enter/Space to activate. It ignores keys pressed with modifiers or while typing in inputs.
- **Tests first:**
  - Table-driven reducer tests: clamping, SELECT out of range, an empty list.
  - `renderHook` + user-event tests for each key mapping and for the ignored cases.

## Phase 3: Main menu layout and theme

- **Build:**
  - `tokens.css`: dark navy overlay, white text, one accent colour for focus and XP, Barlow 800 uppercase type scale.
  - `MainMenu` grid with a `BrandMark` ("DD" slanted SVG, top-left) and an `IconRail` (settings, GitHub, LinkedIn, email in a vertical stack of small circles).
  - `MenuList` (`nav > ul > li > button`). The selected item is about 1.25× larger and fully white. The other items dim by distance from it, through `data-distance`. Roving tabindex. Basic stacking at narrow widths.
- **Tests first:**
  - The `nav` is named "Main menu" and has 7 items in order. The first item has `aria-current`.
  - ↓ moves the selection and DOM focus. Hover selects. Clicking the selected item fires activate. Only the selected item has `tabIndex=0`.
  - Each item's `data-distance` equals |i − selected|.
  - Icon-rail links have accessible names and the correct hrefs.
  - e2e: pressing ↓↓ selects EXPERIENCE.

## Phase 4: Preview panel and stadium scenes

- **Build:**
  - `PreviewPanel`: kicker, big headline, blurb, highlights joined with " · ", and a white pill CTA "⏎ Enter Projects".
  - `SceneBackground`: one stacked image layer per section, crossfaded. Left and bottom gradients keep the text legible. A slow Ken Burns drift runs only when reduced motion is off, and the next and previous scenes are preloaded.
  - 7 Unsplash/Pexels photos run through `scripts/optimize-images.mjs` (WebP at 1920/1280/768 widths), with licences recorded in `docs/CREDITS.md`. I'll show the candidate photos in the PR for your approval.
- **Tests first:**
  - `it.each(sections)`: selecting a section shows its headline, blurb, highlights and CTA, and the CTA links to the section's route.
  - The active background layer matches the selection, and every image has `alt=""`.
  - With `prefers-reduced-motion` set, there is no drift class.
  - e2e: the background changes on ↓.
- **Gate:** after review, decide whether the static photos feel flat enough to want Phase 10 (Three.js).

## Phase 5: Routing, transitions, screen shell

- **Build:**
  - `createBrowserRouter` with basename `BASE_URL`. Routes: `/`, `/about`, `/projects`, `/projects/:slug`, `/experience`, `/experience/:id`, `/skills`, `/education`, `/certifications`, `/contact` and `*`.
  - `ScreenLayout`: breadcrumb "MAIN MENU › X", big title, footer key prompts with a clickable "Esc Back", and view-transition slide/fade animations.
  - Focus moves to the screen's h1 when it opens. The last menu selection is kept in context so Back restores it.
  - `document.title` updates for each screen. Each section gets a placeholder screen.
- **Tests first** (using a `renderWithRouter` helper):
  - Enter navigates to the section and focuses the h1.
  - Esc, Backspace and the Back button each return to `/` with the same item selected and focused.
  - Deep-linking to `/experience` works, and Esc from there selects EXPERIENCE.
  - An unknown route shows NotFound with a link back to the menu.
  - Titles are correct.
  - e2e: the browser Back button behaves the same way.

## Phase 6: Hub components and Projects

- **Build:**
  - `TabBar` (Q/E and ←/→ switch tabs, FC-style shoulder prompts).
  - `TileGrid`/`Tile` (2D arrow navigation and a selected glow).
  - Projects screen with All / Web / macOS tabs. `ProjectDetail` shows the stack chips, bullets and repo/demo links.
- **Tests first:**
  - Tab switching works by key and by click, and filters the tiles.
  - Arrow keys move between tiles in 2D, and Enter opens `/projects/:slug`.
  - The detail page shows every bullet and stack tag from `resume.ts`.
  - An unknown slug shows NotFound.

## Phase 7: Experience, Education, Certifications

- **Build:**
  - Experience tiles in timeline order, each leading to `RoleDetail` with bullets and stack.
  - Education screen: UPEI, the degree, a "Minor in Mathematics" line, and coursework chips.
  - Certifications as a "trophy cabinet" of tiles.
- **Tests first:**
  - Every role, course and certification in `resume.ts` renders exactly once.
  - Role tiles appear newest first.
  - The role detail route works, and so do Back and focus restore.

## Phase 8: About, Skills, Contact, plus resume download

- **Build:**
  - About: a bio plus a "latest news" card list (e.g. the summer role and the Amobys internship).
  - Skills: card tiles grouped by category, with tabs for Languages, Frameworks, Data & Cloud and Tools.
  - Contact: mailto, LinkedIn, GitHub and a "Download resume" link to `public/resume.pdf`.
- **Tests first:**
  - Each skill appears once, under the right tab.
  - Contact hrefs are correct (`mailto:`, `https://`), and the resume link has the `download` attribute.
  - The phone number is not in the rendered DOM.

## Phase 9: HUD and polish

- **Build:**
  - `TopHud`: an "EXPLORED n/7" XP bar that tracks unique sections visited, persisted to localStorage inside try/catch.
  - A bottom-right `Toast`: "Download my resume" on first visit. When all 7 sections are explored, it says "Season objective complete, let's talk" and links to Contact.
  - `KeyPrompts` that change with the screen.
  - A settings gear with a "Reduce motion" toggle.
- **Tests first:**
  - `progress.ts` is pure and idempotent, and keeps working when storage throws.
  - The XP bar's `aria-valuenow` updates on visits.
  - A dismissed toast stays dismissed.
  - The objective toast appears at 7/7.
  - Prompts change per screen.
  - The motion toggle removes animation classes.

## Phase 10 (optional, decided at the Phase 4 gate): Three.js scene layer

- **Build:**
  - A lazy-loaded R3F canvas over the photo: a procedural football that rolls and turns when the selection changes, floodlight dust particles, and slight mouse parallax.
  - `shouldRender3D()` gates it. It renders only with WebGL available, reduced motion off, the setting on, no `saveData`, and a width ≥768.
- **Tests first:**
  - Gating truth table.
  - `ballTargetFor(i)` is a pure function.
  - The R3F test renderer finds the ball mesh and the particle count.
  - jsdom renders no canvas when gated.
  - e2e: the canvas is present on desktop Chromium and absent with reduced motion emulated.
  - The three chunk is not in the initial bundle.

## Phase 11: Responsive, accessibility, performance, launch

- **Build:**
  - Final mobile layout.
  - Meta, Open Graph image (a menu screenshot), favicon (the monogram).
  - A WebKit project in Playwright.
  - Bundle and image size budget script.
- **Tests first:**
  - Every route has no horizontal scroll at 390/768/1440 widths.
  - axe finds 0 serious or critical issues on every route.
  - A full tour using only the keyboard.
  - The budgets pass.
  - A content test fails if any `TODO` placeholder remains.

---

## Inputs needed from you (placeholders are used until then)

1. **Before Phase 0:** run `! gh auth login` so I can create the public `portfolio` repo and enable Pages.
2. **By Phase 1:** your LinkedIn URL and GitHub URL (I'd guess github.com/abeikud from your git config; please confirm). Also the StartingFive and DIsland repo or demo links, and what "playing to first to points" should say (first to how many points?).
3. **By Phase 8:** your resume PDF, which goes in `public/resume.pdf`.
4. **Phase 4:** approve the candidate stadium photos.

## Verification

- Every phase runs `npm run check`: tsc, eslint, `vitest run --coverage` with the 80% gate, and `playwright test` against the production build. The same checks run in GitHub Actions on the PR.
- For UI phases, run `npm run dev` and compare against the FC reference screenshots. Committed screenshots in the PR make visual review possible without running anything.
- After each merge, the live GitHub Pages URL shows the cumulative progress. Issues closed by PRs and the "v1 launch" milestone track overall status.

Stretch ideas, not planned: Gamepad API support (D-pad, A, B) and optional menu sound effects (muted by default).

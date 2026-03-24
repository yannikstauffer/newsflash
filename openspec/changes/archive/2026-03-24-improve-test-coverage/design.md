## Context

The project enforces 80% coverage thresholds for lines, branches, and functions via Vitest. Currently, functions (74.04%) and branches (78.72%) fail this gate. The main culprit is `use-feed-page.ts` (39.2% lines, 20.51% functions) — a 353-line orchestration hook that is the largest untested source file. Secondary gaps exist in `use-article-state.ts` (71.73% lines), `feed-config-page.tsx` (68.18% functions), and `extract-leading-image.ts` (78.72% branches).

E2E tests (92 tests across 6 files) all pass locally but are commented out in the release CI workflow (`release.yml`). The CI workflow (`ci.yml`) still runs them. The recent commit `ci(e2e): deactivate e2e tests` suggests they were disabled due to reliability or time concerns in the release pipeline.

## Goals / Non-Goals

**Goals:**
- Raise all three coverage metrics (lines, branches, functions) above 80% so `npm run test:coverage` passes
- Add comprehensive unit tests for `use-feed-page.ts` — the largest coverage gap
- Fill branch/function gaps in `use-article-state.ts`, `feed-config-page.tsx`, and `extract-leading-image.ts`
- Re-enable E2E tests in the release CI workflow
- Ensure E2E tests only cover integration paths not already validated by unit tests

**Non-Goals:**
- Refactoring production code to make it more testable (test what exists)
- Achieving 100% coverage (target is the 80% threshold)
- Adding tests for shadcn/ui wrapper components (excluded from coverage)
- Adding tests for entry points (`main.tsx`, `App.tsx`) or barrel exports

## Decisions

### Decision 1: Test `use-feed-page` via `renderHook` with mocked dependencies

**Choice:** Mock `useFeedData`, `useArticleState`, `useFeedPreferences`, and `useArticleKeyboardShortcuts` at the module level, then test `useFeedPage` return values and callback behaviors in isolation.

**Alternative considered:** Integration-test by rendering `FeedPage` component — rejected because it couples to UI structure, is slower, and the filtering/actions logic is already tested by E2E.

**Rationale:** The hook is pure orchestration logic (filtering, memoization, callbacks). Testing it via `renderHook` is fast, stable, and directly targets the uncovered functions.

### Decision 2: Fill branch gaps in existing test files rather than creating new ones

**Choice:** Add test cases to existing `use-article-state.test.ts`, `feed-config-page.test.tsx`, and `extract-leading-image.test.ts` files.

**Alternative considered:** New dedicated test files — rejected to avoid duplication and keep tests colocated with existing suites.

### Decision 3: Rewrite connector E2E tests as live (no mocks), delete feed.spec.ts

**Choice:** Remove all `page.route()` mocking from `connectors.spec.ts`. Tests hit real RSS feeds via the Vite dev server proxy (`/api/rss/*` → real URLs). Each connector gets one parameterized smoke test asserting articles render and thumbnails load (where `allHaveImages` is true). Delete `feed.spec.ts` entirely — its smoke test role is absorbed by the connector tests.

**Alternative considered:** Keep mocked fixtures — rejected because live tests catch upstream feed format changes that mocks can never detect, and the mock infrastructure adds maintenance overhead.

**Rationale:** The Vite proxy already routes `/api/rss/<id>` to real feed URLs. Removing mocks tests the full pipeline: real XML → proxy → parse → render. Flakiness from feed downtime is accepted; Playwright's 1-retry mitigates transient errors.

### Decision 4: Reduce E2E suite from 92 to ~20 tests

**Choice:** Consolidate tests that duplicate unit-tested logic:
- `connectors.spec.ts`: 26 → 7 (one smoke test per connector, no field-by-field checks)
- `feed.spec.ts`: 6 → 0 (deleted, covered by connector smoke tests)
- `filter.spec.ts`: 14 → 4 (1 search flow + 1 day nav, desktop only)
- `article-actions.spec.ts`: 22 → 10 (hide+unhide, save+remove, empty readlist on desktop; 2 swipe tests on mobile)
- `navigation.spec.ts`: 8 → 2 (1 full tab cycle test, desktop only)
- `settings.spec.ts`: 14 → 8 (1 language, 1 persistence, 1 theme, 1 source toggle, desktop only)

Mobile Chrome project runs only for swipe gesture tests in `article-actions.spec.ts`.

### Decision 5: Add scheduled workflow for live connector tests

**Choice:** Create `.github/workflows/e2e-live.yml` with `schedule: cron "0 4 * * 4"` (weekly Thursday 04:00 UTC) and `workflow_dispatch` for manual triggers. Runs only `connectors.spec.ts` on Desktop Chrome. Add a status badge to `README.md`.

**Rationale:** Acts as a weekly canary for upstream feed changes between code pushes. The badge gives at-a-glance visibility. Live connector tests also run in regular CI (`ci.yml`) for immediate feedback on PRs.

### Decision 6: Do not add unit tests for `loading-spinner.tsx` or `hidden-article-actions.tsx`

### Decision 7: Do not add unit tests for `loading-spinner.tsx` or `hidden-article-actions.tsx`

**Choice:** Skip these zero-coverage files. `loading-spinner.tsx` is a simple presentational component. `hidden-article-actions.tsx` is a thin wrapper with one button — tested by E2E.

**Rationale:** Per project guidelines, simple presentational components and third-party wrappers should not be unit-tested. These files are small enough that their 0% coverage doesn't materially impact the overall threshold.

## Risks / Trade-offs

- **Risk:** Mocking `useFeedData` and `useArticleState` in `use-feed-page` tests may drift from real behavior → **Mitigation:** E2E tests cover the integrated path; unit tests focus on callback logic and memoization.
- **Risk:** Removing E2E tests reduces integration coverage → **Mitigation:** Only remove tests whose exact scenarios are fully covered by unit tests; keep all flow-level tests.
- **Risk:** Live connector tests may fail if upstream feeds are down → **Mitigation:** Playwright config has 1 retry. Flakiness is accepted — catching real feed breakage outweighs occasional false failures.
- **Risk:** Coverage may still be marginal (just above 80%) → **Mitigation:** Focus on the highest-impact files first; `use-feed-page.ts` alone should push functions from 74% to ~82%.

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

### Decision 3: Re-enable E2E in release CI, remove redundant E2E tests

**Choice:** Uncomment the Playwright steps in `release.yml`. Review E2E test overlap with unit tests and remove E2E tests that only validate logic already covered by unit tests (e.g., individual filter logic). Keep E2E tests that validate full user flows spanning multiple components.

**Rationale:** E2E tests pass locally and in `ci.yml`. The release workflow should have the same quality gate. Removing redundant tests keeps the E2E suite fast and focused.

### Decision 4: Do not add unit tests for `loading-spinner.tsx` or `hidden-article-actions.tsx`

**Choice:** Skip these zero-coverage files. `loading-spinner.tsx` is a simple presentational component. `hidden-article-actions.tsx` is a thin wrapper with one button — tested by E2E.

**Rationale:** Per project guidelines, simple presentational components and third-party wrappers should not be unit-tested. These files are small enough that their 0% coverage doesn't materially impact the overall threshold.

## Risks / Trade-offs

- **Risk:** Mocking `useFeedData` and `useArticleState` in `use-feed-page` tests may drift from real behavior → **Mitigation:** E2E tests cover the integrated path; unit tests focus on callback logic and memoization.
- **Risk:** Removing E2E tests reduces integration coverage → **Mitigation:** Only remove tests whose exact scenarios are fully covered by unit tests; keep all flow-level tests.
- **Risk:** Coverage may still be marginal (just above 80%) → **Mitigation:** Focus on the highest-impact files first; `use-feed-page.ts` alone should push functions from 74% to ~82%.

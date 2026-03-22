## Why

Unit test coverage is below the enforced 80% threshold (functions: 74.04%, branches: 78.72%), blocking CI. The main gap is `use-feed-page.ts` (39.2% line coverage, 20.51% function coverage) which is the largest untested hook. E2E tests may be broken or stale — they need to be verified against the current app state and trimmed to only cover integration paths not already validated by unit tests.

## What Changes

- Add unit tests for `use-feed-page.ts` hook (the largest coverage gap at 353 lines, 20.51% function coverage)
- Add unit tests for `use-article-state.ts` uncovered branches (71.73% lines → target 80%+)
- Add unit tests for `feed-config-page.tsx` uncovered functions (68.18% functions → target 80%+)
- Add unit tests for `extract-leading-image.ts` uncovered branches (78.72% branches → target 80%+)
- Drastically reduce E2E suite from 92 to ~20 tests by removing tests that duplicate unit-tested logic
- Rewrite `connectors.spec.ts` as live tests hitting real RSS feeds (no mocks), delete `feed.spec.ts` (covered by connector smoke tests)
- Consolidate `filter.spec.ts` (7 → 2 tests), `article-actions.spec.ts` (11 → 5 tests), `navigation.spec.ts` (4 → 1 test), `settings.spec.ts` (7 → 4 tests)
- Run mobile Playwright project only for swipe gesture tests
- Add `e2e-live.yml` scheduled workflow running live connector tests weekly (Thu 04:00 UTC) with README badge
- Re-enable E2E tests in `release.yml`
- Ensure `npm run test:coverage` passes the 80% threshold for all metrics

## Capabilities

### New Capabilities
- `feed-page-hook-tests`: Unit tests for the `use-feed-page` hook covering all state management, effects, and callback logic
- `e2e-test-maintenance`: Rewrite connector tests as live (no mocks), trim redundant tests, add scheduled workflow with badge

### Modified Capabilities
- `hook-unit-tests`: Additional branch/function coverage for `use-article-state` and `use-feed-preferences`
- `test-coverage-config`: No spec-level changes — existing thresholds are correct, code just needs to meet them

## Impact

- **Code**: New/modified test files in `src/features/feed/hooks/`, `src/features/article-actions/hooks/`, `src/features/feed-config/components/`, `src/utils/`, and `tests-e2e/`
- **CI**: Unblocks coverage gate — `npm run test:coverage` will pass 80% thresholds. New `e2e-live.yml` scheduled workflow for weekly live feed canary.
- **Dependencies**: No new dependencies expected (Vitest, Testing Library, Playwright already in place)
- **Risk**: Live connector tests may fail if upstream feeds are down — accepted tradeoff for catching format changes early. Playwright's 1-retry config mitigates transient errors.

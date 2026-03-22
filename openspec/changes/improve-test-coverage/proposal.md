## Why

Unit test coverage is below the enforced 80% threshold (functions: 74.04%, branches: 78.72%), blocking CI. The main gap is `use-feed-page.ts` (39.2% line coverage, 20.51% function coverage) which is the largest untested hook. E2E tests may be broken or stale — they need to be verified against the current app state and trimmed to only cover integration paths not already validated by unit tests.

## What Changes

- Add unit tests for `use-feed-page.ts` hook (the largest coverage gap at 353 lines, 20.51% function coverage)
- Add unit tests for `use-article-state.ts` uncovered branches (71.73% lines → target 80%+)
- Add unit tests for `feed-config-page.tsx` uncovered functions (68.18% functions → target 80%+)
- Add unit tests for `extract-leading-image.ts` uncovered branches (78.72% branches → target 80%+)
- Fix broken E2E tests so they pass against the current app
- Remove E2E tests that duplicate unit-tested logic; add E2E tests for any new user flows not covered by existing tests
- Ensure `npm run test:coverage` passes the 80% threshold for all metrics

## Capabilities

### New Capabilities
- `feed-page-hook-tests`: Unit tests for the `use-feed-page` hook covering all state management, effects, and callback logic
- `e2e-test-maintenance`: Fix broken E2E tests, remove redundant ones, and align the suite with current app functionality

### Modified Capabilities
- `hook-unit-tests`: Additional branch/function coverage for `use-article-state` and `use-feed-preferences`
- `test-coverage-config`: No spec-level changes — existing thresholds are correct, code just needs to meet them

## Impact

- **Code**: New/modified test files in `src/features/feed/hooks/`, `src/features/article-actions/hooks/`, `src/features/feed-config/components/`, `src/utils/`, and `tests-e2e/`
- **CI**: Unblocks coverage gate — `npm run test:coverage` will pass 80% thresholds
- **Dependencies**: No new dependencies expected (Vitest, Testing Library, Playwright already in place)
- **Risk**: Low — only test files are added/modified, no production code changes

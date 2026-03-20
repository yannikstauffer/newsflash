## Why

The project mandates 80%+ test coverage for new code, but `vitest.config.ts` has no coverage configuration and no threshold enforcement. Core hooks `useFeedData`, `useFeedPreferences`, and `useLazyList` contain non-trivial logic (deduplication, error aggregation, sorting, localStorage persistence, IntersectionObserver state management) that is untested or under-tested. Without coverage gates, regressions in these critical data-flow hooks go undetected.

## What Changes

- Add `@vitest/coverage-v8` as a dev dependency and configure Vitest coverage with 80% line/branch/function thresholds in `vitest.config.ts`.
- Add a dedicated `test:coverage` npm script.
- Write comprehensive unit tests for `useFeedData` (deduplication, chronological sorting, error aggregation, loading state transitions).
- Write comprehensive unit tests for `useFeedPreferences` (toggle, enable/disable, bulk set, language preference, localStorage persistence).
- Expand existing `useLazyList` tests to cover edge cases (empty items array, batch size of 1, sentinel ref set to null).

## Capabilities

### New Capabilities

- `test-coverage-config`: Vitest coverage provider configuration and threshold enforcement
- `hook-unit-tests`: Unit test suites for useFeedData, useFeedPreferences, and useLazyList hooks

### Modified Capabilities

(none)

## Impact

- `vitest.config.ts` — add coverage provider and threshold configuration
- `package.json` — add `@vitest/coverage-v8` dev dependency, add `test:coverage` script
- `src/features/feed/hooks/use-feed-data.test.ts` — new test file
- `src/features/feed-config/hooks/use-feed-preferences.test.ts` — new test file
- `src/hooks/use-lazy-list.test.ts` — expanded with additional edge-case tests

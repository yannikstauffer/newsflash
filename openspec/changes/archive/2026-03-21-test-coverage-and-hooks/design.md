## Context

The newsflash frontend is a Vite 8 + React 19 + TypeScript SPA using Vitest for unit testing. The project's CLAUDE.md mandates 80%+ coverage for new code, but the Vitest configuration has no coverage provider or thresholds. Three core hooks drive the feed data pipeline: `useFeedData` fetches, deduplicates, and sorts articles; `useFeedPreferences` manages per-feed enable/disable state and language preference via localStorage; `useLazyList` virtualizes long lists using IntersectionObserver. Only `useLazyList` has existing tests.

## Goals / Non-Goals

**Goals:**

- Configure `@vitest/coverage-v8` so `npm run test:coverage` enforces 80% line, branch, and function thresholds
- Achieve meaningful test coverage for `useFeedData`, `useFeedPreferences`, and `useLazyList`
- Tests follow project conventions: colocated with source, use `renderHook` from `@testing-library/react`, mock external dependencies

**Non-Goals:**

- Achieving 100% coverage across the entire codebase
- Adding integration or E2E tests (covered by Playwright separately)
- Refactoring hook implementations (tests verify current behavior)

## Decisions

**D1: Coverage provider — `@vitest/coverage-v8` over `@vitest/coverage-istanbul`**

V8 coverage is faster (no source transformation), already the Vitest-recommended default, and sufficient for line/branch/function metrics. Istanbul offers statement-level granularity but at a compile-time cost that is unnecessary here.

**D2: Threshold enforcement — per-run via `vitest.config.ts` rather than CI-only**

Configuring thresholds in `vitest.config.ts` with `thresholds.autoUpdate: false` makes the gate local and reproducible. Developers see failures immediately during `npm run test:coverage` rather than discovering them only in CI.

**D3: Mocking strategy for `useFeedData` — mock `fetchFeed` and `connectors` at module level**

`useFeedData` depends on `fetchFeed` (network) and `connectors` (registry). Mocking at the module boundary via `vi.mock()` isolates the hook logic (deduplication, sorting, error handling) without needing a real HTTP layer. The `connectors` mock provides controlled feed definitions and parse functions.

**D4: Mocking strategy for `useFeedPreferences` — mock `useLocalStorage`**

`useFeedPreferences` delegates persistence to `useLocalStorage`. Mocking this single dependency lets tests verify preference logic (toggle, bulk set, language) without touching actual localStorage or the `useLocalStorage` implementation.

**D5: `useLazyList` — extend existing tests rather than rewrite**

The existing test file already covers the primary flows well. Adding edge cases (empty array, batch size of 1, null sentinel) to the existing `describe` block avoids duplication and keeps tests colocated.

## Risks / Trade-offs

**[Risk] Coverage thresholds may block unrelated PRs that touch low-coverage legacy files** — Mitigation: Thresholds apply globally but at 80%, which is achievable. If needed, specific files can be excluded via `coverage.exclude` in the future.

**[Risk] Mocking `connectors` registry tightly couples tests to current module structure** — Mitigation: The registry is a stable module boundary unlikely to change. If it does, the mocks are centralized and easy to update.

**[Risk] `renderHook` tests may not catch React concurrent-mode edge cases** — Mitigation: Accepted trade-off. Concurrent-mode behavior is better validated via E2E tests. Unit tests focus on synchronous logic correctness.

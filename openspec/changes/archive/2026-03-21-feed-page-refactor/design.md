## Context

`FeedPage` (209 LOC) is the main orchestrator component for the feed view. It currently mixes concerns: data fetching, filtering, day navigation, keyboard shortcuts, hover tracking, swipe gesture wiring, and rendering. It imports 5 files from `article-actions` and 1 from `feed-config`, creating tight cross-feature coupling. The component also suppresses two ESLint rules (`react-hooks/exhaustive-deps`, `jsx-a11y/no-static-element-interactions`).

## Goals / Non-Goals

**Goals:**
- Reduce `FeedPage` to a thin JSX rendering layer (~30 LOC)
- Encapsulate all state and behavior in a testable `useFeedPage()` hook
- Provide a single barrel export for `article-actions` to reduce import surface
- Eliminate all `eslint-disable` comments in the feed page
- Remove redundant `useCallback` wrappers in `SwipeableCard`

**Non-Goals:**
- Changing the visual design or behavior of the feed page
- Introducing a state management library (Zustand, Redux, etc.)
- Refactoring `article-actions` internals beyond the barrel export
- Adding client-side routing (separate proposal)

## Decisions

### D1: Single `useFeedPage()` hook vs. multiple smaller hooks

**Decision:** Single `useFeedPage()` that internally composes smaller hooks.

**Rationale:** The state in FeedPage is interconnected — day navigation affects filtering, article actions need the filtered list, keyboard shortcuts need hover state. Splitting into many hooks would just move the coordination problem. A single hook that internally composes `useArticleState`, `useFeedData`, `useFeedPreferences`, and local state keeps the public API clean while allowing internal decomposition later if needed.

**Alternative considered:** Multiple hooks (`useDayNavigation`, `useArticleInteractions`, `useFeedFiltering`) — rejected because they would need to share state (e.g., `filteredArticles`, `hoveredArticleRef`), requiring either prop drilling between hooks or a context, which adds complexity without benefit at this scale.

### D2: Barrel export for `article-actions`

**Decision:** Add `src/features/article-actions/index.ts` that re-exports the public API (components + hooks).

**Rationale:** FeedPage currently imports from 5 separate paths within article-actions. A barrel export makes the feature boundary explicit and reduces import lines. The existing `article-actions` feature already has a clear public API surface.

**Alternative considered:** A context provider wrapping all article-actions state — rejected as over-engineering for the current use case.

### D3: Stabilize `refresh` to fix exhaustive-deps

**Decision:** Wrap `refresh` in `useCallback` inside `useFeedData` so the reference is stable across renders.

**Rationale:** The current `eslint-disable` exists because `refresh` is recreated on every render. Making it stable via `useCallback` allows the mount effect to include it in the dependency array without triggering infinite re-fetches.

### D4: Remove redundant `useCallback` in `SwipeableCard`

**Decision:** Pass `onSwipeRight`/`onSwipeLeft` props directly to the `useDrag` handler instead of wrapping them in identity `useCallback`s.

**Rationale:** The current wrappers (`useCallback(() => { onSwipeRight() }, [onSwipeRight])`) add overhead and indirection with zero benefit — they produce a new reference whenever the prop changes, which is exactly what the prop already does.

## Risks / Trade-offs

- **[Risk] Large diff touching core page** → Mitigated by: no behavioral changes, existing E2E tests validate the same UX. Run full E2E suite before merging.
- **[Risk] Barrel export could mask unused imports** → Mitigated by: TypeScript tree-shaking + existing `noUnusedLocals` compiler option will catch unused imports at build time.
- **[Trade-off] Single large hook vs. multiple small ones** → Accepted: simpler API now, can decompose internally later without changing consumers.

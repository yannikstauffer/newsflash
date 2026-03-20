## Why

The Read List page crashes immediately on navigation with "Too many re-renders" error. `useArticleState` creates new array references via `.map()` on every render, which triggers `useLazyList`'s referential equality check (`state.items !== items`) to reset state infinitely.

## What Changes

- Memoize `readListArticles` and `readListIds` in `useArticleState` using `useMemo` to stabilize array references across renders
- No behavioral changes — same data, same API surface, just stable references

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none — this is a bug fix in hook internals, no spec-level behavior changes)

## Impact

- `src/features/article-actions/hooks/use-article-state.ts` — add `useMemo` for derived arrays
- Read List page (`ReadListPage`) will become functional again
- No API or dependency changes

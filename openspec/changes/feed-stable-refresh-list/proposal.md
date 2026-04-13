## Why

During background refreshes, articles in the feed list disappear and reappear, causing users to accidentally swipe on the wrong article. The root cause is that `useLazyList` resets its visible window to 15 items whenever the article array reference changes, and `useFeedData` always produces a new array reference on every refresh — even when the content is identical.

## What Changes

- **Preserve visible count in `useLazyList` during refreshes**: Instead of resetting `visibleCount` to `batchSize` on every items reference change, preserve the current count when the new list is the same size or larger. Only reset when the list genuinely shrinks (e.g., filter change).
- **Add referential stability to `useFeedData`**: When `applyFetchResult` produces a merged article list with the same IDs in the same order as the current state, reuse the existing array reference to avoid triggering unnecessary downstream resets and re-renders.

## Capabilities

### New Capabilities
- `stable-lazy-list`: Defines stability behavior for the lazy list hook — when to preserve vs. reset the visible window.

### Modified Capabilities
- `feed/data-caching`: Feed data updates SHALL preserve array reference stability when content is unchanged.

## Impact

- `src/hooks/use-lazy-list.ts` — change reset logic to preserve `visibleCount` when items grow or stay the same
- `src/hooks/use-lazy-list.test.ts` — new tests for stability behavior
- `src/features/feed/hooks/use-feed-data.ts` — add referential stability check in `applyFetchResult`
- `src/features/feed/hooks/use-feed-data.test.ts` — new tests for reference reuse

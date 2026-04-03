## Why

The feed list has no way for users to refresh content after the initial load. On mobile devices, pull-to-refresh is the expected gesture for refreshing a list of content. The data-fetching hook (`useFeedData`) already exposes a `refresh()` method, but it's not connected to the UI.

## What Changes

- Add a pull-to-refresh gesture on the feed list, touch devices only
- Show a spinner indicator above the first article card while refreshing
- Wire the existing `useFeedData.refresh()` through `useFeedPage` to the gesture handler
- Pull-to-refresh is disabled during initial load (only available when articles are displayed)

## Capabilities

### New Capabilities
- `pull-to-refresh`: Touch-driven pull-to-refresh gesture on the feed list with spinner indicator

### Modified Capabilities

None — existing feed and article-card specs are unaffected. This adds a new interaction layer without changing existing behavior.

## Impact

- **New hook**: `usePullToRefresh` in `src/hooks/` using `@use-gesture/react` (already installed)
- **Modified**: `feed-list.tsx` — wraps list content with pull-to-refresh container and spinner
- **Modified**: `use-feed-page.ts` — exposes `refresh()` from `useFeedData`
- **Modified**: `feed-page.tsx` — passes `refresh` and `loading` to `FeedList`
- **Dependencies**: No new dependencies (`@use-gesture/react` already in use by `SwipeableCard`)
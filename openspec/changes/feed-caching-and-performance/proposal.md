## Why

All feeds are re-fetched on every FeedPage mount -- switching tabs and returning triggers a full re-fetch with no caching (P2). The `allArticles` array in `useFeedData` is a shared mutable array pushed to from concurrent `Promise.all` callbacks, creating a race condition (P3). `FeedList` recreates `new Set(hiddenIds)` on every render without memoization (P4).

## What Changes

- Cache feed data in React state across tab switches; only re-fetch when the user explicitly clicks the refresh button or on first load
- Add a "last refreshed" timestamp displayed in the FilterBar alongside the existing refresh mechanism
- Fix the mutable shared array in `useFeedData`: collect `Promise.all` results into separate arrays, then concat and `setState` once
- Memoize `hiddenSet` in `FeedList` with `useMemo` to avoid recreating the Set on every render

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `article-feed`: Add in-memory caching behavior so feeds persist across tab switches, display a last-refreshed timestamp, fix concurrent mutation of the shared articles array, and memoize the hidden-IDs Set in the feed list

## Impact

- `src/features/feed/hooks/use-feed-data.ts` -- caching logic and mutable array fix
- `src/features/feed/components/feed-list.tsx` -- memoize `hiddenSet`
- `src/features/feed/components/feed-page.tsx` -- refresh button wiring and last-refreshed display
- `src/features/feed/components/filter-bar.tsx` -- display last-refreshed timestamp

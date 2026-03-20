## Context

The `useFeedData` hook currently fetches all enabled feeds every time `refresh()` is called, which happens on every `FeedPage` mount via a `useEffect`. There is no persistent state between mounts, so navigating away and back triggers a full re-fetch. Additionally, the fetch logic pushes results into a shared mutable array from concurrent async callbacks, which is a race-condition risk. The `FeedList` component allocates a new `Set(hiddenIds)` on every render, which is unnecessary when `hiddenIds` has not changed.

## Goals / Non-Goals

**Goals:**

- Eliminate redundant network requests when navigating between tabs
- Provide the user with visibility into data freshness (last-refreshed timestamp)
- Fix the shared mutable array pattern to prevent potential data corruption
- Memoize the hidden-IDs Set to reduce allocation pressure on re-renders

**Non-Goals:**

- Automatic background polling or refresh intervals
- Persistent disk-based cache (localStorage, IndexedDB)
- Stale-while-revalidate or any HTTP caching strategy
- Changes to the connector or feed-config modules

## Decisions

### Decision 1: In-memory cache via React state (not external cache)

Keep articles in existing React state within `useFeedData`. The hook already stores articles in `useState`; the only change is to stop clearing them on every mount and to skip the initial fetch if data already exists. A `lastRefreshedAt` timestamp (stored in state) tracks freshness.

**Why not an external cache (e.g., React Query, SWR, localStorage):** The app is a lightweight SPA with a small number of feeds. Adding a caching library increases bundle size and complexity for a problem solvable with existing React primitives. Disk-based caching is a non-goal for this change.

**Trade-off:** State is lost on full page reload. This is acceptable because feeds are fast to fetch and the user expects fresh data on a full reload.

To persist state across mounts, `useFeedData` will be lifted so its state lives above the `FeedPage` component (e.g., in a context or a parent that does not unmount on tab switch). The simplest approach is to move the hook call into a layout component or use a module-level cache variable.

### Decision 2: Module-level cache variable for cross-mount persistence

Use a module-level variable in `use-feed-data.ts` to hold the cached articles and timestamp. On mount, if the cache is populated, initialize state from it and skip the fetch. On refresh, update both state and the module-level cache.

**Why not Context:** A context provider would require wrapping the app tree and adding boilerplate. A module-level variable achieves the same cross-mount persistence with zero structural changes.

### Decision 3: Collect Promise.all results immutably

Replace the shared `allArticles` array with a pattern that collects each feed's result independently:

```
const results = await Promise.all(feedPromises)
const allArticles = results.flat()
```

Each promise returns its own array; `flat()` merges them after all promises resolve. This eliminates concurrent mutation.

### Decision 4: Memoize hiddenSet with useMemo

Wrap `new Set(hiddenIds)` in `useMemo(() => new Set(hiddenIds), [hiddenIds])` inside `FeedList`. The dependency array ensures the Set is only recreated when `hiddenIds` changes.

## Risks / Trade-offs

- **Stale data risk** -- Users may not realize data is cached from a previous visit. Mitigation: display a "last refreshed" timestamp so staleness is visible, and keep the refresh button prominent.
- **Memory usage** -- Cached articles remain in memory even when the feed tab is not active. Mitigation: the dataset is small (hundreds of articles at most); this is negligible.
- **Module-level state and testing** -- Module-level variables persist across tests. Mitigation: export a `clearFeedCache()` function for test cleanup.

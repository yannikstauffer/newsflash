## Why

The IndexedDB article cache (from the `article-cache` change) provides persistent storage but nothing uses it yet. Without integration, the app still shows a spinner on every cold load, historical day navigation returns empty results for days that fell off the RSS feed, and read-list articles can be evicted from the cache even though the user explicitly saved them. Wiring the cache into the React data flow delivers the stale-while-revalidate UX and keeps eviction aligned with user intent.

## What Changes

- Modify `use-feed-data.ts` to read from the IndexedDB cache on mount — if cached articles exist, render them instantly (no spinner), then fetch fresh feeds in the background and upsert results into the cache. The existing module-level `feedCache` becomes an L1 in-memory layer; IndexedDB becomes L2; network is L3.
- Wire pin/unpin into article actions: `addToReadList` also calls `setPinned(id, true)` on the IDB cache; `removeFromReadList` calls `setPinned(id, false)`. This keeps eviction aligned with the read list without the cache layer needing to know about read-list internals.
- Show cached articles for historical day navigation — when the user navigates to a past day, articles from the IDB cache for that date range are displayed even if those articles are no longer in the RSS feed.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `feed`: The feed data loading behavior changes from fetch-only to stale-while-revalidate with IndexedDB as the persistent cache layer. Page reload no longer clears data. Historical day navigation serves cached articles.
- `article-card`: The read-list add/remove actions gain a side effect — pinning/unpinning articles in the IndexedDB cache to prevent eviction of saved articles.

## Impact

- `src/features/feed/hooks/use-feed-data.ts` — Major refactor: add IDB cache reads on mount, background fetch + upsert, L1/L2/L3 cache hierarchy
- `src/features/article-actions/hooks/use-article-state.ts` — Add `setPinned` calls in `addToReadList` and `removeFromReadList`
- `src/features/feed/hooks/use-feed-data.test.ts` — Update tests for stale-while-revalidate flow
- `src/features/article-actions/hooks/use-article-state.test.ts` — Add tests for pin/unpin side effects
- Depends on: `article-cache` change (must be completed first)

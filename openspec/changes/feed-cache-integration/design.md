## Context

The `article-cache` change introduces an IndexedDB-based article cache (`src/lib/article-cache.ts`) with CRUD operations, pinning, and eviction. Currently, `use-feed-data.ts` fetches all enabled RSS feeds on mount, stores parsed articles in a module-level variable (`feedCache`), and re-fetches on manual refresh. The module-level cache survives same-session navigation but is lost on page reload. Article actions (`use-article-state.ts`) manage hidden IDs and read-list entries in localStorage via `useSyncedStorage`, with no awareness of the IDB cache.

## Goals / Non-Goals

**Goals:**

- Deliver stale-while-revalidate UX: show cached articles instantly on mount, fetch fresh data in background
- Establish a three-tier cache hierarchy: L1 (in-memory module variable) → L2 (IndexedDB) → L3 (network fetch)
- Keep eviction aligned with user intent by pinning read-list articles in the IDB cache
- Enable historical day navigation using cached articles that have fallen off the RSS feed
- Maintain all existing behavior (filtering, search, deduplication, pull-to-refresh) unchanged

**Non-Goals:**

- Progressive rendering (showing articles as each feed resolves) — existing `Promise.all` pattern is retained
- Service Worker integration or offline app shell — future PWA work
- Migrating state management to a library (Zustand, TanStack Query) — out of scope
- Changing the sync system or Supabase integration

## Decisions

### Three-tier cache hierarchy in `useFeedData`

The mount sequence becomes: (1) check L1 (module variable) — if populated, render immediately and skip IDB read; (2) if L1 is empty, read from L2 (IndexedDB) — if articles exist, render them and set `loading: false`; (3) fire background network fetch (L3), upsert results into IDB, update L1, and re-render. This gives instant rendering for same-session navigation (L1) and cross-session persistence (L2) while always refreshing from the network.

Alternative considered: dropping the module-level cache entirely and always reading from IDB. Rejected because IDB reads are async and involve serialization overhead (~5-10ms for hundreds of articles), whereas the module variable is synchronous and free. The L1 cache provides a measurably better experience for tab-switch navigation.

### Pin/unpin as a fire-and-forget side effect

When `addToReadList` is called, it also calls `articleCache.setPinned(id, true)`. When `removeFromReadList` is called, it calls `articleCache.setPinned(id, false)`. These calls are fire-and-forget (no `await`, errors silently caught) because pinning is an optimization for eviction, not a critical operation. If a pin call fails, the worst case is an article gets evicted after 14 days — the read list itself (in localStorage/Supabase) is unaffected.

Alternative considered: making pin/unpin synchronous by storing pin state alongside read-list data in localStorage. Rejected because the cache layer's `pinned` flag exists specifically to keep eviction decoupled from UI state.

### Historical day navigation reads from IDB cache

When the user navigates to a past day, the existing flow filters `articles` (from the current fetch) by date. With this change, if the network fetch returns no articles for a requested day, the feed page falls back to IDB cached articles for that date range via `getByDateRange()`. This is implemented in `useFeedData` — it merges network-fetched articles with IDB-cached articles, deduplicating by ID.

Alternative considered: only querying IDB for the selected day on demand (lazy load). Rejected because the existing `filterByDay` utility already operates on the full article array, and merging cached articles into that array keeps the filtering pipeline unchanged.

### IDB cache read is non-blocking for the loading state

If IDB has cached articles, `loading` is set to `false` immediately after the IDB read — the user sees content. The background fetch does not flip `loading` back to `true`. Instead, the UI updates seamlessly when fresh articles arrive. If IDB is empty (first-ever visit), the existing loading spinner behavior is preserved.

Alternative considered: showing a subtle "refreshing" indicator during background fetch even when cached articles are displayed. Deferred as a future UX enhancement — the "Refreshed X ago" label already communicates staleness.

## Risks / Trade-offs

**[Risk] IDB read adds latency on first mount after reload** → IDB reads for hundreds of articles take ~5-10ms. This is imperceptible compared to the seconds-long network fetch it replaces. The L1 cache eliminates this cost on subsequent mounts within the same session.

**[Risk] Stale cached articles shown before fresh data arrives** → The user briefly sees yesterday's data before new articles appear. The "Refreshed X ago" timestamp makes this transparent. The alternative (showing a spinner) is worse UX for the common case.

**[Risk] Pin/unpin calls fail silently** → If IDB is unavailable, `setPinned` fails as a no-op. The read-list data in localStorage is the source of truth — IDB pinning is purely an eviction optimization. The 14-day window is generous enough that temporary pin failures don't cause meaningful data loss.

**[Trade-off] Merging cached + fresh articles adds complexity to deduplication** → The existing `deduplicateArticles` function already handles duplicates by title+date and URL. Merging IDB-cached articles into the fresh fetch results flows through the same deduplication pipeline. No new deduplication logic is needed.

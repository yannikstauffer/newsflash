## Context

The app fetches and parses RSS feeds on every page load. A module-level JavaScript variable (`feedCache`) caches parsed articles for same-session navigation but is lost on refresh. Users currently see a spinner on every cold load, historical day navigation returns empty results, and there is no offline capability. The existing `NormalizedArticle` interface defines the article shape used throughout the app.

## Goals / Non-Goals

**Goals:**

- Persist parsed articles in IndexedDB so they survive page refreshes, tab closes, and device restarts
- Provide date-range and source-based queries for future historical browsing
- Support a pinning mechanism so read-list articles are exempt from eviction
- Keep the cache layer pure (no React dependencies) and accessible from Service Workers for future PWA use
- Auto-evict unpinned articles older than 14 days to bound storage growth

**Non-Goals:**

- Integrating the cache into the React data flow (follow-up change)
- Service Worker or PWA manifest (future work)
- Syncing article content across devices via Supabase (articles are per-device; only user preferences sync)
- Caching raw XML responses (we cache parsed articles, not HTTP responses)
- Full-text search indexing

## Decisions

### Use `idb` library over raw IndexedDB API

Raw IndexedDB is callback-based and verbose. The `idb` library (~1KB gzipped) wraps it in a promise-based API with TypeScript generics. It adds negligible bundle weight and eliminates boilerplate. Alternative considered: using raw IndexedDB directly — rejected due to poor ergonomics and error-prone transaction handling.

### Store parsed articles, not raw XML

Storing `NormalizedArticle` data means the cache can serve articles instantly without re-parsing. It also enables indexing by `publishedAt` and `source` for efficient queries. Alternative considered: caching raw XML in the Cache API — rejected because it doesn't enable date-range queries and still requires parsing on read.

### Single object store with compound queries over multiple stores

One `articles` store with indexes on `publishedAt`, `source`, and `pinned` handles all query patterns (get all, get by date range, eviction). Alternative considered: separate stores per source — rejected as it complicates cross-source queries and eviction.

### `CachedArticle` extends `NormalizedArticle` with `pinned` and `cachedAt`

Adding `pinned: boolean` enables eviction to skip read-list items without importing read-list logic. Adding `cachedAt: Date` tracks when articles entered the cache (distinct from `publishedAt`). The cache module only knows about `pinned` — it doesn't know what "read list" is.

### Eviction runs inline after `upsertMany()`

Running eviction after each batch upsert keeps the database bounded without needing a scheduler or Service Worker. The eviction query uses the `publishedAt` index with a cursor, so it's efficient even with thousands of articles. Alternative considered: eviction on app startup only — rejected because it leaves stale data between sessions.

### Database versioning with migration support

IDB version starts at 1. The `idb` `upgrade` callback handles schema migrations. If the schema changes in the future (e.g., adding a full-text index), a version bump with migration logic ensures existing data is preserved or re-indexed.

## Risks / Trade-offs

**[Risk] IndexedDB storage limits** → Modern browsers provide at least 50MB per origin (often much more). 14 days of articles from 7 sources is roughly 2-5MB — well within limits. If storage is pressured, the browser may evict the entire origin's IDB in some browsers, but this is graceful — the app falls back to network fetch.

**[Risk] IDB unavailable in private browsing** → Some browsers restrict IDB in private/incognito mode. The cache module must handle `open()` failures gracefully — return empty results and skip writes. The app continues to work via network fetch as it does today.

**[Risk] Schema migration on version bump** → If a future version changes indexes or adds fields, existing cached articles need migration. The `idb` upgrade callback handles this, but complex migrations (e.g., re-indexing) may require clearing the store. Acceptable because cached articles are ephemeral — losing them is inconvenient, not destructive.

**[Trade-off] Eviction by `publishedAt`, not `cachedAt`** → Using `publishedAt` means an article published 15 days ago but cached today would be immediately evicted. This is intentional — old articles have diminishing value regardless of when they were cached. If this proves wrong, switching to `cachedAt` is a one-line change in the eviction query.

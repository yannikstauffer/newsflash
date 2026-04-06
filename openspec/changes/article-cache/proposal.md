## Why

Every page load fetches all enabled RSS feeds from scratch, showing a loading spinner until all responses arrive. The in-memory module-level cache survives same-session navigation but is lost on refresh, tab close, or device restart. There is no persistent article storage, so historical day browsing shows empty results once articles fall off the RSS feed, and the app is completely unusable offline. A persistent cache layer is the foundation for stale-while-revalidate UX and future PWA/offline support.

## What Changes

- Add the `idb` library (~1KB gzipped) as a dependency for promise-based IndexedDB access
- Introduce `src/lib/article-cache.ts` — a pure data layer (no React) that stores parsed articles in IndexedDB
- Cache schema: `CachedArticle` objects with primary key `id`, indexes on `publishedAt`, `source`, and `pinned`
- CRUD operations: `getAll()`, `getByDateRange(start, end)`, `upsertMany(articles)`, `setPinned(id, pinned)`, `evict(maxAgeDays)`
- Eviction strategy: articles with `pinned === false` older than 14 days are deleted; pinned articles (read list) are kept forever
- Eviction runs automatically after each `upsertMany()` call
- IndexedDB is accessible from both main thread and Service Workers, enabling future PWA offline support without migration

## Capabilities

### New Capabilities

- `article-cache`: Persistent IndexedDB-based article storage with date-range queries, pinning, and time-based eviction

### Modified Capabilities

(none — this is a standalone data layer with no integration into existing features yet)

## Impact

- New dependency: `idb` (npm)
- New file: `src/lib/article-cache.ts`
- New file: `src/lib/article-cache.test.ts`
- No changes to existing files — integration happens in a follow-up change

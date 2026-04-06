## 1. Setup

- [ ] 1.1 Install `idb` dependency: `npm install idb`
- [ ] 1.2 Define `CachedArticle` interface in `src/lib/article-cache.ts` extending `NormalizedArticle` with `pinned: boolean` and `cachedAt: Date`

## 2. Database Initialization

- [ ] 2.1 Implement `openDatabase()` function using `idb` to open/create `newsflash-articles` database (version 1) with `articles` object store (keyPath: `id`, indexes: `publishedAt`, `source`, `pinned`)
- [ ] 2.2 Handle IndexedDB unavailability — wrap `openDatabase()` so all operations gracefully return empty results or no-op when IDB is blocked

## 3. CRUD Operations

- [ ] 3.1 Implement `upsertMany(articles: NormalizedArticle[])` — convert to `CachedArticle`, preserve existing `pinned`/`cachedAt` on update, call `evict()` after completion
- [ ] 3.2 Implement `getAll()` — return all cached articles as `NormalizedArticle[]` (strip `pinned` and `cachedAt`)
- [ ] 3.3 Implement `getByDateRange(start: Date, end: Date)` — query `publishedAt` index, return matching articles as `NormalizedArticle[]`
- [ ] 3.4 Implement `setPinned(id: string, pinned: boolean)` — update `pinned` flag on existing article, no-op if article not found

## 4. Eviction

- [ ] 4.1 Implement `evict(maxAgeDays: number = 14)` — delete all articles where `pinned === false` and `publishedAt` is older than `maxAgeDays` days from now

## 5. Tests

- [ ] 5.1 Write unit tests for database initialization (first-time creation, existing database, IDB unavailable fallback)
- [ ] 5.2 Write unit tests for `upsertMany` (insert new, update existing preserving pinned/cachedAt, mixed insert/update, auto-eviction trigger)
- [ ] 5.3 Write unit tests for `getAll` (with articles, empty cache)
- [ ] 5.4 Write unit tests for `getByDateRange` (articles in range, no articles in range, boundary values)
- [ ] 5.5 Write unit tests for `setPinned` (pin, unpin, non-existent article)
- [ ] 5.6 Write unit tests for `evict` (old unpinned deleted, pinned preserved, nothing to evict)

## 6. Quality Gates

- [ ] 6.1 Run `npm run lint` and fix any issues
- [ ] 6.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 6.3 Run `npm run test` and fix any issues
- [ ] 6.4 Run `npm run test:e2e` and fix any issues
- [ ] 6.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 6.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

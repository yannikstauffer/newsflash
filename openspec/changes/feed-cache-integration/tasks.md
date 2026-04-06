## 1. Stale-While-Revalidate in useFeedData

- [ ] 1.1 Refactor `useFeedData` mount sequence: check L1 (module variable) first; if empty, read from L2 (IndexedDB via `articleCache.getAll()`); set articles and `loading: false` if cached articles exist
- [ ] 1.2 After L2 read (or if both L1/L2 are empty), fire background network fetch via `fetchAllFeeds`; on completion, upsert results into IDB via `articleCache.upsertMany()` and update L1 module cache
- [ ] 1.3 Ensure `refresh()` (manual pull-to-refresh) also upserts fetched articles into IDB cache after completion
- [ ] 1.4 Handle IDB read failures gracefully — fall back to network-only behavior (existing flow) if IDB is unavailable

## 2. Historical Day Navigation

- [ ] 2.1 After network fetch completes, merge IDB-cached articles (via `articleCache.getAll()` or the already-loaded cache) with network-fetched articles, deduplicating by the existing `deduplicateArticles` function
- [ ] 2.2 Verify that navigating to a past day displays articles from IDB cache even when those articles are no longer in the RSS feed

## 3. Pin/Unpin in Article Actions

- [ ] 3.1 In `useArticleState.addToReadList`, add a fire-and-forget call to `articleCache.setPinned(article.id, true)` after the localStorage write
- [ ] 3.2 In `useArticleState.removeFromReadList`, add a fire-and-forget call to `articleCache.setPinned(articleId, false)` after the localStorage write
- [ ] 3.3 In `useArticleState.clearReadList`, add fire-and-forget calls to `articleCache.setPinned(id, false)` for each article being removed
- [ ] 3.4 In `useArticleState.restoreReadList`, add fire-and-forget calls to `articleCache.setPinned(id, true)` for each article being restored

## 4. Tests

- [ ] 4.1 Update `use-feed-data.test.ts`: test L1 hit (no IDB read), L2 hit (IDB returns articles, no spinner shown), L1+L2 miss (spinner + network fetch), background fetch updates after L2 hit
- [ ] 4.2 Update `use-feed-data.test.ts`: test that `refresh()` upserts into IDB, test IDB failure fallback
- [ ] 4.3 Update `use-feed-data.test.ts`: test historical day navigation shows cached articles from IDB when not in network fetch results
- [ ] 4.4 Update `use-article-state.test.ts`: test that `addToReadList` calls `setPinned(id, true)`, `removeFromReadList` calls `setPinned(id, false)`, `clearReadList` unpins all, `restoreReadList` pins all
- [ ] 4.5 Update `use-article-state.test.ts`: test that pin/unpin failures do not affect read-list operations

## 5. Quality Gates

- [ ] 5.1 Run `npm run lint` and fix any issues
- [ ] 5.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 5.3 Run `npm run test` and fix any issues
- [ ] 5.4 Run `npm run test:e2e` and fix any issues
- [ ] 5.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 5.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

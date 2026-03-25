## 1. Core Implementation

- [x] 1.1 Update `deduplicateArticles()` in `use-feed-data.ts`: add a `seenLinks` Set and OR it with the existing `seenKeys` check in the filter condition
- [x] 1.2 Swap call order in `fetchAllFeeds()`: call `sortChronologically()` before `deduplicateArticles()` so youngest article wins

## 2. Tests

- [x] 2.1 Add test: articles with same URL but different titles are deduplicated
- [x] 2.2 Add test: articles with same URL but different timestamps keep the youngest
- [x] 2.3 Add test: articles with different URLs and same title+date are still deduplicated (existing behavior preserved)
- [x] 2.4 Add test: articles with different URLs and different title+date are both kept

## 3. Quality Gates

- [x] 3.1 Run `npm run lint` and fix any issues
- [x] 3.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 3.3 Run `npm run test` and fix any issues
- [x] 3.4 Run `npm run test:e2e` and fix any issues
- [x] 3.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 3.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

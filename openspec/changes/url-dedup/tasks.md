## 1. Core Implementation

- [ ] 1.1 Update `deduplicateArticles()` in `use-feed-data.ts`: add a `seenLinks` Set and OR it with the existing `seenKeys` check in the filter condition
- [ ] 1.2 Swap call order in `fetchAllFeeds()`: call `sortChronologically()` before `deduplicateArticles()` so youngest article wins

## 2. Tests

- [ ] 2.1 Add test: articles with same URL but different titles are deduplicated
- [ ] 2.2 Add test: articles with same URL but different timestamps keep the youngest
- [ ] 2.3 Add test: articles with different URLs and same title+date are still deduplicated (existing behavior preserved)
- [ ] 2.4 Add test: articles with different URLs and different title+date are both kept

## 3. Quality Gates

- [ ] 3.1 Run `npm run lint` and fix any issues
- [ ] 3.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 3.3 Run `npm run test` and fix any issues
- [ ] 3.4 Run `npm run test:e2e` and fix any issues
- [ ] 3.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 3.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

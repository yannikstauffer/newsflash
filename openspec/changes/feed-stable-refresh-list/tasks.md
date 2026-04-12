## 1. Stabilize useLazyList visible count

- [x] 1.1 In `src/hooks/use-lazy-list.ts`, change the items-change detection logic: when `state.items !== items`, compare `items.length` vs `state.items.length`. If new length >= old length and old length > 0, preserve `visibleCount` (clamped to new length). Only reset to `batchSize` when new length < old length or old length was 0.
- [x] 1.2 Add unit tests in `src/hooks/use-lazy-list.test.ts` for: same-length array swap preserves visibleCount, longer array preserves visibleCount, shorter array resets to batchSize, empty-to-populated resets to batchSize, visibleCount clamped when exceeding new array length

## 2. Add referential stability to useFeedData

- [x] 2.1 In `src/features/feed/hooks/use-feed-data.ts`, add an `articlesRef` (useRef) that tracks the current articles array. In `applyFetchResult`, before calling `setArticles`, compare the new merged array's ID sequence against `articlesRef.current`. If identical, skip the `setArticles` call.
- [x] 2.2 Extract the ID fingerprint comparison into a helper function `hasArticleListChanged(prev: NormalizedArticle[], next: NormalizedArticle[]): boolean` for testability
- [x] 2.3 Add unit tests in `src/features/feed/hooks/use-feed-data.test.ts` for: background refresh with identical articles does not trigger state update, background refresh with new articles triggers state update, background refresh with reordered articles triggers state update

## 3. Quality Gates

- [x] 3.1 Run `npm run lint` and fix any issues
- [x] 3.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 3.3 Run `npm run test` and fix any issues
- [x] 3.4 Run `npm run test:e2e` and fix any issues
- [x] 3.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 3.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

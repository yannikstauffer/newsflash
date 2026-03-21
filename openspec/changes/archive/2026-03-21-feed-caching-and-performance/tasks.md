## 1. Fix mutable array in useFeedData

- [x] 1.1 Refactor `useFeedData` fetch logic to return articles from each promise instead of pushing into a shared array
- [x] 1.2 Use `Promise.all` result with `.flat()` to merge all feed results after resolution
- [x] 1.3 Write unit tests verifying concurrent feeds produce correct merged output

## 2. Add in-memory feed cache

- [x] 2.1 Add module-level cache variable in `use-feed-data.ts` to hold articles, errors, and `lastRefreshedAt` timestamp
- [x] 2.2 Initialize state from cache on mount if cache is populated; skip automatic fetch
- [x] 2.3 Update cache on every successful refresh
- [x] 2.4 Export `clearFeedCache()` helper for test cleanup
- [x] 2.5 Write unit tests verifying cache hit skips fetch and cache miss triggers fetch

## 3. Display last-refreshed timestamp

- [x] 3.1 Return `lastRefreshedAt` (Date or null) from `useFeedData`
- [x] 3.2 Add `lastRefreshedAt` prop to `FilterBar` and display relative time (e.g., "refreshed 2 min ago")
- [x] 3.3 Pass `lastRefreshedAt` from `FeedPage` to `FilterBar`
- [x] 3.4 Write unit test verifying timestamp renders and updates after refresh

## 4. Memoize hiddenSet in FeedList

- [x] 4.1 Wrap `new Set(hiddenIds)` in `useMemo` with `[hiddenIds]` dependency in `feed-list.tsx`
- [x] 4.2 Write unit test verifying Set reference stability when hiddenIds does not change

## 5. Verification

- [x] 5.1 Run `npm run lint` and fix any lint errors
- [x] 5.2 Run `npm run test` and verify all tests pass
- [x] 5.3 Manual smoke test: switch tabs, verify no re-fetch; click refresh, verify new data and updated timestamp

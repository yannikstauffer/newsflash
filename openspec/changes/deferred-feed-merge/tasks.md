## 1. Stable `isFeedEnabled` reference

- [ ] 1.1 In `src/features/feed-config/hooks/use-feed-preferences.ts`, add a `storeRef` and keep it current via `useEffect`; change `isFeedEnabled` to `useCallback(() => storeRef.current[feedId] !== false, [])` so it has a stable reference
- [ ] 1.2 Update `use-feed-preferences.test.ts` to verify that the `isFeedEnabled` function reference does not change between renders when the store updates

## 2. Pending articles buffer in `useFeedData`

- [ ] 2.1 In `src/features/feed/hooks/use-feed-data.ts`, add `pendingArticles` state (`useState<NormalizedArticle[]>([])`) and expose `pendingCount` and `acceptPending` in `FeedDataResult`
- [ ] 2.2 In `applyFetchResult`, when `articlesRef.current.length > 0 && !forceUpdate`, compute the diff (new articles not already in the displayed set by ID) and call `setPendingArticles(newOnes)` instead of `setArticles(merged)`. Leave the existing merge path intact for `forceUpdate=true` (pull-to-refresh) and initial load
- [ ] 2.3 Implement `acceptPending`: merge `pendingArticles` into `articlesRef.current` via `mergeAndDeduplicate`, call `setArticles(merged)`, clear `setPendingArticles([])`
- [ ] 2.4 Add unit tests in `use-feed-data.test.ts` covering: (a) background refresh does not change displayed articles when list is non-empty, (b) `pendingCount` reflects new article count, (c) `acceptPending` merges and clears the buffer, (d) manual refresh (`forceUpdate=true`) bypasses the buffer, (e) initial load (empty displayed list) populates directly

## 3. Thread pending state through `useFeedPage`

- [ ] 3.1 In `src/features/feed/hooks/use-feed-page.ts`, destructure `pendingCount` and `acceptPending` from `useFeedData` and add both to `FeedListProps`
- [ ] 3.2 Pass `pendingCount` and `acceptPending` through `feedListProps` to `FeedList` in `FeedPage`

## 4. "Show X newer articles" button in `FeedList`

- [ ] 4.1 In `src/features/feed/components/feed-list.tsx`, add `pendingCount?: number` and `onAcceptPending?: () => void` props to `FeedListProps`
- [ ] 4.2 When `pendingCount > 0`, render a button as the first element of the article list container (before the `visibleItems.map` block). Button content: `RefreshCw` icon (size-3.5) + "Show {pendingCount} newer articles". Style consistent with existing muted/secondary UI; full-width, rounded, with appropriate padding and hover state
- [ ] 4.3 Add unit tests in `feed-list.test.tsx` covering: (a) button not rendered when `pendingCount` is 0 or undefined, (b) button rendered with correct count when `pendingCount > 0`, (c) clicking the button calls `onAcceptPending`

## 5. Quality Gates

- [ ] 5.1 Run `npm run lint` and fix any issues
- [ ] 5.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 5.3 Run `npm run test` and fix any issues
- [ ] 5.4 Run `npm run test:e2e` and fix any issues
- [ ] 5.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 5.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

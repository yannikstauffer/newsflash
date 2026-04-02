## 1. Pull-to-Refresh Hook

- [ ] 1.1 Create `src/hooks/use-pull-to-refresh.ts` with `usePullToRefresh` hook using `@use-gesture/react` `useDrag` — accepts `onRefresh` callback and `isRefreshing` boolean, returns `{ containerRef, pullOffset, isPulling }`
- [ ] 1.2 Implement touch-only detection via `window.matchMedia("(pointer: coarse)")` — hook is a no-op on non-touch devices
- [ ] 1.3 Implement scroll-top guard (`window.scrollY <= 1`) — only start tracking pull when at page top
- [ ] 1.4 Implement pull threshold (64px) and max cap (80px) — trigger refresh on release past threshold, snap back below threshold
- [ ] 1.5 Disable gesture while `isRefreshing` is true to prevent concurrent refreshes
- [ ] 1.6 Reset pull offset when `isRefreshing` transitions from true to false

## 2. Feed List Integration

- [ ] 2.1 Update `useFeedPage` to destructure and expose `refresh` from `useFeedData`
- [ ] 2.2 Update `FeedPage` to pass `onRefresh` and `loading` props to `FeedList`
- [ ] 2.3 Update `FeedList` props interface to accept `onRefresh` and `loading`
- [ ] 2.4 Integrate `usePullToRefresh` in `FeedList` — attach `containerRef` to the list wrapper div
- [ ] 2.5 Add spinner indicator (`Loader2`) above the article list that appears during pull and refresh, with `translateY` on the list container following pull offset

## 3. Unit Tests

- [ ] 3.1 Test `usePullToRefresh` hook: no-op on non-touch devices (no listeners attached)
- [ ] 3.2 Test `usePullToRefresh` hook: pull below threshold snaps back without calling `onRefresh`
- [ ] 3.3 Test `usePullToRefresh` hook: pull past threshold calls `onRefresh`
- [ ] 3.4 Test `usePullToRefresh` hook: gesture ignored while `isRefreshing` is true
- [ ] 3.5 Test `FeedList` renders spinner during pull-to-refresh interaction

## 4. E2E Tests

- [ ] 4.1 Add Playwright e2e test: pull-to-refresh gesture on touch-emulated device triggers refresh and shows spinner

## 5. Quality Gates

- [ ] 5.1 Run `npm run lint` and fix any issues
- [ ] 5.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 5.3 Run `npm run test` and fix any issues
- [ ] 5.4 Run `npm run test:e2e` and fix any issues
- [ ] 5.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 5.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

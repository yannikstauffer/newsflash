## 1. Pull-to-Refresh Hook

- [x] 1.1 Create `src/hooks/use-pull-to-refresh.ts` with `usePullToRefresh` hook using `@use-gesture/react` `useDrag` — accepts `onRefresh` callback and `isRefreshing` boolean, returns `{ containerRef, pullOffset, isPulling }`
- [x] 1.2 Implement touch-only detection via `window.matchMedia("(pointer: coarse)")` — hook is a no-op on non-touch devices
- [x] 1.3 Implement scroll-top guard (`window.scrollY <= 1`) — only start tracking pull when at page top
- [x] 1.4 Implement pull threshold (64px) and max cap (80px) — trigger refresh on release past threshold, snap back below threshold
- [x] 1.5 Disable gesture while `isRefreshing` is true to prevent concurrent refreshes
- [x] 1.6 Reset pull offset when `isRefreshing` transitions from true to false

## 2. Feed List Integration

- [x] 2.1 Update `useFeedPage` to destructure and expose `refresh` from `useFeedData`
- [x] 2.2 Update `FeedPage` to pass `onRefresh` and `loading` props to `FeedList`
- [x] 2.3 Update `FeedList` props interface to accept `onRefresh` and `loading`
- [x] 2.4 Integrate `usePullToRefresh` in `FeedList` — attach `containerRef` to the list wrapper div
- [x] 2.5 Add spinner indicator (`Loader2`) above the article list that appears during pull and refresh, with `translateY` on the list container following pull offset

## 3. Unit Tests

- [x] 3.1 Test `usePullToRefresh` hook: no-op on non-touch devices (no listeners attached)
- [x] 3.2 Test `usePullToRefresh` hook: pull below threshold snaps back without calling `onRefresh`
- [x] 3.3 Test `usePullToRefresh` hook: pull past threshold calls `onRefresh`
- [x] 3.4 Test `usePullToRefresh` hook: gesture ignored while `isRefreshing` is true
- [x] 3.5 Test `FeedList` renders spinner during pull-to-refresh interaction

## 4. E2E Tests

- [x] 4.1 Add Playwright e2e test: pull-to-refresh gesture on touch-emulated device triggers refresh and shows spinner

## 5. Quality Gates

- [x] 5.1 Run `npm run lint` and fix any issues
- [x] 5.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 5.3 Run `npm run test` and fix any issues
- [x] 5.4 Run `npm run test:e2e` and fix any issues
- [x] 5.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 5.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

## 1. localStorage sync mirror for lastSyncedAt

- [ ] 1.1 Add `getLastSyncedAtSync(): Date | null` to `src/lib/sync-metadata.ts` that reads from localStorage key `newsflash:last-synced-at` synchronously, returning null if unavailable or unparseable
- [ ] 1.2 Update `setLastSyncedAt()` in `src/lib/sync-metadata.ts` to also write the ISO string to localStorage (write-through cache), with a try/catch so localStorage failures don't break the IDB write
- [ ] 1.3 Add unit tests for `getLastSyncedAtSync` and the dual-write behavior of `setLastSyncedAt`, including localStorage-unavailable fallback

## 2. Persist lastRefreshedAt to localStorage

- [ ] 2.1 In `src/features/feed/hooks/use-feed-data.ts`, persist `lastRefreshedAt` to localStorage key `newsflash:last-refreshed-at` whenever it is updated in `applyFetchResult`
- [ ] 2.2 Update `useFeedData`'s `useState` initializer for `lastRefreshedAt` to synchronously read from localStorage when `feedCache` has no value
- [ ] 2.3 Add unit tests verifying synchronous hydration from localStorage and persistence on refresh

## 3. Create FeedStatusRow component

- [ ] 3.1 Create `src/features/feed/components/feed-status-row.tsx` — a component that accepts `lastRefreshedAt: Date | null` and renders the combined status line with `lastSyncedAt` read synchronously via `getLastSyncedAtSync()`. Use `min-h-5` for reserved height. Format: "Refreshed {time} · Synced {time}", omitting either half if null
- [ ] 3.2 Add unit tests for `FeedStatusRow` covering all four timestamp combination scenarios (both, refresh-only, sync-only, neither) and verifying the container always has minimum height

## 4. Integrate and remove old indicators

- [ ] 4.1 In `src/features/feed/components/feed-page.tsx`, replace the conditional "Refreshed …" block and `<LastSyncedIndicator />` with `<FeedStatusRow lastRefreshedAt={lastRefreshedAt} />`
- [ ] 4.2 Verify `LastSyncedIndicator` is not imported elsewhere; if unused, delete `src/components/last-synced-indicator.tsx` and its test file
- [ ] 4.3 Update `feed-page.test.tsx` to test the new unified status row rendering

## 5. Quality Gates

- [ ] 5.1 Run `npm run lint` and fix any issues
- [ ] 5.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 5.3 Run `npm run test` and fix any issues
- [ ] 5.4 Run `npm run test:e2e` and fix any issues
- [ ] 5.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 5.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

## 1. Extract Feed Pipeline

- [ ] 1.1 Create `src/lib/feed-pipeline.ts` — export `fetchAndParseAllFeeds(feedIds: string[]): Promise<NormalizedArticle[]>` that fetches each feed via `/api/rss/<id>`, parses with the appropriate connector, normalizes, and returns a flat array. Handle individual feed failures gracefully (log + continue)
- [ ] 1.2 Create `src/lib/feed-pipeline.test.ts` — tests: fetches and parses multiple feeds, individual feed failure doesn't block others, returns empty array when all fail, no React/DOM imports in module
- [ ] 1.3 Refactor `src/features/feed/hooks/use-feed-data.ts` to use `fetchAndParseAllFeeds` instead of inline fetch/parse logic
- [ ] 1.4 Update `src/features/feed/hooks/use-feed-data.test.ts` — verify existing tests still pass after refactor

## 2. Migrate to injectManifest

- [ ] 2.1 Create `src/sw.ts` — service worker source file with `import { precacheAndRoute } from 'workbox-precaching'`, call `precacheAndRoute(self.__WB_MANIFEST)`, add runtime caching rules (NetworkFirst for `/api/rss/*`, CacheFirst for images) that were previously in the vite config
- [ ] 2.2 Update `vite.config.ts` — switch VitePWA from `generateSW` to `injectManifest` mode, set `srcDir: 'src'`, `filename: 'sw.ts'`, remove `workbox.runtimeCaching` (now in SW source)
- [ ] 2.3 Install `workbox-precaching`, `workbox-routing`, `workbox-strategies`, and `workbox-expiration` as dependencies
- [ ] 2.4 Verify `npm run build` produces a working service worker with precaching and runtime caching intact

## 3. Periodic Background Sync Handler

- [ ] 3.1 Add `periodicsync` event listener in `src/sw.ts` — on tag `feed-refresh`, call `fetchAndParseAllFeeds` with all feed IDs from `src/config/feeds.ts`, upsert results into IDB via `articleCache.upsertMany()`, write `last-synced` timestamp to IDB
- [ ] 3.2 Wrap the handler in try/catch — log errors, never let the SW enter a failed state

## 4. Periodic Sync Registration

- [ ] 4.1 Create `src/lib/register-periodic-sync.ts` — export a function that checks `navigator.periodicSync` availability, checks `permission`, and registers `feed-refresh` with `minInterval: 4 * 60 * 60 * 1000`
- [ ] 4.2 Create `src/lib/register-periodic-sync.test.ts` — tests: registers when API available and permission granted, skips when API unavailable, skips when permission denied
- [ ] 4.3 Call the registration function from `src/main.tsx` (or a top-level effect), gated by `useIsStandalone` returning `true`

## 5. Last-Synced Indicator

- [ ] 5.1 Create `src/components/last-synced-indicator.tsx` — reads `last-synced` timestamp from IDB, displays relative time ("Synced 2 hours ago"), hidden when no timestamp exists
- [ ] 5.2 Create `src/components/last-synced-indicator.test.tsx` — tests: displays relative time, hidden when no timestamp, updates on re-render
- [ ] 5.3 Add `<LastSyncedIndicator />` to the feed page header or settings page

## 6. Quality Gates

- [ ] 6.1 Run `npm run lint` and fix any issues
- [ ] 6.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 6.3 Run `npm run test` and fix any issues
- [ ] 6.4 Run `npm run test:e2e` and fix any issues
- [ ] 6.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 6.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

## 1. Configure Workbox Runtime Caching

- [ ] 1.1 Add `runtimeCaching` entry to VitePWA config in `vite.config.ts` for `/api/rss/*` — `NetworkFirst` strategy, 5-second network timeout, max 50 entries, 3-day max age
- [ ] 1.2 Add `runtimeCaching` entry for article images — `CacheFirst` strategy, URL regex matching common image extensions (`jpg|jpeg|png|webp|gif|avif`), max 200 entries, 7-day max age
- [ ] 1.3 Verify the generated service worker includes both runtime caching rules by running `npm run build` and inspecting the SW output

## 2. Suppress Network Errors with Cached Data

- [ ] 2.1 Modify `src/features/feed/hooks/use-feed-data.ts` — when background fetch fails and IDB cache has already provided articles, log the error to console but do not add it to the `errors` state
- [ ] 2.2 Update `src/features/feed/hooks/use-feed-data.test.ts` — add tests: error suppressed when IDB data exists, error surfaced when IDB is empty, error logged to console in both cases

## 3. Offline-Aware Pull-to-Refresh

- [ ] 3.1 Modify `src/hooks/use-pull-to-refresh.ts` — check `navigator.onLine` before triggering the refresh callback; if offline, show a toast via Sonner ("You're offline") and return without fetching
- [ ] 3.2 Update `src/hooks/use-pull-to-refresh.test.ts` — add tests: offline shows toast and skips refresh, online proceeds normally

## 4. Graceful Image Fallback

- [ ] 4.1 In the article card image element, ensure `onerror` or CSS handles missing images gracefully (hide the image or show a placeholder) — this covers uncached images when offline
- [ ] 4.2 Add test for article card rendering when image fails to load

## 5. Quality Gates

- [ ] 5.1 Run `npm run lint` and fix any issues
- [ ] 5.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 5.3 Run `npm run test` and fix any issues
- [ ] 5.4 Run `npm run test:e2e` and fix any issues
- [ ] 5.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 5.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

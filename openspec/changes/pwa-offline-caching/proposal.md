## Why

With the service worker caching the app shell (from `pwa-service-worker`), the UI loads offline but shows no content — the feed is empty and images are broken. Newsflash already has an IndexedDB article cache with stale-while-revalidate loading, so the data layer is partially ready. This step adds Workbox runtime caching strategies for feed API responses and article images, and wires the existing IndexedDB cache to serve as the offline data source. The result: users can open Newsflash offline and read previously loaded articles with images.

## What Changes

- **Runtime Caching for Feed API** — Add a Workbox `runtimeCaching` rule for `/api/rss/*` requests using `NetworkFirst` strategy with a 5-second timeout fallback to cache. This provides fresh data when online and cached XML when offline.
- **Runtime Caching for Images** — Add a Workbox `runtimeCaching` rule for article thumbnail/hero images (external URLs) using `CacheFirst` strategy with an expiration plugin (max 200 entries, 7-day TTL). This avoids re-fetching images the user has already seen.
- **Offline Feed Data from IndexedDB** — Ensure the existing `use-feed-data` hook's stale-while-revalidate flow gracefully handles network failures: when the background fetch fails, suppress the error and keep showing cached articles instead of replacing them with an error state.
- **Offline-Aware UI Enhancements** — When offline: hide the pull-to-refresh affordance (or show "offline" feedback on pull), disable date navigation to days with no cached data, show a subtle "cached" badge on articles served from IndexedDB.
- **Cache Size Management** — Configure Workbox cache expiration: feed responses max 50 entries / 3-day TTL, images max 200 entries / 7-day TTL. The IndexedDB cache already has its own eviction policy.

## Capabilities

### New Capabilities

- `pwa-offline-feeds`: Feed API responses are cached at the service worker level, providing a network-first-with-fallback strategy for RSS data.
- `pwa-offline-images`: Article images are cached with a cache-first strategy, ensuring previously viewed images display offline.

### Modified Capabilities

- `feed`: The feed data hook suppresses network errors when cached data is available, instead of showing error states.
- `ui`: Pull-to-refresh and date navigation adapt their behavior when offline.

## Impact

- `vite.config.ts` — Add `runtimeCaching` rules to VitePWA config for `/api/rss/*` and image URLs
- `src/features/feed/hooks/use-feed-data.ts` — Adjust error handling: suppress network errors when IDB cache has data
- `src/features/feed/hooks/use-feed-data.test.ts` — Add tests for offline error suppression
- `src/hooks/use-pull-to-refresh.ts` — Add online/offline awareness
- `src/features/feed/components/feed-page.tsx` — Conditional UI for offline state
- Depends on: `pwa-service-worker` (needs the SW and Workbox runtime in place)
- Depends on: existing IndexedDB article cache (already implemented)

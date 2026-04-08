## Why

After Steps 1–4, Newsflash works offline and is installable, but content only updates when the user opens the app. For a news reader, freshness matters — users expect to see recent articles the moment they open the app, even if they haven't used it in hours. The Periodic Background Sync API allows the service worker to fetch fresh feed data in the background, so the IndexedDB cache is pre-warmed before the user opens the app.

## What Changes

- **Periodic Background Sync Registration** — Register a periodic background sync with tag `feed-refresh` and a `minInterval` of 4 hours (configurable). This runs the feed fetch logic in the service worker context while the app is closed. Only registered when the user has installed the PWA (standalone mode) since the API requires installation.
- **Service Worker Feed Fetch** — Add a `periodicsync` event handler in the service worker that: imports the feed URL configuration, fetches all enabled feeds, parses the XML, normalizes articles, and writes them to the IndexedDB article cache. This reuses the same feed parsing logic as the main app (shared modules).
- **Shared Feed Logic Extraction** — Extract the feed fetching and parsing pipeline into a standalone module (`src/lib/feed-pipeline.ts`) that can run in both the main thread and the service worker context (no React/DOM dependencies). This includes: URL resolution, XML fetch, parsing via `fast-xml-parser`, and article normalization.
- **Sync Status Indicator** — Show a subtle "Last synced: X minutes ago" indicator in the app header or settings page. When a background sync has pre-warmed the cache, the stale-while-revalidate flow picks it up instantly on app open.
- **Fallback for Unsupported Browsers** — Periodic Background Sync has limited browser support (Chrome Android only). On unsupported platforms, fall back to the existing behavior (fetch on app open). No degradation in UX — just no pre-warming.

## Capabilities

### New Capabilities

- `pwa-background-sync`: The service worker periodically fetches fresh feed data in the background, pre-warming the IndexedDB cache so articles are available instantly on app open.
- `feed-pipeline`: A framework-agnostic feed fetching and parsing module that runs in both main thread and service worker contexts.

### Modified Capabilities

- `feed`: Feed data loading benefits from pre-warmed cache — the stale-while-revalidate flow serves fresher data on cold start.
- `pwa-service-worker`: The service worker gains a periodic sync event handler.

## Impact

- `src/lib/feed-pipeline.ts` — New module: framework-agnostic feed fetch + parse + normalize pipeline
- `src/lib/feed-pipeline.test.ts` — Tests for the pipeline
- `src/features/feed/hooks/use-feed-data.ts` — Refactor to use `feed-pipeline` instead of inline fetch logic
- `src/sw-periodic-sync.ts` — New module: periodic sync handler for the service worker
- `vite.config.ts` — Configure custom service worker injection to include the periodic sync handler
- `src/hooks/use-install-prompt.ts` or `src/main.tsx` — Register periodic background sync after PWA install
- `src/components/last-synced-indicator.tsx` — New component: shows last sync timestamp
- Depends on: `pwa-offline-caching` (needs the Workbox SW and IndexedDB cache integration)
- Depends on: `pwa-install-experience` (standalone detection for conditional registration)

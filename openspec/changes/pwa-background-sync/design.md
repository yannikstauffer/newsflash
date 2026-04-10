## Context

After Steps 1–4, Newsflash is installable, works offline with cached content, and has a polished install experience. Content only updates when the user opens the app — the stale-while-revalidate flow shows cached articles instantly, then fetches fresh data. For a news reader, the gap between "open app" and "see fresh articles" matters. The Periodic Background Sync API allows the service worker to fetch fresh data while the app is closed, pre-warming the IDB cache.

The current feed fetching logic lives in `use-feed-data.ts` (React hook) and relies on `fetchFeed` from `src/features/connectors/fetch-feed.ts`, individual connector parsers, and the shared feed config from `src/config/feeds.ts`. This pipeline is tightly coupled to the React component lifecycle and cannot run in a service worker context.

Step 2 used `generateSW` mode in `vite-plugin-pwa`. This step requires `injectManifest` mode because we need custom service worker logic (the periodic sync handler).

## Goals / Non-Goals

**Goals:**

- Extract feed fetching + parsing into a framework-agnostic module that runs in both main thread and service worker
- Register periodic background sync (4-hour interval) when the app is installed
- Implement a `periodicsync` event handler in the service worker that fetches all enabled feeds and writes to IDB
- Show a "last synced" indicator so users know content freshness
- Migrate from `generateSW` to `injectManifest` mode in vite-plugin-pwa
- Degrade gracefully on browsers that don't support periodic background sync

**Non-Goals:**

- Push notifications
- One-shot Background Sync (for retrying failed operations) — the app's operations are all local
- User-configurable sync interval (fixed at 4 hours initially)
- Syncing article state (hidden, read-list) in background — only feed content

## Decisions

### Extract `feed-pipeline.ts` as a framework-agnostic module

Create `src/lib/feed-pipeline.ts` that exports a `fetchAndParseAllFeeds(enabledFeedIds: string[]): Promise<NormalizedArticle[]>` function. This module imports `feedUrls` from `src/config/feeds.ts`, `fetchFeed` from connectors, and the individual connector parsers. It has zero React or DOM dependencies — just fetch, parse, normalize. Both `use-feed-data.ts` and the service worker import this module.

Alternative considered: duplicating the fetch logic in the SW. Rejected because it would be a maintenance nightmare and the connectors have non-trivial parsing logic.

Alternative considered: using Comlink/message passing to call the main thread. Rejected because the SW runs when the main thread is inactive — the whole point is background execution.

### Migrate to `injectManifest` mode

`generateSW` doesn't support custom service worker code. `injectManifest` mode lets us write a SW source file (`src/sw.ts`) that includes the precache manifest injection point (`self.__WB_MANIFEST`) plus our custom periodic sync handler. The Workbox runtime caching rules (from Step 3) move from the vite config into the SW source file.

This is a necessary migration. The precaching behavior and runtime caching rules remain identical — only their location in the codebase changes (from vite config to SW source file).

### Register periodic sync only when installed

`navigator.permissions.query({ name: 'periodic-background-sync' })` is checked before registration. The API is only available to installed PWAs in Chromium browsers. Registration happens in the main thread after service worker activation, gated by `useIsStandalone()` (from Step 4).

The sync tag is `feed-refresh` with a `minInterval` of `4 * 60 * 60 * 1000` (4 hours). The browser may delay or throttle this — the interval is a minimum, not a guarantee. This is acceptable for a news reader.

### SW periodic sync handler writes directly to IDB

The `periodicsync` event handler in the SW:
1. Reads enabled feed IDs (from a serialized config in IDB or by importing the static config)
2. Calls `fetchAndParseAllFeeds()` from the shared pipeline
3. Writes results to the IDB article cache via `articleCache.upsertMany()`

The IDB database is shared between the main thread and the SW — both can read/write the same stores. No message passing needed.

Alternative considered: using Cache API instead of IDB for background-fetched data. Rejected because the IDB article cache is the canonical data source for the app, and writing there means the stale-while-revalidate flow in `use-feed-data.ts` picks up background-synced articles automatically with zero changes.

### "Last synced" timestamp stored in IDB

A simple key-value entry in IDB stores the timestamp of the last successful background sync. The main thread reads this on mount to display "Last synced: X minutes ago" in the header or settings. If no background sync has occurred, the display falls back to the existing "last refreshed" timestamp from the manual/automatic fetch.

### Graceful degradation

`navigator.periodicSync` is only available in Chromium. On Safari, Firefox, and non-installed contexts, the registration silently no-ops. The app falls back to the existing fetch-on-open behavior. No error, no degraded UI — just no pre-warming.

## Risks / Trade-offs

**[Risk] Periodic Background Sync has very limited browser support** → Only Chrome Android (installed PWAs). This is the primary target platform, so it covers the main use case. Other platforms get the existing behavior, which already works well.

**[Risk] Browser may not honor the minInterval** → Chrome's heuristic considers site engagement. A user who opens Newsflash daily will get reliable background syncs. An inactive user may get fewer. This is acceptable — the API is best-effort by design.

**[Trade-off] `injectManifest` migration adds complexity** → The SW source file must be maintained manually. Precaching and runtime caching config move from declarative (vite config) to imperative (SW code). The benefit (custom sync handler) outweighs the cost.

**[Risk] Feed pipeline in SW must avoid React/DOM imports** → The extraction must be clean — any transitive import of React or DOM APIs will crash the SW. This requires careful attention to the import tree of connectors and parsers.

**[Trade-off] Enabled feed IDs in the SW** → The user's feed preferences are stored in localStorage (via `useSyncedStorage`), which is not accessible from the SW. Options: (a) sync preferences to IDB, (b) always fetch all feeds in background. Going with (b) initially — the cost of fetching a few extra feeds is low and avoids the complexity of syncing preferences.

## Context

After `pwa-service-worker`, the app shell loads offline but feed content is empty. Newsflash already has a robust IndexedDB article cache with stale-while-revalidate loading (from `feed-cache-integration`), meaning cached articles are displayed instantly on mount and refreshed in the background. The feed API uses Vercel Edge Functions in production at `/api/rss/*`.

The current `use-feed-data` hook fetches feeds, upserts results into IDB, and surfaces errors. When the network fetch fails, an error is shown even if cached articles are already displayed — this is the main UX gap for offline mode.

Article cards display thumbnail images from external sources (publisher CDNs). These images have no caching beyond the browser's default HTTP cache, which is cleared when the service worker takes over network control.

## Goals / Non-Goals

**Goals:**

- Cache feed API responses at the service worker level for offline fallback
- Cache article images so previously viewed articles display correctly offline
- Suppress network errors in `use-feed-data` when IDB cache has data (avoid showing errors on top of valid cached content)
- Adapt pull-to-refresh and date navigation for offline state
- Manage cache sizes with sensible expiration policies

**Non-Goals:**

- Caching every possible image (only images the user has actually seen)
- Making feed updates available offline (network-first — if offline, serve cache; no background fetch yet, that's Step 5)
- Offline write operations (bookmarking/hiding works via localStorage/IDB already)
- Infinite offline storage (bounded by expiration policies)

## Decisions

### NetworkFirst strategy for feed API responses

Feed requests to `/api/rss/*` use Workbox `NetworkFirst` with a 5-second timeout. This ensures fresh data when online and falls back to the SW cache when the network is slow or unavailable. The SW cache acts as a tertiary layer: L1 (memory) → L2 (IDB articles) → L2.5 (SW XML cache) → L3 (network).

The SW XML cache is a safety net — the primary offline data source is the IDB article cache (which stores parsed, normalized articles). The SW cache keeps the raw XML responses, which is useful if the IDB cache is cleared or corrupted.

Alternative considered: CacheFirst. Rejected because news feeds change frequently and users expect fresh content when online.

Alternative considered: StaleWhileRevalidate at the SW level. Rejected because the app already implements SWR at the application layer (IDB cache). Doubling up on SWR would add complexity with no UX benefit.

### CacheFirst strategy for article images

Article images (external URLs from publisher CDNs) use Workbox `CacheFirst` with an expiration plugin (max 200 entries, 7-day TTL). Images are immutable in practice — a publisher's thumbnail URL doesn't change content over time. CacheFirst avoids redundant network requests for previously viewed images.

The URL matching pattern targets common image origins and extensions rather than trying to enumerate all publisher CDNs. A broad match (`/^https:\/\/.*\.(jpg|jpeg|png|webp|gif|avif)/i`) captures most article images. False positives (non-article images matching the pattern) are harmless — they just get cached.

Alternative considered: NetworkFirst for images. Rejected because images don't change and the network cost is high for no benefit.

### Suppress network errors when IDB cache has data

In `use-feed-data`, when the background fetch fails and the IDB cache already provided articles, the error is logged to console but not surfaced in the `errors` array. The user sees cached content with a "last refreshed" timestamp indicating staleness — no error banner obscuring valid content.

When the IDB cache is empty AND the network fails, the error is surfaced normally (the user has nothing else to see).

Alternative considered: always showing errors. Rejected because "Network error" on top of a page full of readable cached articles is confusing and alarming.

### Pull-to-refresh shows offline feedback

When offline, pull-to-refresh still triggers but shows a brief "You're offline" toast (via Sonner, already in the project) instead of attempting a fetch. This provides clear feedback without a confusing error state.

Alternative considered: disabling pull-to-refresh entirely when offline. Rejected because the gesture being silently ignored feels broken — explicit feedback is better.

### Cache expiration policies

| Cache | Strategy | Max Entries | Max Age |
|-------|----------|-------------|---------|
| Feed API (`/api/rss/*`) | NetworkFirst (5s timeout) | 50 | 3 days |
| Article images | CacheFirst | 200 | 7 days |

These are conservative defaults. The IDB article cache has its own eviction policy (14-day TTL, pinned articles exempt). The SW caches are supplementary.

## Risks / Trade-offs

**[Risk] Image URL pattern is too broad or too narrow** → A broad regex may cache non-article images (minor waste). A narrow regex may miss images from certain publishers. Start broad and tighten if cache size is a concern.

**[Trade-off] Suppressing network errors hides genuine issues** → Users won't see "feed unavailable" when offline. The offline banner (from Step 2) and "last refreshed" timestamp provide enough context. If the user is online and feeds fail, the error should still surface — the suppression only applies when IDB cache has data.

**[Risk] SW feed cache diverges from IDB article cache** → The SW caches raw XML; the IDB stores parsed articles. They're independent and may have different staleness. This is acceptable because the IDB cache is the primary data source; the SW cache is a fallback for when IDB is empty.

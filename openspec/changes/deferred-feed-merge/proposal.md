## Why

When Supabase sync updates `newsflash:feed-prefs`, the `isFeedEnabled` function receives a new reference, re-triggering the `useFeedData` load effect and causing a brief but jarring flicker: articles (particularly SRF entries) disappear then reappear, and the "Refreshed X ago" timestamp vanishes mid-read.

## What Changes

- **New behaviour:** After the initial load, new articles from background refreshes no longer merge automatically into the displayed feed. Instead they accumulate in a `pendingArticles` buffer.
- **New UI element:** A non-sticky, non-overlaying "↻ Show X newer articles" button appears at the top of `FeedList` when pending articles exist. As the user hides or bookmarks articles the button naturally scrolls into view.
- **Stability fix:** `isFeedEnabled` is made a stable function reference in `useFeedPreferences` (reads from a ref). This prevents sync-triggered preference updates from re-triggering the fetch effect, eliminating the root cause as a fallback defence.
- **Pull-to-refresh unchanged:** Manual refresh bypasses the deferred path and merges immediately as before.

## Capabilities

### New Capabilities

- `deferred-feed-merge`: Pending-articles buffer in the feed data layer, `acceptPending` callback, and the "Show X newer articles" button rendered at the top of the feed list.

### Modified Capabilities

- `feed/pull-to-refresh`: Pull-to-refresh continues to merge immediately (bypasses deferred path via `forceUpdate=true`) — no requirement change, implementation detail only.

## Impact

- `src/features/feed/hooks/use-feed-data.ts` — core state and merge logic
- `src/features/feed-config/hooks/use-feed-preferences.ts` — stable `isFeedEnabled` ref pattern
- `src/features/feed/components/feed-list.tsx` — new button UI at top of list
- `src/features/feed/hooks/use-feed-page.ts` — thread `pendingCount` / `acceptPending` through `FeedListProps`
- No API, routing, or dependency changes

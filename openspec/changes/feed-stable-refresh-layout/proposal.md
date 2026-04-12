## Why

The feed page suffers from layout shifts every time background data arrives. Two status indicators — "Refreshed X ago" and "Synced Y ago" — appear asynchronously after mount, each inserting a new DOM block above the feed list and pushing articles downward. This happens periodically without user interaction (background sync, periodic refresh), making the page feel unstable and unreliable.

## What Changes

- **Merge two status indicators into one row**: Combine "Refreshed X ago" and "Synced Y ago" into a single combined status line (e.g., "Refreshed 2m ago · Synced 5m ago"), eliminating one source of incremental layout shift.
- **Reserve a fixed-height slot for the status row**: The combined status row always occupies space in the layout, even when timestamps are not yet available. Text fades in; the container never grows.
- **Persist `lastRefreshedAt` to localStorage**: Hydrate the refresh timestamp synchronously on mount instead of waiting for the async network fetch to complete, so the status row has content on first paint.

## Capabilities

### New Capabilities
- `feed-status-row`: Unified, layout-stable status row that combines refresh and sync timestamps with reserved height and synchronous hydration.

### Modified Capabilities
- `feed/data-caching`: `lastRefreshedAt` is now persisted to localStorage and hydrated synchronously on mount, rather than being purely in-memory.

## Impact

- `src/features/feed/components/feed-page.tsx` — replaces two separate indicator blocks with a single `FeedStatusRow` component
- `src/components/last-synced-indicator.tsx` — removed or refactored; its logic moves into the new unified component
- `src/features/feed/hooks/use-feed-data.ts` — persist/hydrate `lastRefreshedAt` via localStorage
- `src/lib/sync-metadata.ts` — may need a synchronous read path for `lastSyncedAt`
- `src/features/feed/utils/format-time.ts` — shared by both timestamps (already exists)

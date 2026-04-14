## Why

Users have no way to know which feeds and filters are adding noise versus value. Without visibility into engagement patterns, feed configuration is guesswork — sources that are never read or filters that are redundant stay enabled indefinitely.

## What Changes

- **New Insights page** (`/insights`): dedicated page showing per-source and per-filter engagement stats, with actionable recommendations to reduce noise
- **New stats tracking**: daily-bucketed engagement data (appeared, hidden, saved) collected per source and per filter, stored locally and synced across devices using additive merge
- **New overflow navigation**: the bottom nav's settings item is replaced by a `MoreVertical` overflow button that opens a bottom sheet, with both Settings and Insights accessible from the sheet — keeping the primary nav uncluttered and extensible
- **Sync status indicator moves**: the sync state icon (spinner / checkmark / cog) relocates from a standalone nav item to the overflow sheet trigger button

## Capabilities

### New Capabilities

- `reading-insights`: Insights page — per-source and per-filter engagement summaries, zero-engagement detection, and actionable recommendations (disable source, enable/disable filter)
- `stats-tracking`: Daily-bucketed stats storage schema, event tracking (appeared / hidden / saved), 90-day TTL eviction, and additive merge sync

### Modified Capabilities

- `navigation`: Nav bar changes — Settings item removed, `MoreVertical` overflow button added, new `/insights` route registered, overflow bottom sheet component introduced

## Impact

- `src/app/components/bottom-nav.tsx` — replace Settings `Link` with overflow trigger button
- `src/app/components/` — new `OverflowSheet` component
- `src/app/router.tsx` — add `/insights` route (lazy-loaded)
- `src/features/insights/` — new feature module
- `src/features/sync/sync-service.ts` — additive merge logic for stats key
- `src/features/sync/sync-status.ts` — sync icon moves to overflow button
- `src/features/article-actions/` — tap into hide/save events to record stats
- `src/features/feed/` — tap into feed render to record appeared counts
- `src/lib/` or `src/features/stats/` — new stats storage module (IndexedDB or localStorage)
- Supabase `user_settings` table — new `stats` key, existing schema supports it

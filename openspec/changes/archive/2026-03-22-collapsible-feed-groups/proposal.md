## Why

The SRF connector currently exposes only 8 of 26 available feeds — 18 feeds across News, Sport, Kultur, and Wissen categories are missing. Adding them all would make the flat checkbox list in the settings UI unmanageable. Feeds need to be grouped by category and made collapsible so users can browse and toggle feeds without overwhelming scroll.

## What Changes

- **Add 18 missing SRF feeds** across 4 categories: News (1), Sport (6), Kultur (6), Wissen (5)
- **Add `group` property to `FeedConfig`** — optional string that clusters feeds under a collapsible category header
- **Group feeds in all connectors** — SRF uses 4 groups (News, Sport, Kultur, Wissen); other connectors with multiple feeds (e.g., WinFuture) get groups where meaningful; single-feed connectors remain ungrouped
- **Collapsible group UI in settings** — groups are collapsed by default, show summary count (e.g., "2/4 on"), and have a group-level checkbox to toggle all feeds in the group at once
- **Add feed URLs and proxy mappings** for all 18 new SRF feeds

## Capabilities

### New Capabilities
- `feed-grouping`: Collapsible feed groups in settings UI — groups feeds by category within each connector, with collapse/expand, summary counts, and group-level toggle

### Modified Capabilities
- `feed-connectors`: SRF connector adds 18 missing feeds; FeedConfig gains optional `group` field; all connectors assign groups where meaningful
- `feed-configuration`: Settings UI renders feeds within collapsible groups instead of flat list; group-level toggle checkbox added

## Impact

- `src/features/connectors/types.ts` — `FeedConfig` interface gains `group?: string`
- `src/features/connectors/srf-connector.ts` — grows from 8 to 26 feeds with group assignments
- `src/config/feeds.ts` — 18 new feed URL entries
- `src/features/feed-config/components/feed-config-page.tsx` — collapsible group rendering
- `src/features/feed-config/hooks/use-feed-preferences.ts` — group-level toggle helpers
- All other connector files — add group assignments where applicable
- `api/rss/[feed].ts` — no changes (URL lookup from feeds.ts)
- Test files — updated counts and new group-related assertions
- `tests-e2e/helpers/mock-feeds.ts` — new fixture mappings for SRF feed IDs

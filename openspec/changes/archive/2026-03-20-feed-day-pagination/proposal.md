## Why

The feed currently shows all articles in one flat chronological list. As the number of sources grows, this becomes overwhelming. Paginating by day gives users a focused view of one day's news at a time, making the feed more digestible and easier to catch up on.

## What Changes

- Add day-based pagination UI with prev/next navigation buttons
- Default view shows today (even if empty)
- Prev/next navigates by calendar day (no skipping empty days); next disabled on today
- Day header shows lowercase label: `today, 20.03.2026` / `yesterday, 19.03.2026` / `wednesday, 18.03.2026` (always show weekday for older days)
- Existing filters (source, language, search) apply within the current day
- Add "All articles" toggle that shows all articles without day grouping (hides prev/next)
- Empty days show a message with navigation still available

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `article-feed`: Add day-based pagination, day header with labels, "All articles" view

## Impact

- `src/features/feed/components/feed-page.tsx` — add pagination state and day filtering logic
- `src/features/feed/components/feed-list.tsx` — accept paginated articles
- New component: day pagination header with prev/next and day label
- New utility: `formatDayLabel(date: Date): string` for day header labels

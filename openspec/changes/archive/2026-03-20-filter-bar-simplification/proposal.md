## Why

The filter bar duplicates source selection that already exists on the settings page, and the language selector is moving to settings. Removing these controls simplifies the feed page and reduces visual clutter, leaving only the contextual controls (hidden toggle, search, refresh).

## What Changes

- Remove source pill buttons from the filter bar
- Remove language selector from the filter bar
- Remove `enabledSources` / `onToggleSource` / `language` / `onLanguageChange` props from `FilterBar`
- Remove the corresponding local state (`enabledSources`, `language`) from `FeedPage`
- Feed page reads source preferences from `useFeedPreferences` and language from persisted settings
- Filter bar becomes a single row: hidden toggle, search input, refresh button

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `filter-bar-refinement`: Remove source pills and language selector, simplify to single row
- `feed-filtering`: Remove source filter from feed page, language moved to settings

## Impact

- `src/features/feed/components/filter-bar.tsx` — remove source pills, language selector, simplify props
- `src/features/feed/components/feed-page.tsx` — remove `enabledSources` and `language` local state, read from shared preferences
- `src/features/feed/utils/filter-articles.ts` — language filter reads from persisted preference instead of prop

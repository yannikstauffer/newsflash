## Why

The settings page is functionally complete but visually plain — raw checkboxes with no structure or grouping. The language selector is moving here from the feed page filter bar, and localStorage needs cleanup when feeds are deactivated to prevent unbounded storage growth.

## What Changes

- Add a "Language" section with a segmented control (All / DE / EN) that persists to localStorage
- Restructure the page with a heading, clearly labeled sections, card-style source groups, and visual dividers
- When all feeds for a source are deactivated, clean up that source's hidden article IDs and read list entries from localStorage
- Persist language preference via `useFeedPreferences` or a new dedicated hook

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `feed-configuration`: Add language selector, structured layout, localStorage cleanup on feed deactivation

## Impact

- `src/features/feed-config/components/feed-config-page.tsx` — restructure layout, add language section
- `src/features/feed-config/hooks/use-feed-preferences.ts` — add language preference persistence
- `src/features/article-actions/hooks/use-article-state.ts` — expose cleanup functions for removing articles by source
- New shared hook or extension for language preference

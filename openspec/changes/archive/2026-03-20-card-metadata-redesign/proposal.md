## Why

The current article card shows metadata (source, time, category) below the headline. This buries context the reader needs to decide relevance before reading the title. Moving metadata above the headline and switching from relative to absolute timestamps improves scannability and gives readers precise timing at a glance.

## What Changes

- Move the metadata line (source, time, category) above the headline in article cards
- Replace relative time (`3h ago`) with absolute time (`dd.MM.yyyy hh:mm:ss` on desktop, `dd.MM. hh:mm` on mobile)
- Render source name and category in lowercase; source retains `font-medium`
- Hide category on mobile viewports to keep the metadata line compact
- Replace `formatRelativeTime` with `formatAbsoluteTime` and `formatShortTime` utility functions

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `card-redesign`: Visual hierarchy changes (metadata above headline), metadata content changes (absolute time, lowercase, responsive category visibility)

## Impact

- `src/features/feed/components/article-card.tsx` — reorder JSX, add responsive category visibility
- `src/features/feed/utils/format-time.ts` — replace `formatRelativeTime` with two new format functions
- Tests for format-time utility need updating

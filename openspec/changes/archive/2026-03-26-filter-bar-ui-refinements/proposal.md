## Why

The filter bar header area has several UX issues: the article counter and refresh timestamp compete for space, the search icon doesn't match sibling button styling, and toggle button icons are off-center on mobile. Pinning the filter bar also gives users persistent access to navigation and filtering controls while scrolling through articles.

## What Changes

- **Sticky filter bar**: Pin the filter bar (controls row + day navigation) to the top of the viewport so it remains visible while scrolling
- **Swap counter and refresh text**: Keep the article counter ("27 articles") in the sticky filter bar; move "Refreshed just now" out of the filter bar and into the feed page content area so it scrolls away
- **Fix refresh text wording**: Change "Refreshed now" to "Refreshed just now" by hardcoding the <60s case in `formatRelativeTime()`
- **Fix search icon button styling**: Change from `ghost`/`icon-sm` to `outline`/`rounded-full` to match the "All articles" and "Hidden" toggle buttons
- **Fix icon centering on mobile**: Override asymmetric padding on toggle buttons when labels are hidden on small screens, so icons are horizontally centered

## Capabilities

### New Capabilities

- `sticky-filter-bar`: Sticky positioning of the filter bar with background and visual separator

### Modified Capabilities

- `filter-bar-refinement`: Layout swap (counter stays, refresh text moves out), search icon styling, and icon centering fixes

## Impact

- `src/features/feed/components/filter-bar.tsx` — Sticky positioning, remove refresh text, fix search button styling, fix icon padding
- `src/features/feed/components/feed-page.tsx` — Render "Refreshed just now" between filter bar and article list
- `src/features/feed/utils/format-time.ts` — Hardcode "just now" for <60s case
- Existing filter-bar tests may need updating for moved refresh text

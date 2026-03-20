## Why

Both the feed page and read list page render all article cards at once. As the number of articles grows, this causes unnecessary rendering cost and potential jank on lower-powered devices. Lazy loading via intersection observer keeps the initial render fast by only rendering visible cards plus a small buffer.

## What Changes

- Add intersection observer-based lazy loading to all card list views (feed page, read list page)
- Render cards in batches of 10-20, loading more as the user scrolls near the bottom
- No more loading occurs once all cards are rendered

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `article-feed`: Add lazy loading requirement for card lists

## Impact

- `src/features/feed/components/feed-list.tsx` — integrate lazy loading logic
- `src/features/article-actions/components/read-list-page.tsx` — integrate lazy loading logic
- New shared hook: `useLazyList` or similar for intersection observer + batch management

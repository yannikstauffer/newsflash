## Why

`FeedPage` is a 209-LOC God Component that orchestrates filtering, keyboard shortcuts, swipe gestures, article state, hover tracking, day navigation, and rendering. It has 7 `useCallback` wrappers and manages 4+ state variables, violating the project's own "methods under 20 lines" guideline. It also imports 5 files directly from `article-actions` and 1 from `feed-config`, creating tight cross-feature coupling. This makes the component hard to test, hard to reason about, and a bottleneck for changes.

## What Changes

- Extract all state management, callbacks, and keyboard shortcut logic from `FeedPage` into a `useFeedPage()` custom hook — the component should only render JSX
- Introduce a barrel export (`index.ts`) in `article-actions` so `FeedPage` imports from a single entry point instead of 5 separate files
- Stabilize the `refresh` function reference to eliminate the `eslint-disable react-hooks/exhaustive-deps` suppression
- Remove redundant `useCallback` wrappers in `SwipeableCard` that just delegate to props (lines 22-28)
- Remove the `eslint-disable jsx-a11y/no-static-element-interactions` by moving hover tracking into the custom hook or a dedicated wrapper component

## Capabilities

### New Capabilities
- `feed-page-orchestration`: Custom hook (`useFeedPage`) encapsulating feed page state, filtering, day navigation, keyboard shortcuts, hover tracking, and article action callbacks

### Modified Capabilities
- `article-actions`: Add barrel export as the public API surface for the feature; remove redundant `useCallback` wrappers in `SwipeableCard`

## Impact

- `src/features/feed/components/feed-page.tsx` — reduced to ~30 LOC of pure JSX rendering
- `src/features/feed/hooks/use-feed-page.ts` — new file containing extracted logic
- `src/features/article-actions/index.ts` — new barrel export
- `src/features/article-actions/components/swipeable-card.tsx` — remove redundant callbacks
- `src/features/feed/hooks/use-feed-data.ts` — stabilize `refresh` reference
- No API changes, no dependency changes, no breaking changes

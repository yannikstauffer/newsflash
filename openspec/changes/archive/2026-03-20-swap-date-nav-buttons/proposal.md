## Why

The date navigator in the filter bar currently places the "Previous day" button on the left and "Next day" on the right. This feels counterintuitive because navigating to the previous (older) day moves the timeline forward in reading order (left-to-right), while the feed displays newer content first. Swapping the buttons so "Next day" (→ newer) is on the left and "Previous day" (← older) is on the right aligns the navigation direction with the feed's reverse-chronological order.

## What Changes

- Swap the position of the previous/next day buttons in the date navigator section of the filter bar
- The left button becomes "Next day" (ChevronRight icon, navigates toward today)
- The right button becomes "Previous day" (ChevronLeft icon, navigates toward older dates)
- Update associated tests to reflect the new button order

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `filter-bar-refinement`: The date navigator button order is changing — next day moves to the left, previous day moves to the right.

## Impact

- `src/features/feed/components/filter-bar.tsx` — button order and icon swap
- `src/features/feed/components/filter-bar.test.tsx` — test expectations for button order

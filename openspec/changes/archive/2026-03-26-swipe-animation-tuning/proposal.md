## Why

The swipeable card animations feel sluggish and disconnected. Three UX issues:
1. Card dismissal at 350ms is too slow for a swipe gesture — feels laggy rather than responsive.
2. Cards slide off-screen at full opacity, then the gap collapses after — no visual overlap, feels sequential.
3. Slight diagonal swipes get rejected as vertical scrolls, causing accidental list scrolling when the user intended to swipe.

## What Changes

- **Faster swipe + fadeout**: Reduce card slide/fade to 200ms. Add opacity fade (1→0) on the card itself so it fades out uniformly as it swipes away.
- **Overlapping collapse**: Start gap collapse 100ms after swipe begins (staggered). Use aggressive ease-out so collapse is fast initially and eases in at the end.
- **Angle tolerance**: Replace `axis: "x"` with asymmetric thresholds (`[10, 30]`) so horizontal movement registers at 10px but vertical needs 30px — biases toward swipe over scroll.

## Capabilities

### New Capabilities

_None — this is a UX polish change._

### Modified Capabilities

- `card-removal-animation`: Faster (200ms), adds uniform opacity fadeout, staggered collapse with non-linear easing.
- `swipe-gesture-detection`: More forgiving angle tolerance via asymmetric drag thresholds.

## Impact

- `src/features/article-actions/components/swipeable-card.tsx` — animation timing, opacity, collapse stagger, drag config
- `src/features/article-actions/components/swipeable-card.test.tsx` — timing adjustments in tests

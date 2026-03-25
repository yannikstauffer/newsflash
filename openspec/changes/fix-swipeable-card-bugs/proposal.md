## Why

Two SwipeableCard integration bugs prevent article actions from persisting:
1. **Read list button removal doesn't persist** — clicking the remove button animates the card away but never calls `removeFromReadList`, so the article reappears on reload.
2. **Feed swipe actions are broken** — the feed passes callback props (`onSwipeRight`/`onSwipeLeft`) that don't match SwipeableCard's expected interface (`swipeRight`/`swipeLeft` as `SwipeConfig` objects), so swipe gestures in the main feed silently do nothing and show no background/icon.

## What Changes

- **Read list remove button**: Decouple from `SwipeableCard.triggerRemoval()` — call `removeFromReadList` directly on button click, matching how the feed's hide button works. The card disappears from the list via React re-render rather than relying on the animation callback.
- **Feed swipe integration**: Replace bare `onSwipeRight`/`onSwipeLeft` callbacks with full `SwipeConfig` objects containing `bgClassName`, `icon`, and `onAction` — restoring swipe-to-hide (amber + eye-off icon) and swipe-to-save (blue + bookmark icon) functionality with proper visual feedback.

## Capabilities

### New Capabilities

_None — this is a bug fix for existing capabilities._

### Modified Capabilities

- `swipe-reveal-background`: Feed swipe backgrounds and icons are not rendering due to prop mismatch — fix restores the specified visual feedback (amber/eye-off for hide, blue/bookmark for save).
- `card-removal-animation`: Read list button removal animation fires but never triggers the state mutation — fix decouples button removal from the animation callback path.
- `article-actions`: Read list removal via button doesn't persist to localStorage — fix ensures `removeFromReadList` is called directly.

## Impact

- `src/features/article-actions/components/read-list-page.tsx` — button click handler changes
- `src/features/feed/hooks/use-feed-page.ts` — swipe config objects replace bare callbacks
- Existing tests for both files will need updates to match the new integration patterns

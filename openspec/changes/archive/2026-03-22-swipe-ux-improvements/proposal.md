## Why

The current swipe interaction gives no visual feedback about what action is about to happen — the card simply translates and snaps back. After the action fires, the card stays in the list with no removal animation, making it hard to tell what changed. Adding to the read list also leaves the card in the main feed, cluttering the view. There are no bulk actions for managing large numbers of articles.

## What Changes

- Swipe gestures reveal a colored background with an action icon behind the card, giving clear visual intent
- Swipe-triggered actions play a "swipe away" animation (slide + fade + collapse, 350ms simultaneous)
- Button-triggered actions play a fade + collapse animation (no slide, 350ms)
- Remaining cards slide up smoothly after a card is removed (driven by max-height collapse)
- Adding to read list (swipe or button) now also hides the article from the main feed
- Read list page supports swipe right to remove (card stays hidden in main feed)
- "Hide All" button on the main feed filter bar — hides all visible articles for the selected day/search, with confirmation dialog and undo toast
- "Remove All" button on the read list page — removes all read list items, with confirmation dialog and undo toast
- Undo toast (Sonner) for bulk actions: 5-second auto-dismiss with restore capability

## Capabilities

### New Capabilities
- `swipe-reveal-background`: Colored background with action icon revealed behind card during swipe gesture
- `card-removal-animation`: Swipe-away and fade-collapse animations for card removal (swipe and button triggers)
- `bulk-article-actions`: Hide All (main feed) and Remove All (read list) with confirmation dialogs and undo toasts

### Modified Capabilities
- `article-actions`: Adding to read list now also hides from main feed; read list swipe right removes without unhiding; remove from read list no longer returns article to normal state in main feed

## Impact

- **Components**: `swipeable-card.tsx`, `article-action-buttons.tsx`, `read-list-page.tsx`, `feed-list.tsx`, `filter-bar.tsx`
- **Hooks**: `use-article-state.ts`, `use-feed-page.ts`
- **Dependencies**: Add `sonner` for toast notifications, add `AlertDialog` from shadcn/ui
- **Specs**: Existing `article-actions` spec scenarios for "Remove from Read List" behavior change (no longer returns to normal state)
- **Tests**: Existing tests for article state, swipeable card, and action buttons will need updates

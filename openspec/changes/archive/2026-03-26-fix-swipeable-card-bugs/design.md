## Context

`SwipeableCard` is a shared component used in two contexts:
- **Main feed** (`use-feed-page.ts`): swipe right to hide, swipe left to save/unsave
- **Read list** (`read-list-page.tsx`): swipe right to remove, button click to remove

The component exposes two integration paths:
1. **Swipe gestures** — handled internally via `useDrag`, fires `swipeRight.onAction()` or `swipeLeft.onAction()` after animation
2. **Programmatic removal** — via `triggerRemoval()` imperative handle, fires the same callbacks after animation

Both paths converge in `fireCallback(direction)`, which only handles `"left"` and `"right"` — not `null`. The button path passes `null`, so the callback never fires.

Separately, the feed passes `onSwipeRight`/`onSwipeLeft` (bare callbacks) but `SwipeableCard` expects `swipeRight`/`swipeLeft` (`SwipeConfig` objects with `bgClassName`, `icon`, `onAction`). The prop name mismatch means swipe in the feed is inert.

## Goals / Non-Goals

**Goals:**
- Read list button removal persists to localStorage
- Feed swipe actions work with proper visual feedback (colored backgrounds + icons)
- Consistent integration pattern: action buttons call state mutations directly, SwipeableCard handles swipe gestures only

**Non-Goals:**
- Refactoring `SwipeableCard` internals or the `fireCallback`/`triggerRemoval` API — the component works correctly for swipe; the bug is in how consumers integrate with it
- Adding swipe left to the read list page (spec says it's disabled)

## Decisions

### Decision 1: Read list button calls `removeFromReadList` directly

The button click handler will call `removeFromReadList(article.id)` directly instead of routing through `cardHandle.triggerRemoval()`. This matches how the feed's hide button calls `hideArticle()` directly.

**Trade-off**: The button click loses the fade-out animation — the card will disappear instantly via React re-render when it's removed from the list. This is acceptable because:
- The feed's hide button already works this way (no animation on button click)
- The swipe path still gets the full slide-away animation
- Instant removal on button click feels responsive

**Alternative considered**: Fix `fireCallback` to handle `null` direction. Rejected because it would require `SwipeableCard` to guess which callback to fire when direction is ambiguous, and the feed already establishes the pattern of direct calls from buttons.

### Decision 2: Feed passes full `SwipeConfig` objects

`use-feed-page.ts` will construct proper `SwipeConfig` objects with:
- **Swipe right (hide)**: amber background (`bg-amber-100 dark:bg-amber-900/30`), `EyeOff` icon, `onAction: () => hideArticle(article.id)`
- **Swipe left (save)**: blue background (`bg-blue-100 dark:bg-blue-900/30`), `BookmarkPlus` icon, `onAction` toggles read list state

Colors and icons match the existing specs in `swipe-reveal-background`.

## Risks / Trade-offs

- **Button removal loses animation** → Acceptable; consistent with feed hide pattern, feels responsive
- **Icon imports added to `use-feed-page.ts`** → Minor bundle impact; these icons are already used elsewhere in the app

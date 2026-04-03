## Why

Bookmarking an article (swipe left or button) plays a removal animation, but the article is not actually excluded from the main feed. On page reload, the article reappears because `filterArticles()` only filters by `hiddenIds`, not by read list membership. This creates a confusing UX where bookmarked articles appear to vanish and then come back.

## What Changes

- Bookmarking an article (swipe left, button click, or keyboard shortcut) now also hides it from the main feed by adding it to `hiddenIds`
- Button-triggered bookmark plays a fade-only removal animation (no horizontal slide) before the card disappears
- Keyboard shortcut (S key) bookmark also hides the article with fade-only animation
- Removing an article from the read list does NOT unhide it — the article stays in `hiddenIds` permanently
- Previously bookmarked articles appear alongside manually hidden articles when "Show Hidden" is toggled on

## Capabilities

### New Capabilities

_None — this change modifies existing capabilities only._

### Modified Capabilities

- `article-actions`: Bookmark action now also hides the article from the main feed; button and keyboard bookmark trigger fade-only card removal animation
- `swipe-gesture-detection`: Swipe-left bookmark action now persists the hide (adds to `hiddenIds` in addition to read list)

## Impact

- `src/features/feed/hooks/use-feed-page.ts` — swipe-left `onAction`, button `onSave`, and keyboard `onSave` callbacks must also call `hideArticle()`
- `src/features/article-actions/components/article-action-buttons.tsx` — bookmark button needs to trigger `SwipeableCard.triggerRemoval()` for fade-only animation
- `src/features/article-actions/hooks/use-article-keyboard-shortcuts.ts` — S key handler needs to trigger fade-only removal animation
- E2E tests in `tests-e2e/article-actions.spec.ts` — existing "save article" test asserts the card remains visible after save; this must be updated

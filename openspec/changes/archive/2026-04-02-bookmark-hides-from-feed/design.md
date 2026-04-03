## Context

The existing `article-actions` spec already defines the intended behavior: bookmarking (swipe, button, keyboard) SHALL add to read list AND hide from main feed. However, the current implementation only adds to the read list — `hideArticle()` is never called alongside `addToReadList()`. The swipe animation visually removes the card, masking the bug until page reload when the article reappears.

Key files in scope:
- `src/features/feed/hooks/use-feed-page.ts` — wires swipe/button/keyboard actions to state hooks
- `src/features/article-actions/hooks/use-article-state.ts` — provides `hideArticle()` and `addToReadList()`
- `src/features/article-actions/components/article-action-buttons.tsx` — bookmark button UI
- `src/features/article-actions/hooks/use-article-keyboard-shortcuts.ts` — S key handler
- `tests-e2e/article-actions.spec.ts` — E2E tests that assert incorrect behavior

## Goals / Non-Goals

**Goals:**
- Bookmark action (all three triggers) calls both `addToReadList()` and `hideArticle()`
- Button click triggers a fade-only removal animation (no horizontal slide) before the card disappears
- Keyboard shortcut (S key) triggers the same fade-only removal animation
- E2E tests updated to assert correct behavior (card disappears after save)

**Non-Goals:**
- Changing `filterArticles()` logic — it already filters by `hiddenIds`, which is the correct mechanism
- Changing `removeFromReadList()` — it already leaves `hiddenIds` untouched
- Distinguishing bookmarked-then-removed articles from manually hidden articles in "Show Hidden" view
- Modifying the swipe gesture detection thresholds or animation mechanics

## Decisions

### 1. Add `hideArticle()` call alongside `addToReadList()` in all three paths

**Rationale:** The simplest fix. All three bookmark triggers (swipe left `onAction`, button `onSave`, keyboard `onSave`) in `use-feed-page.ts` already have access to `hideArticle()` from `useArticleState()`. Adding the call is a one-line addition per path.

**Alternative considered:** Creating a combined `saveArticle()` helper in `useArticleState`. Rejected because the two operations are independent state updates and combining them adds unnecessary abstraction for a two-line sequence.

### 2. Button and keyboard bookmark trigger `SwipeableCard.triggerRemoval()` with no direction (fade-only)

**Rationale:** `SwipeableCard` already supports `triggerRemoval()` without a direction argument, which triggers a fade + collapse animation without horizontal translation. This is the natural path — the swipe handles its own animation, but button/keyboard need to trigger it explicitly.

**Approach:** The `renderArticleWrapper` in `use-feed-page.ts` creates `SwipeableCard` elements. We need a ref map (`Map<string, SwipeableCardHandle>`) so that button and keyboard actions can call `triggerRemoval()` on the correct card. The `onAction` callbacks will:
1. Call `triggerRemoval()` to start the animation
2. The animation's completion callback (`fireCallback`) already fires `onAction` — but for button/keyboard, the hide+save happens immediately, and `triggerRemoval` provides the visual feedback

**Refinement:** For button/keyboard, the sequence is: call `addToReadList()` + `hideArticle()` immediately, then call `triggerRemoval()` for visual animation. The card will animate away while React re-renders will remove it from the filtered list (since it's now in `hiddenIds`). The animation and data removal happen concurrently — this is fine because the collapsing animation prevents layout jank.

### 3. Swipe-left bookmark: add `hideArticle()` inside the existing `onAction` callback

**Rationale:** The swipe already handles its own animation via `SwipeableCard`. The `onAction` fires after the animation completes. Adding `hideArticle()` here means the article is hidden in data after the visual removal — clean and consistent.

## Risks / Trade-offs

- **[Risk] Double state update on bookmark** — Calling both `addToReadList()` and `hideArticle()` triggers two localStorage writes and two re-renders. → Mitigation: These are lightweight operations (Set mutation + JSON.stringify). React batches state updates in event handlers, so only one re-render occurs.
- **[Risk] Ref map for SwipeableCard handles** — Maintaining a `Map<string, SwipeableCardHandle>` adds a small amount of bookkeeping. → Mitigation: Use a ref callback pattern in `renderArticleWrapper` to register/unregister handles. The map lives in a `useRef` and doesn't trigger re-renders.
- **[Risk] E2E test assumes card stays visible after save** — The existing test at `tests-e2e/article-actions.spec.ts` explicitly asserts the card remains visible after save. → Mitigation: Update the test to assert the card disappears instead.

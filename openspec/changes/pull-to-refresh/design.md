## Context

The feed list (`FeedList`) renders articles in a vertically scrolling list within the page's natural scroll container (no inner overflow). Users can swipe horizontally on cards via `SwipeableCard` using `@use-gesture/react`. The data layer (`useFeedData`) already has a `refresh()` method, but it's not exposed to the UI. The app targets mobile-first with a fixed bottom nav bar.

## Goals / Non-Goals

**Goals:**
- Enable touch users to pull down on the feed list to trigger a refresh
- Provide visual feedback (spinner) during the pull and refresh
- Reuse existing `refresh()` and `Loader2` spinner — no new dependencies

**Non-Goals:**
- Desktop pull-to-refresh or a refresh button for desktop
- Refresh indicator in the nav bar or header
- Infinite scroll refresh (bottom pull) — only top pull
- Changing the existing data fetching or caching strategy

## Decisions

### 1. Hook placement: shared `usePullToRefresh` in `src/hooks/`

The hook is a generic gesture pattern, not feed-specific. Placing it in `src/hooks/` follows the project's shared module conventions and allows reuse (e.g., read-list page).

**Alternative considered**: Inline in `FeedList` — rejected because it mixes gesture logic with rendering.

### 2. Gesture detection: `@use-gesture/react` `useDrag` with vertical axis lock

Use `useDrag` with `axis: "y"` and `filterTaps: true`. Only activate when `window.scrollY <= 1` (accounts for sub-pixel rounding). The pull threshold is 64px before triggering refresh.

**Alternative considered**: Native `touchstart`/`touchmove` listeners — rejected because `@use-gesture/react` is already in use and handles edge cases (velocity, cancellation, passive events).

### 3. Touch-only detection: `window.matchMedia("(pointer: coarse)")`

Check at hook initialization via `matchMedia`. If the device has a fine pointer (mouse), the hook is a no-op — no event listeners attached, no DOM changes. This avoids unnecessary overhead on desktop.

**Alternative considered**: Check `"ontouchstart" in window` — rejected because some laptops with touchscreens report touch support but shouldn't show pull-to-refresh.

### 4. Visual feedback: translateY on list container + spinner

During pull, the list container translates down by the drag distance (capped at ~80px). A `Loader2` spinner appears in the gap above the list. Once released past threshold, the spinner stays visible at a fixed offset while `refresh()` runs, then animates back to 0.

**Alternative considered**: Inserting a collapsible div that grows — rejected because `translateY` is GPU-composited and smoother on mobile.

### 5. Data flow: `refresh` and `loading` passed as props

`useFeedPage` destructures `refresh` from `useFeedData` and passes it through `FeedPage` → `FeedList`. `FeedList` passes `onRefresh` and `loading` to `usePullToRefresh`. The hook calls `onRefresh` when the gesture completes, and resets the visual state when `loading` transitions from `true` to `false`.

## Risks / Trade-offs

- **[Conflict with SwipeableCard]** → Mitigated by axis locking. Pull-to-refresh is vertical-only, SwipeableCard is horizontal-only with threshold `[10, 30]`. Both use `@use-gesture/react` which handles multi-touch correctly.
- **[Scroll position edge case]** → On iOS, elastic/rubber-band scrolling can report negative `scrollY`. The hook checks `scrollY <= 1` and only starts tracking after a downward drag exceeds a small dead zone (8px).
- **[Double refresh]** → The hook ignores pull gestures while `loading` is `true`, preventing concurrent refreshes.

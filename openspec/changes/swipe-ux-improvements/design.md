## Context

The app uses `@use-gesture/react` for horizontal swipe detection in `SwipeableCard`. Currently, swiping triggers a state change (hide or toggle read list) but the card just snaps back to position — no visual feedback about what action will fire, no removal animation. The read list and hidden state are independent: saving to read list does not hide the article.

There is no animation library beyond CSS transitions and `tw-animate-css`. Only one shadcn component exists (`Button`). Sonner and AlertDialog are not yet installed.

## Goals / Non-Goals

**Goals:**
- Clear visual feedback during swipe (colored background + icon reveal)
- Satisfying card removal animations (swipe-away for gestures, fade-collapse for buttons)
- Smooth list reflow after card removal
- Unified behavior: adding to read list always hides from main feed
- Bulk actions (Hide All, Remove All) with confirmation and undo

**Non-Goals:**
- Swipe left on the read list page (no action)
- Undo for individual card actions (only bulk)
- Vertical swipe gestures
- Haptic feedback

## Decisions

### 1. Animation approach: CSS transitions only, no animation library

Use CSS `transition` on `transform`, `opacity`, and `max-height` properties directly on the swipeable card wrapper. No Framer Motion or React Spring.

**Why:** The animations are simple (slide, fade, collapse). CSS transitions handle these well, keep the bundle small, and match the existing pattern in the codebase. The 350ms simultaneous animation is achievable with `transition: transform 350ms ease-out, opacity 350ms ease-out, max-height 350ms ease-out`.

**Alternative considered:** Framer Motion's `AnimatePresence` would handle exit animations more elegantly but adds ~15KB to the bundle for a feature that CSS can handle.

### 2. SwipeableCard becomes a two-layer component

Restructure `SwipeableCard` to have an outer container (background reveal) and an inner card (the draggable content):

```
┌─ outer container (relative, overflow-hidden, rounded) ──┐
│  ┌─ background layer (absolute, colored bg + icon) ──┐  │
│  │  centered icon, conditional color                  │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌─ card layer (translate, z-above background) ───────┐  │
│  │  {children}                                        │  │
│  └────────────────────────────────────────────────────┘  │
│  (outer handles max-height + opacity for removal)        │
└──────────────────────────────────────────────────────────┘
```

The outer container animates `max-height` and `opacity` for removal. The inner card animates `translateX` during drag and on release.

**Why:** Keeps the reveal behind the card without z-index issues. The outer container's `overflow-hidden` ensures the background only shows where the card has moved away from.

### 3. Animation state machine in SwipeableCard

SwipeableCard manages a state: `idle` → `dragging` → `removing` → (unmount).

- `idle`: No transforms applied, transitions enabled for snap-back
- `dragging`: `translateX` follows finger, no transition (real-time)
- `removing`: Triggers the exit animation (slide + fade + collapse OR just fade + collapse), then fires the action callback after animation completes

The action callback fires AFTER the animation, not before. This prevents the card from being removed from the DOM mid-animation.

**Why:** If state updates remove the card from the React tree during animation, the animation gets cut short. By delaying the callback until `transitionend`, the animation plays fully.

### 4. Configurable swipe directions via props

SwipeableCard accepts configuration for which directions are active and what background to show:

```typescript
interface SwipeConfig {
  bgClassName: string   // e.g. "bg-amber-100 dark:bg-amber-900/30"
  icon: ReactNode       // e.g. <EyeOff />
}

interface SwipeableCardProps {
  children: ReactNode
  swipeRight?: SwipeConfig & { onAction: () => void }
  swipeLeft?: SwipeConfig & { onAction: () => void }
  onAnimationComplete?: () => void
}
```

If `swipeLeft` is not provided, left swipe does nothing (used on read list page).

**Why:** The same component handles both main feed (left + right) and read list (right only) contexts without branching logic.

### 5. Button-triggered removal via imperative ref

Expose a `triggerRemoval(direction?: "left" | "right")` method via `useImperativeHandle` on SwipeableCard. When called without a direction, it plays fade + collapse only (no translateX). When called with a direction, it plays the full swipe-away.

Action buttons call this method instead of directly calling state mutations. The state mutation fires after the animation completes.

**Why:** Decouples animation trigger from state update. The button doesn't need to know about animation internals — it just says "remove this card."

**Alternative considered:** Controlling animation via a `removing` prop from the parent. This requires lifting animation state up and is more complex for no benefit.

### 6. Bulk actions: snapshot-then-mutate with undo

For Hide All / Remove All:

1. Capture snapshot of affected IDs (and full article objects for read list)
2. Execute the bulk mutation
3. Show Sonner toast with count and Undo button
4. On Undo: restore from snapshot (unhide IDs / re-add articles)
5. Toast auto-dismisses after 5 seconds

New methods on `useArticleState`:
- `hideArticles(ids: string[])` — bulk hide
- `unhideArticles(ids: string[])` — bulk unhide (for undo)
- `clearReadList()` — remove all from read list
- `restoreReadList(articles: NormalizedArticle[])` — re-add articles (for undo)

**Why:** Snapshot-before-mutate is the simplest undo pattern. No need for a command/event system. The snapshot lives in the toast's closure.

### 7. New dependencies: Sonner + AlertDialog

- **Sonner**: Add via `npx shadcn@latest add sonner`. Provides accessible toast with action button support. Render `<Toaster />` in root layout.
- **AlertDialog**: Add via `npx shadcn@latest add alert-dialog`. Provides accessible confirmation dialog with focus trap, ESC to close.

Both are shadcn components, consistent with the existing `Button` component.

### 8. addToReadList behavior change

`addToReadList` in `useArticleState` will NOT be modified to auto-hide. Instead, the callers (swipe handler, button handler, keyboard shortcut) will call both `addToReadList` and `hideArticle` explicitly.

**Why:** Keeps `useArticleState` methods atomic — each does one thing. The coupling is in the UI layer (which decides policy), not the data layer (which manages storage). This also makes it easy to change the policy later without modifying the storage hook.

## Risks / Trade-offs

**max-height animation requires a known value** → Use a generous fixed max-height (e.g., 500px) rather than computing actual height. The card collapses to 0 from whatever its actual height is. The transition duration is fixed at 350ms so the visual speed is consistent regardless of card height. Cards are all roughly the same height so this works well.

**transitionend event can be unreliable** → Use a fallback `setTimeout(350)` alongside `transitionend` listener, whichever fires first triggers the callback. This prevents cards from getting stuck in the "removing" state.

**Sonner toast + undo race condition** → If user triggers "Hide All" twice rapidly, the second snapshot would capture already-hidden IDs. Mitigate by disabling the button during the toast duration, or by computing the snapshot against current visible articles only.

**Read list "Remove from Read List" spec change** → The existing spec says removing from read list "returns article to normal state in main feed." This change modifies that: removed articles stay hidden. This is a deliberate behavior change documented in the modified spec.

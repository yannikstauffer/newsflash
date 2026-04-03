## Animation Timeline

```
SWIPE RELEASE
│
├─ t=0ms ──── Card starts sliding to ±120% + fading to opacity 0
│             Duration: 200ms, ease-out
│
├─ t=100ms ── Outer container starts collapsing (staggered via setTimeout)
│             maxHeight → 0, opacity → 0
│             Duration: 200ms, cubic-bezier(0.2, 0, 0, 1) — fast start, gentle end
│
├─ t=200ms ── Card fully gone (slid off + faded out)
│             Collapse ~50% done (fast phase)
│
├─ t=250ms ── Callback fires (transitionend on opacity, or fallback timer)
│
├─ t=300ms ── Gap fully closed
│
└─ Card removed from DOM
```

## Card Inner (slide + fade)

- `transform`: translateX(±120%) — unchanged direction
- `opacity`: 1 → 0 — NEW, uniform fade
- `transition`: `transform 200ms ease-out, opacity 200ms ease-out`
- During drag (`animationState === "dragging"`): no transition (direct tracking)

## Outer Container (collapse)

- Triggered via `setTimeout(100)` after entering "removing" state
- `maxHeight`: 500px → 0px
- `opacity`: 1 → 0
- `transition`: `max-height 200ms cubic-bezier(0.2, 0, 0, 1), opacity 200ms cubic-bezier(0.2, 0, 0, 1)`
- The cubic-bezier(0.2, 0, 0, 1) gives fast initial movement that decelerates — the gap closes quickly at first then settles.

## State Changes

New state needed: `collapsing` flag (boolean) to separate card removal from outer collapse timing.

Alternative (simpler): keep existing `isRemoving` and use a ref + setTimeout to delay applying the outer collapse styles by 100ms.

Decision: **Use a separate `isCollapsing` state** set via setTimeout. This keeps the style logic declarative.

## Gesture Config

Replace:
```tsx
{ axis: "x", filterTaps: true }
```

With:
```tsx
{ filterTaps: true, threshold: [10, 30] }
```

- Horizontal movement registers after 10px
- Vertical movement needs 30px before it's considered a scroll
- No axis lock — the asymmetric threshold naturally biases toward swipe
- `touch-pan-y` class on the element still allows native vertical scroll once vertical intent is detected

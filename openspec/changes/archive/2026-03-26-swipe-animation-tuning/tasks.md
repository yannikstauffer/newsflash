## 1. Card slide + fade animation

- [x] 1.1 Reduce `ANIMATION_DURATION` to 200 (from 350)
- [x] 1.2 Add opacity transition to card inner div: `opacity 200ms ease-out` alongside existing transform
- [x] 1.3 Set card inner opacity to 0 when `isRemoving` is true
- [x] 1.4 During drag, set transition to "none" for both transform and opacity (no change in behavior)

## 2. Staggered collapse with non-linear easing

- [x] 2.1 Add `isCollapsing` state (boolean, default false)
- [x] 2.2 In `startRemoval`, set `isCollapsing` to true via `setTimeout(100)`
- [x] 2.3 Update outer container styles: apply collapse only when `isCollapsing` is true (not when `isRemoving`)
- [x] 2.4 Change outer container easing to `cubic-bezier(0.2, 0, 0, 1)`
- [x] 2.5 Update fallback timer to 350ms (100ms delay + 200ms animation + 50ms buffer)
- [x] 2.6 Listen for `transitionend` on the outer container after collapse starts (not at removal start)

## 3. Swipe angle tolerance

- [x] 3.1 Remove `axis: "x"` from useDrag config
- [x] 3.2 Add `threshold: [10, 30]` to useDrag config

## 4. Quality gates

- [x] 4.1 Update `swipeable-card.test.tsx` for new timing constants and `isCollapsing` state
- [x] 4.2 Run `npm run lint` and fix any issues
- [x] 4.3 Run `npx tsc --noEmit` and fix any type errors
- [x] 4.4 Run `npm run test` and fix any failures
- [x] 4.5 Run `mcp__jetbrains__get_file_problems` on changed files

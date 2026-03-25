## 1. Fix read list button removal

- [ ] 1.1 In `read-list-page.tsx`, change the BookmarkMinus button's `onClick` to call `removeFromReadList(article.id)` directly instead of routing through `cardHandle.triggerRemoval()`
- [ ] 1.2 Remove the `cardReferencesMap` ref and `SwipeableCardHandle` ref callback since they are no longer needed for button-triggered removal
- [ ] 1.3 Update `read-list-page.test.tsx` to verify button click calls `removeFromReadList` directly

## 2. Fix feed swipe integration

- [ ] 2.1 In `use-feed-page.ts`, replace `onSwipeRight`/`onSwipeLeft` bare callbacks with full `SwipeConfig` objects (`swipeRight`/`swipeLeft` with `bgClassName`, `icon`, `onAction`)
- [ ] 2.2 Import `EyeOff` and `BookmarkPlus` icons from lucide-react for the swipe backgrounds
- [ ] 2.3 Use amber background + EyeOff for swipe right (hide) and blue background + BookmarkPlus for swipe left (save)
- [ ] 2.4 Update `use-feed-page.test.ts` to verify the correct `SwipeConfig` objects are passed to `SwipeableCard`

## 3. Quality Gates

- [ ] 3.1 Run `npm run lint` and fix any issues
- [ ] 3.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 3.3 Run `npm run test` and fix any issues
- [ ] 3.4 Run `npm run test:e2e` and fix any issues
- [ ] 3.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 3.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

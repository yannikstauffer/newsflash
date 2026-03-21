## 1. Dependencies and Setup

- [ ] 1.1 Add Sonner toast component via shadcn (`npx shadcn@latest add sonner`) and render `<Toaster />` in the app root
- [ ] 1.2 Add AlertDialog component via shadcn (`npx shadcn@latest add alert-dialog`)

## 2. SwipeableCard Refactor — Background Reveal and Animation

- [ ] 2.1 Restructure SwipeableCard into two layers: outer container (overflow-hidden, relative) with background reveal div + inner draggable card div
- [ ] 2.2 Add configurable swipe direction props (`swipeRight?: SwipeConfig`, `swipeLeft?: SwipeConfig`) with background color class and icon per direction
- [ ] 2.3 Render the correct background color and icon based on swipe direction (amber/eye-off for right, blue/bookmark for left, red/x-circle for right on read list)
- [ ] 2.4 Implement swipe-away removal animation: on threshold release, simultaneously translateX to ±120%, opacity to 0, max-height to 0 over 350ms
- [ ] 2.5 Implement fade-collapse removal animation (no translateX) for button-triggered removals via `triggerRemoval()` imperative handle
- [ ] 2.6 Fire the action callback after animation completes (transitionend with setTimeout fallback)
- [ ] 2.7 Write tests for SwipeableCard: background reveal visibility, animation state transitions, callback timing

## 3. State Changes — Read List Hides from Main Feed

- [ ] 3.1 Update swipe-left handler in `use-feed-page.ts` to call both `addToReadList(article)` and `hideArticle(article.id)` (callback fires after animation)
- [ ] 3.2 Update bookmark button in `article-action-buttons.tsx` to trigger fade-collapse animation and call both `addToReadList` and `hideArticle`
- [ ] 3.3 Update keyboard shortcut handler (S key) to call both `addToReadList` and `hideArticle`
- [ ] 3.4 Update hide button in `article-action-buttons.tsx` to trigger fade-collapse animation
- [ ] 3.5 Update existing tests for article actions to reflect new combined behavior

## 4. Read List Page — Swipe Right to Remove

- [ ] 4.1 Wrap read list articles in SwipeableCard with swipe-right config only (red/x-circle), no swipe-left
- [ ] 4.2 Wire swipe-right action to `removeFromReadList(id)` (does NOT unhide)
- [ ] 4.3 Update remove button on read list to trigger fade-collapse animation via imperative handle
- [ ] 4.4 Write tests for read list swipe removal and animation

## 5. Bulk Actions — Hide All

- [ ] 5.1 Add `hideArticles(ids: string[])` and `unhideArticles(ids: string[])` bulk methods to `useArticleState`
- [ ] 5.2 Add "Hide All" button to FilterBar component
- [ ] 5.3 Create confirmation AlertDialog for Hide All showing count of visible articles and day label
- [ ] 5.4 Implement Hide All logic: capture visible article IDs, bulk hide, show Sonner undo toast with 5s auto-dismiss
- [ ] 5.5 Implement undo: on toast Undo click, call `unhideArticles` with captured IDs
- [ ] 5.6 Write tests for Hide All: filter-awareness (day + search), confirmation flow, undo restore

## 6. Bulk Actions — Remove All

- [ ] 6.1 Add `clearReadList()` and `restoreReadList(articles: NormalizedArticle[])` methods to `useArticleState`
- [ ] 6.2 Add "Remove All" button to ReadListPage header (hidden when list is empty)
- [ ] 6.3 Create confirmation AlertDialog for Remove All showing count of read list articles
- [ ] 6.4 Implement Remove All logic: capture read list articles snapshot, clear read list, show Sonner undo toast with 5s auto-dismiss
- [ ] 6.5 Implement undo: on toast Undo click, call `restoreReadList` with captured snapshot
- [ ] 6.6 Write tests for Remove All: confirmation flow, undo restore, articles stay hidden in main feed

## 7. Integration and Polish

- [ ] 7.1 Verify dark mode colors for all three swipe backgrounds (amber-900/30, blue-900/30, red-900/30)
- [ ] 7.2 Verify animations work on mobile touch devices (touch-pan-y preserved, no conflicts)
- [ ] 7.3 Run full E2E test suite and fix any regressions
- [ ] 7.4 Run ESLint and TypeScript checks, fix any issues

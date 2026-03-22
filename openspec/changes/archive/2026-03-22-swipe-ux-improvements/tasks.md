## 1. Dependencies and Setup

- [x] 1.1 Add Sonner toast component via shadcn (`npx shadcn@latest add sonner`) and render `<Toaster />` in the app root
- [x] 1.2 Add AlertDialog component via shadcn (`npx shadcn@latest add alert-dialog`)

## 2. SwipeableCard Refactor — Background Reveal and Animation

- [x] 2.1 Restructure SwipeableCard into two layers: outer container (overflow-hidden, relative) with background reveal div + inner draggable card div
- [x] 2.2 Add configurable swipe direction props (`swipeRight?: SwipeConfig`, `swipeLeft?: SwipeConfig`) with background color class and icon per direction
- [x] 2.3 Render the correct background color and icon based on swipe direction (amber/eye-off for right, blue/bookmark for left, red/x-circle for right on read list)
- [x] 2.4 Implement swipe-away removal animation: on threshold release, simultaneously translateX to ±120%, opacity to 0, max-height to 0 over 350ms
- [x] 2.5 Implement fade-collapse removal animation (no translateX) for button-triggered removals via `triggerRemoval()` imperative handle
- [x] 2.6 Fire the action callback after animation completes (transitionend with setTimeout fallback)
- [x] 2.7 Write tests for SwipeableCard: background reveal visibility, animation state transitions, callback timing

## 3. State Changes — Read List Hides from Main Feed

- [x] 3.1 Update swipe-left handler in `use-feed-page.ts` to call both `addToReadList(article)` and `hideArticle(article.id)` (callback fires after animation)
- [x] 3.2 Update bookmark button in `article-action-buttons.tsx` to trigger fade-collapse animation and call both `addToReadList` and `hideArticle`
- [x] 3.3 Update keyboard shortcut handler (S key) to call both `addToReadList` and `hideArticle`
- [x] 3.4 Update hide button in `article-action-buttons.tsx` to trigger fade-collapse animation
- [x] 3.5 Update existing tests for article actions to reflect new combined behavior

## 4. Read List Page — Swipe Right to Remove

- [x] 4.1 Wrap read list articles in SwipeableCard with swipe-right config only (red/x-circle), no swipe-left
- [x] 4.2 Wire swipe-right action to `removeFromReadList(id)` (does NOT unhide)
- [x] 4.3 Update remove button on read list to trigger fade-collapse animation via imperative handle
- [x] 4.4 Write tests for read list swipe removal and animation

## 5. Bulk Actions — Hide All

- [x] 5.1 Add `hideArticles(ids: string[])` and `unhideArticles(ids: string[])` bulk methods to `useArticleState`
- [x] 5.2 Add "Hide All" button to FilterBar component
- [x] 5.3 Create confirmation AlertDialog for Hide All showing count of visible articles and day label
- [x] 5.4 Implement Hide All logic: capture visible article IDs, bulk hide, show Sonner undo toast with 5s auto-dismiss
- [x] 5.5 Implement undo: on toast Undo click, call `unhideArticles` with captured IDs
- [x] 5.6 Write tests for Hide All: filter-awareness (day + search), confirmation flow, undo restore

## 6. Bulk Actions — Remove All

- [x] 6.1 Add `clearReadList()` and `restoreReadList(articles: NormalizedArticle[])` methods to `useArticleState`
- [x] 6.2 Add "Remove All" button to ReadListPage header (hidden when list is empty)
- [x] 6.3 Create confirmation AlertDialog for Remove All showing count of read list articles
- [x] 6.4 Implement Remove All logic: capture read list articles snapshot, clear read list, show Sonner undo toast with 5s auto-dismiss
- [x] 6.5 Implement undo: on toast Undo click, call `restoreReadList` with captured snapshot
- [x] 6.6 Write tests for Remove All: confirmation flow, undo restore, articles stay hidden in main feed

## 7. Integration and Polish

- [x] 7.1 Verify dark mode colors for all three swipe backgrounds (amber-900/30, blue-900/30, red-900/30)
- [x] 7.2 Verify animations work on mobile touch devices (touch-pan-y preserved, no conflicts)
- [x] 7.3 Run full E2E test suite and fix any regressions
- [x] 7.4 Run ESLint and TypeScript checks, fix any issues

## Context

`useArticleState` derives `readListArticles` and `readListIds` from `storedReadList` using `.map()` directly in the render path (lines 62-63). These produce new array references every render. When `ReadListPage` passes `readListArticles` to `useLazyList`, the hook's referential equality check (`state.items !== items`) always fails, calling `setState` and triggering an infinite re-render loop.

## Goals / Non-Goals

**Goals:**
- Eliminate the infinite re-render loop on the Read List page
- Stabilize derived array references in `useArticleState`

**Non-Goals:**
- Refactoring `useLazyList`'s state reset mechanism
- Changing the public API of `useArticleState`

## Decisions

### Wrap derived arrays in `useMemo`

Add `useMemo` around both `.map()` calls in `useArticleState`:
- `readListArticles = useMemo(() => storedReadList.map(fromStored), [storedReadList])`
- `readListIds = useMemo(() => storedReadList.map(a => a.id), [storedReadList])`

**Why not fix `useLazyList` instead?** The hook's "reset when items change" pattern is correct — it uses setState-during-render which is a valid React pattern. The bug is that the caller provides unstable references. Memoizing at the source fixes all current and future consumers.

## Risks / Trade-offs

- **Minimal risk** — `useMemo` is the standard React solution for stabilizing derived data. No behavioral change.

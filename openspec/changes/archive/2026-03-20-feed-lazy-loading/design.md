## Context

`FeedList` renders all articles via `articles.map(...)`. `ReadListPage` similarly renders all saved articles. Neither has any virtualization or lazy rendering.

## Goals / Non-Goals

**Goals:**
- Lazy load cards in batches via intersection observer
- Apply to both feed list and read list
- Keep implementation simple with a reusable hook

**Non-Goals:**
- Full virtualization (react-window, react-virtuoso) — overkill for this scale
- Infinite scroll with server-side pagination — data is already client-side
- Skeleton placeholders for unloaded cards

## Decisions

### 1. Custom `useLazyList` hook with IntersectionObserver

Create a hook `useLazyList<T>(items: T[], batchSize: number)` that returns:
- `visibleItems: T[]` — the items to render (grows in batches)
- `sentinelRef: RefObject<HTMLDivElement>` — attach to a sentinel div at the bottom

The hook uses `IntersectionObserver` on the sentinel element. When the sentinel enters the viewport, the next batch is appended to `visibleItems`. When all items are loaded, the observer disconnects.

**Why not a third-party library?** The logic is ~30 lines. A dependency is unnecessary for simple batch loading.

### 2. Batch size of 15

Split the difference between 10 and 20. Large enough to avoid excessive observer triggers, small enough to keep initial render fast. The batch size is a constant, not configurable — no need for the complexity.

### 3. Reset visible count when items change

When the input `items` array changes (e.g., filters applied, day changed, refresh), the visible count resets to one batch. This prevents stale large counts after filtering to a smaller set.

### 4. Sentinel div placed after rendered cards

A zero-height `<div ref={sentinelRef} />` is rendered after the last visible card. When it scrolls into view, the next batch loads. This is simpler and more reliable than tracking scroll position.

## Risks / Trade-offs

- **Reset on every filter change** — users who scrolled far down will jump back to the top when filters change. This is acceptable since filter changes fundamentally alter the content.
- **No loading indicator between batches** — batches load instantly (no network fetch), so no spinner is needed. The sentinel triggering and state update happen within a single frame.

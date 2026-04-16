## Context

The feed list uses `useLazyList` to incrementally reveal articles as the user scrolls (batches of 15, loaded via IntersectionObserver). When `useFeedData` refreshes in the background, it always produces a new array reference from `mergeAndDeduplicate`. This triggers `useLazyList`'s reset logic (`if (state.items !== items)` → reset `visibleCount` to 15), causing articles beyond the first batch to vanish and reappear as the observer re-fires.

Current flow on background refresh:
```
applyFetchResult → new merged array (always new ref)
  → setArticles(merged)
    → useLazyList detects items !== state.items
      → visibleCount = 15 (was e.g. 40)
        → articles 16-40 vanish
          → IntersectionObserver fires → visibleCount = 30, 45...
            → articles reappear in batches
```

## Goals / Non-Goals

**Goals:**
- Articles already visible in the feed list remain stable during background refreshes
- No unnecessary re-renders when article content hasn't changed
- Maintain correct reset behavior when the list genuinely changes (e.g., filter switch)

**Non-Goals:**
- Preventing flicker during user-initiated pull-to-refresh (loading spinner covers this)
- Layout shift fixes for the status row area (covered by `feed-stable-refresh-layout`)
- Optimizing individual article card re-renders (React Compiler handles this)

## Decisions

### 1. `useLazyList`: preserve `visibleCount` when items grow or stay stable

**Choice:** When the items reference changes, compare old and new array lengths. If the new length is >= the old length, clamp `visibleCount` to `Math.min(currentVisibleCount, newLength)` instead of resetting to `batchSize`. Only reset to `batchSize` when the new list is shorter (indicating a filter change or genuine data reduction).

**Why over always resetting:** The reset-to-15 behavior is only correct when the list has fundamentally changed (different filter, different feed set). During a background refresh the list grows or stays the same — resetting causes the disappear/reappear flicker.

**Why length-based over ID-based comparison:** Length comparison is O(1) and covers the common cases correctly. A background refresh that adds new articles makes the list longer; a refresh with identical content keeps the same length. Only a filter switch or feed disable makes it shorter. ID-based comparison would be more precise but adds O(n) cost on every render for marginal benefit.

**Alternative considered — key-based stability:** Track items by a key function and only reset if the first N visible keys changed. More precise but adds complexity. The length heuristic handles all real scenarios correctly.

### 2. `useFeedData`: referential stability via ID fingerprint

**Choice:** In `applyFetchResult`, before calling `setArticles(merged)`, compare the new merged array's ID sequence against the current articles. If the IDs match in order, reuse the current array reference (`setArticles` is skipped or called with the same ref).

**Implementation:** Extract a fingerprint: `articles.map(a => a.id).join(',')`. Compare old vs new. If equal, skip the state update entirely. If different, proceed with the new array.

**Why over deep equality:** Deep equality on article objects is expensive and unnecessary. The ID sequence is the stable identifier — if the same articles appear in the same order, the user sees no change. Individual article mutations (e.g., updated description) are extremely rare during a background refresh of RSS feeds.

**Why over `useMemo` with custom comparator:** `useMemo` doesn't help here because the data comes from an async callback, not from props/state derivation. The comparison needs to happen at the point where state is set.

**Alternative considered — structural sharing (immer-style):** Would preserve references for unchanged items within the array. Overkill for this case — the whole-array reference is what triggers `useLazyList`'s reset. Per-item stability is handled by React's keyed reconciliation.

## Risks / Trade-offs

- **[Length heuristic false positive]** If a refresh removes one article and adds a different one (same length, different content), `useLazyList` won't reset. → This is actually desired: the user keeps their scroll position, and React's keyed reconciliation handles the individual card swap. Not a real risk.
- **[ID fingerprint cost]** `articles.map(a => a.id).join(',')` on every refresh is O(n). For typical feed sizes (50-200 articles), this is sub-millisecond. → Acceptable. If feeds grow to thousands, switch to a hash or compare only the first `visibleCount` IDs.
- **[Skipping setArticles may miss individual article updates]** If an article's content changes but its ID stays the same, the skip prevents the update from reaching the DOM. → RSS articles are immutable once published. The only mutations come from our own processing (stripHtml, extractLeadingImage), which happens before `applyFetchResult`. Not a practical concern.

## Context

The `deduplicateArticles()` function in `use-feed-data.ts` currently deduplicates by composing a key from `title + "|" + publishedAt.getTime()`. This catches exact same-title-same-timestamp duplicates but misses syndicated articles that share a URL with slightly different titles or timestamps.

The current call order is `dedup → sort`. The first article encountered wins, but encounter order depends on `Promise.all` resolution — essentially arbitrary.

## Goals / Non-Goals

**Goals:**
- Catch URL-identical duplicates across feeds
- Ensure the youngest (most recent) article always wins when duplicates are found
- Keep the implementation simple and O(n)

**Non-Goals:**
- URL normalization (query param stripping, fragment removal) — may lead to false positives since different query params can point to different content
- Fuzzy title matching or similarity scoring
- Configurable dedup strategies

## Decisions

### 1. Two independent Sets, OR'd in the filter condition

**Decision:** Maintain a `seenKeys` Set (title+date composite) and a `seenLinks` Set (raw URL). An article is a duplicate if either Set already contains its value.

**Why:** Keeps the two checks independent and composable. No interaction between the checks, no compound key gymnastics. Adding or removing a check later is a one-line change.

**Alternative considered:** Single composite key combining all three fields — rejected because it would require exact match on all fields simultaneously, defeating the purpose of OR-based detection.

### 2. Sort before dedup (not after)

**Decision:** Move `sortChronologically()` to run before `deduplicateArticles()` in `fetchAllFeeds()`. Keep the post-dedup sort call for explicitness (it becomes a no-op on an already-sorted array).

**Why:** When sorted newest-first, the first article encountered for any duplicate group is always the youngest. The existing first-wins filter logic then naturally keeps the most recent article without any Map/swap logic.

**Alternative considered:** Using a Map to track seen articles and replacing entries when a newer duplicate is found — works but adds complexity for no benefit when pre-sorting achieves the same result.

## Risks / Trade-offs

- **[Sort cost on non-duplicate feeds]** Pre-sorting adds O(n log n) even when no duplicates exist. → The array is small (typically <200 articles) and we were sorting anyway; the only change is doing it earlier. The redundant post-dedup sort is harmless.
- **[False positive on URL match]** A broken feed could reuse the same URL for different articles. → Accepted risk per user decision; not a concern with current connectors.

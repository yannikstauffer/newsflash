## Context

`useFeedData` manages a two-layer cache (IndexedDB → network). After the initial load, background refreshes call `applyFetchResult`, which unconditionally replaces the displayed article list. Separately, `isFeedEnabled` is a new function reference on every render of `useFeedPreferences` (it's a `useCallback` over the `store` object), so any sync-triggered update to `newsflash:feed-prefs` causes the fetch `useEffect` to re-run—going through the full "initial load" code path including `setLastRefreshedAt(null)` and re-filtering the IndexedDB cache with the strict `getFullyEnabledSources` predicate, which excludes any source with even one disabled feed.

## Goals / Non-Goals

**Goals:**
- Freeze the displayed feed after initial load; new articles only appear when the user explicitly requests them
- Eliminate the flicker without altering the initial load or manual pull-to-refresh experience
- Prevent sync-triggered `isFeedEnabled` reference changes from re-triggering the fetch effect

**Non-Goals:**
- Fixing the ordering-swap that occurs during the initial cached→network transition
- Changing pull-to-refresh semantics (still merges immediately)
- Any visual change to `FeedStatusRow`

## Decisions

### D1 — Pending buffer lives in `useFeedData`, not in the component

Alternatives considered: (a) lift pending state to `useFeedPage`; (b) keep it in a module-level variable alongside `feedCache`.

Chosen: keep it in `useFeedData` as `useState`. It belongs to the data layer, not the view layer. Module-level state would survive unmount/remount and could show stale pending counts.

### D2 — Deferred path activates only when the displayed list is non-empty

The condition `articlesRef.current.length > 0 && !forceUpdate` distinguishes background refreshes from initial loads. `forceUpdate=true` is passed only by manual `refresh()`, which must merge immediately (user explicitly asked for latest).

### D3 — Stable `isFeedEnabled` via ref in `useFeedPreferences`

`isFeedEnabled` is memoised with an empty dependency array; it reads from a `storeRef` that is kept current by a `useEffect`. This breaks the sync → preference update → fetch effect chain.

Alternatives: deep-equality comparison of the store object; removing `isFeedEnabled` from effect deps with a lint suppression comment in `useFeedData`. The ref pattern is cleaner because it keeps the lint rules clean in `useFeedData` and centralises the stability concern in `useFeedPreferences`.

### D4 — Button rendered inside `FeedList`, above the article list

The button is a plain inline element (not fixed/sticky). It is the first child of the article list container so it scrolls with the content. As articles are hidden/bookmarked the list shrinks and the button rises into the viewport naturally.

Alternatives considered: a toast / snackbar (too intrusive, obscures content), a sticky banner (always visible, disrupts reading), a `FeedStatusRow` change (status row is below the filter bar, would not be visible when scrolled down). An inline top-of-list button matches the Twitter/LinkedIn pattern and requires no scroll management.

### D5 — Pending count = articles in pending buffer not already in the displayed set

`pendingCount` is derived from `pendingArticles.length` (all pending articles have already been deduplicated against the displayed list when they were placed in the buffer). No secondary tracking set needed.

## Risks / Trade-offs

- **Stale content risk:** Users who never notice the button will see increasingly stale articles. Mitigation: the button is prominently placed at top; as the feed empties through normal use it becomes visible.
- **Pending state persists across tab visibility changes:** If the user leaves and returns the pending buffer may hold many articles. Acceptable — the count shown on the button is accurate and clicking resolves it.
- **`isFeedEnabled` ref lag:** During the one-render window between the store updating and the `useEffect` syncing the ref, `isFeedEnabled` reads the previous store value. Acceptable: the ref is updated synchronously via `useEffect` which runs after the same paint, and the fetch effect (now stable) won't re-trigger anyway.

## Migration Plan

No data migration required. The change is purely additive React state. Existing `feedCache` module variable and IndexedDB schema are untouched. No feature flag needed.

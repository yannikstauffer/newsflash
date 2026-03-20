## Context

The app persists user state in localStorage via a generic `useLocalStorage<T>` hook, consumed by three domain hooks. Two of the stored arrays — hidden article IDs and read list articles — grow without bound. localStorage is capped at 5-10 MB depending on the browser; once full, writes silently fail (the catch block in `useLocalStorage` swallows the error).

The `useArticleState` hook currently prepends new entries to these arrays on write (`hideArticle`, `addToReadList`) without any size check.

## Goals / Non-Goals

**Goals:**
- Prevent localStorage quota exhaustion by capping the two unbounded arrays
- Prune oldest entries automatically on write with zero user-facing impact
- Keep the change minimal: no new dependencies, no async refactoring, no public API changes

**Non-Goals:**
- Migrating away from localStorage (future consideration)
- Adding user-visible UI for storage management or limits
- Pruning the fixed-size keys (`newsflash:theme`, `newsflash:feed-prefs`)
- Making limits user-configurable

## Decisions

### 1. Prune in the domain hook, not in `useLocalStorage`

**Decision:** Add pruning logic inside `useArticleState` (the domain hook), not in the generic `useLocalStorage<T>` hook.

**Rationale:** `useLocalStorage` is a generic key-value primitive used by multiple hooks. Adding array-length awareness there would leak domain concerns into a generic utility. The domain hook already knows the data shape and semantics (e.g., "newest first" ordering).

**Alternative considered:** A new `useLocalStorageWithLimit<T>` hook — rejected because it only benefits two call sites and adds unnecessary abstraction.

### 2. Drop oldest entries (FIFO)

**Decision:** When the array exceeds `maxItems` after an insert, truncate from the tail (oldest entries).

**Rationale:** Both arrays use newest-first ordering (prepend on add). Dropping the tail preserves the most recent user actions, which are the most relevant. Hidden IDs for very old articles are unlikely to appear in the feed again. Old read list entries are least likely to be revisited.

**Alternative considered:** LRU eviction — rejected because it would require tracking access timestamps, adding complexity for minimal benefit.

### 3. Limits: 500 hidden IDs, 200 read list articles

**Decision:** Cap `newsflash:hidden` at 500 entries and `newsflash:readlist` at 200 entries.

**Rationale:**
- Hidden IDs are lightweight strings (~30 bytes each). 500 IDs ≈ 15 KB — negligible.
- Read list articles are full objects (~500 bytes each). 200 articles ≈ 100 KB — well within budget.
- Combined worst case: ~115 KB, far below the 5 MB localStorage limit.
- 200 read list articles is generous for a news reader (most users save far fewer).

### 4. Extract limits as module-level constants

**Decision:** Define `MAX_HIDDEN_IDS = 500` and `MAX_READLIST_ITEMS = 200` as exported constants at the top of `use-article-state.ts`.

**Rationale:** Makes limits discoverable, testable, and easy to adjust. Exporting them lets tests reference the actual values instead of hardcoding magic numbers.

## Risks / Trade-offs

- **Silent data loss** → Acceptable trade-off. Users won't notice old hidden IDs being dropped (articles have likely scrolled out of the feed). Read list pruning is more visible but 200 items is generous. If needed later, a warning toast could be added.
- **No migration for existing oversized data** → On the first write after deployment, existing arrays larger than the limit will be pruned down. This is the desired behavior — no migration step needed.
- **Hardcoded limits** → If limits need tuning, it's a code change. Acceptable for now; making them configurable is a non-goal.

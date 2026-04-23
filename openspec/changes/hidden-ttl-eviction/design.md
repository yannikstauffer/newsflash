## Context

`useArticleState` stores hidden article IDs in `localStorage` under `newsflash:hidden` as a `string[]`. A `MAX_HIDDEN_IDS = 500` FIFO cap evicts the oldest ID on every hide once the list is full. The IndexedDB article cache retains articles for 14 days (`DEFAULT_MAX_AGE_DAYS = 14` in `src/lib/article-cache.ts`). A user who hides ~100 articles/day fills the cap in 5 days; hidden entries are then evicted while the corresponding articles are still served from cache, causing them to reappear.

The fix: replace the count cap with a 14-day time-based eviction window that mirrors the cache TTL, so a hide entry is only forgotten when the article itself can no longer appear.

## Goals / Non-Goals

**Goals:**
- Store a `hiddenAt` ISO-8601 timestamp alongside each hidden ID.
- Evict entries older than 14 days on every read (so `isHidden` is immediately correct) and on every write (to prevent unbounded storage growth across unmounts).
- Migrate existing `string[]` data transparently — stamp each legacy entry with the current time, preserving all hides.
- Keep the external return type of `useArticleState()` identical (`hiddenIds: string[]`).
- Export `HIDDEN_TTL_DAYS = 14` for documentation and future sharing with the cache layer.

**Non-Goals:**
- Changing any consumer of `hiddenIds` (`filter-articles.ts`, `feed-list.tsx`, `use-feed-page.ts`, sync layer).
- Adding a secondary count cap as a backstop.
- Modifying the read-list pruning logic (unchanged).
- Changing the Supabase sync schema or conflict-resolution strategy.

## Decisions

### D1 — Storage shape: `Array<{ id: string, hiddenAt: string }>` (not a Map or separate key)

**Chosen:** A single JSON array of `{ id, hiddenAt }` objects stored at the existing `newsflash:hidden` key.

**Rationale:** The Supabase sync layer serializes the entire localStorage value as JSON; switching to a Map or adding a parallel key would require sync-layer changes or risk split-brain on older clients. Keeping one key means the existing last-write-wins strategy continues to work unmodified. A plain array is also the simplest structure to migrate from `string[]` (map each string to an object).

**Alternative considered:** A separate `newsflash:hidden:timestamps` key. Rejected — two keys would desync under last-write-wins conflict resolution.

### D2 — Evict on read (not just on write)

**Chosen:** The `hiddenIds` memo and `hiddenSet` filter out expired entries before returning them, regardless of whether a write has occurred this session.

**Rationale:** Without read-side eviction, `isHidden("heise:old")` would return `true` for entries that are past their TTL until the next write. The test "evicts expired entries without any explicit write" asserts this requirement explicitly.

**Alternative considered:** Evict only on write. Rejected — stale `isHidden` results could cause already-expired articles to remain invisible past their TTL window.

### D3 — Migration: stamp legacy strings with current time, not epoch zero

**Chosen:** Legacy `string[]` entries are mapped to `{ id, hiddenAt: new Date().toISOString() }` — they receive a fresh 14-day window.

**Rationale:** We don't know when the articles were originally hidden. Stamping them as epoch zero (or any past date beyond 14 days) would immediately evict all existing hides on first render, which is a jarring UX regression. Giving them the current timestamp is conservative: at worst a hidden article stays hidden slightly longer than intended, which is preferable to it reappearing unexpectedly.

**Alternative considered:** Drop all legacy entries (treat unknown age as expired). Rejected — this would effectively unhide everything the user has hidden, which is confusing and unrecoverable.

### D4 — Source-prefix migration operates on `entry.id`, not raw strings

**Chosen:** The existing effect that strips entries without a colon (`hasSourcePrefix`) is kept but checks `entry.id` instead of the raw string value.

**Rationale:** Once the storage shape is `{ id, hiddenAt }[]`, iterating over raw strings would throw `TypeError: id.includes is not a function` (as seen in the failing tests). The migration logic is otherwise identical.

## Risks / Trade-offs

- **Storage growth**: Without a count cap, a very active user could accumulate many entries between sessions. The 14-day window bounds this: at ~100 hides/day the cap is ~1,400 entries ≈ ~100 KB of JSON — acceptable for localStorage.
- **Legacy device sync**: An older build on another device may push `string[]` back via Supabase. The migration path handles this on the next read. The last-write-wins strategy means whichever device wrote last wins; the reader always normalizes on load.
- **Clock skew**: If the user's system clock is significantly in the past, entries may persist longer than 14 days. This is an acceptable edge case with negligible impact.

## Migration Plan

1. On hook mount, read `newsflash:hidden` from localStorage.
2. If the value is a `string[]` (legacy), map each string to `{ id: string, hiddenAt: now }` and set `hiddenMigrated.current = true` to trigger a write-back in the migration effect.
3. If the array is already `{ id, hiddenAt }[]`, no migration needed (still run source-prefix migration if necessary).
4. The migration effect writes the normalized array back to localStorage on the next render — same pattern as the existing read-list migration.
5. No rollback needed: if a user downgrades to an older build, the old code reads `string[]` from storage, which it doesn't find (it finds `{ id, hiddenAt }[]`); the `JSON.parse` fallback to `[]` means the user temporarily loses their hides, but they are restored when they upgrade again (last-write-wins from the newer device).

## Open Questions

- None. Requirements are fully specified by the failing test suite in `use-article-state.test.ts`.

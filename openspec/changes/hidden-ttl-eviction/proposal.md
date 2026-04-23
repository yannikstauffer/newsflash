## Why

Hidden article IDs stored in `localStorage` under `newsflash:hidden` use a hard 500-item FIFO cap that a ~100-articles/day user exhausts in 5–10 days, causing recently-hidden articles to reappear while they are still present in the 14-day IndexedDB article cache. Aligning the hide-persistence window with the cache TTL eliminates the mismatch.

## What Changes

- Remove the `MAX_HIDDEN_IDS = 500` count cap and its export.
- Change the internal storage shape from `string[]` to `Array<{ id: string, hiddenAt: string }>` (ISO-8601 timestamp).
- Evict entries older than 14 days on every read and every write (hide / unhide / batch-hide / remove-by-source).
- Export `HIDDEN_TTL_DAYS = 14` from `use-article-state.ts` to document the window.
- Migrate legacy `string[]` data to the new shape on first read (stamp with current time; preserve all existing hides).
- Update the `removeHiddenBySource` and source-prefix migration logic to work on `entry.id` instead of raw strings.

## Capabilities

### New Capabilities

- `hidden-ttl-eviction`: Time-based eviction for hidden article IDs — replaces the count cap with a 14-day sliding window that mirrors the article cache lifetime.

### Modified Capabilities

- `feed/filtering`: The requirement for how long a hide is retained changes from "up to 500 entries (FIFO)" to "up to 14 days from the hide action".

## Impact

- **Modified file**: `src/features/article-actions/hooks/use-article-state.ts`
- **Modified file**: `src/features/article-actions/hooks/use-article-state.test.ts` (remove obsolete count-cap tests, add/keep TTL tests)
- **No change**: `filter-articles.ts`, `feed-list.tsx`, `use-feed-page.ts`, sync layer — external `hiddenIds: string[]` API is unchanged.
- **Sync**: The Supabase last-write-wins sync serializes whatever is in localStorage; pushing the new shape is safe. Pulling legacy `string[]` from an older device triggers the migration path.
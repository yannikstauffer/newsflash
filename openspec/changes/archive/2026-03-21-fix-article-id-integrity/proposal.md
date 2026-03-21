## Why

Three interrelated article ID issues undermine the correctness and performance of article state management:

1. **Broken `removeHiddenBySource`** (HIGH severity): The function filters hidden IDs using `id.startsWith(sourceId + ":")`, but `hideArticle` stores IDs produced by `hashString(link)` which are plain 32-bit hash strings with no source prefix. The prefix match never succeeds, so removing hidden articles by source is silently a no-op.
2. **O(n*m) lookup performance**: `isHidden` uses `Array.includes()` and `isInReadList` uses `Array.some()` per article during render. With 500 hidden IDs and hundreds of articles, this creates O(n*m) complexity on every render cycle.
3. **32-bit hash collision risk**: `hashString` produces 32-bit integers (converted to base-36), giving only ~4 billion possible values. With thousands of articles across sources, birthday-problem collisions become likely, causing articles to share IDs and produce incorrect hide/readlist behavior.

## What Changes

- **Fix article ID format** to include source prefix: `${sourceId}:${hash}`. This makes `removeHiddenBySource` functional and IDs more debuggable.
- **Upgrade hash function** from 32-bit DJB2 to a 53-bit hash (using the full safe integer range) to reduce collision probability by orders of magnitude.
- **Convert lookups to Set-based** using `useMemo` to create `Set<string>` from `hiddenIds` and `readListIds`, providing O(1) membership checks instead of O(n).
- **Migrate legacy localStorage data**: Existing IDs without the source prefix will be cleared on first load, since hidden/readlist state is non-critical ephemeral data.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `article-actions`: Article ID format changes from plain hash to `${sourceId}:${hash}`, affecting storage keys, lookup behavior, and source-based removal. Adds requirement for Set-based O(1) lookups and legacy data migration.

## Impact

- `src/features/connectors/base-parser.ts`: Hash function upgrade and ID format change (`hashString` signature changes to accept source parameter or ID assembly moves to callers)
- `src/features/article-actions/hooks/use-article-state.ts`: Set-based memoized lookups for `isHidden`/`isInReadList`, fix `removeHiddenBySource` to work with new prefix format, legacy migration logic
- `openspec/specs/article-actions/spec.md`: Existing spec updated with new ID format requirements
- localStorage keys `newsflash:hidden` and `newsflash:readlist`: Data format changes (migration clears legacy entries)

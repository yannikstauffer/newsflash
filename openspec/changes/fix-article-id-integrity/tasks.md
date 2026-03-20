## 1. Hash Function and ID Format

- [ ] 1.1 Replace `hashString` in `src/features/connectors/base-parser.ts` with a 53-bit hash function
- [ ] 1.2 Update `parseRssItems` to generate article IDs as `${source}:${hash}` instead of plain `hashString(link)`
- [ ] 1.3 Update `parseAtomEntries` to generate article IDs as `${source}:${hash}` instead of plain `hashString(link)`
- [ ] 1.4 Write unit tests for the new hash function verifying consistency and distinctness across sample URLs

## 2. Set-Based Lookups

- [ ] 2.1 Add `useMemo`-based `Set<string>` for `hiddenIds` in `use-article-state.ts`
- [ ] 2.2 Add `useMemo`-based `Set<string>` for read list IDs in `use-article-state.ts`
- [ ] 2.3 Refactor `isHidden` to use `Set.has()` instead of `Array.includes()`
- [ ] 2.4 Refactor `isInReadList` to use `Set.has()` instead of `Array.some()`

## 3. Legacy Data Migration

- [ ] 3.1 Add migration logic to detect and clear hidden IDs lacking a colon separator on first load
- [ ] 3.2 Add migration logic to detect and clear read list entries with IDs lacking a colon separator on first load
- [ ] 3.3 Write unit tests for migration logic covering mixed legacy/new ID scenarios

## 4. Integration Verification

- [ ] 4.1 Verify `removeHiddenBySource` correctly removes hidden IDs matching the source prefix
- [ ] 4.2 Verify `removeReadListBySource` continues to work with the new ID format
- [ ] 4.3 Run full lint and type-check (`npm run lint && npm run build`)
- [ ] 4.4 Run existing test suite (`npm run test`) and confirm no regressions

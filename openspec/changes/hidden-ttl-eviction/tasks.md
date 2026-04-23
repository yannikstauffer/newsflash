## 1. Update use-article-state.ts

- [ ] 1.1 Add `HiddenEntry` interface `{ id: string; hiddenAt: string }` and replace `useSyncedStorage<string[]>` with `useSyncedStorage<HiddenEntry[]>` for the hidden key
- [ ] 1.2 Export `HIDDEN_TTL_DAYS = 14` and remove `MAX_HIDDEN_IDS`; add `isExpired(entry: HiddenEntry, now: number): boolean` helper using `HIDDEN_TTL_DAYS`
- [ ] 1.3 Update migration `useEffect`: detect legacy `string[]` (check `typeof entry === "string"`) and map each to `{ id, hiddenAt: now.toISOString() }`; then filter out entries missing source prefix on `entry.id`; write back on `hiddenMigrated.current` guard
- [ ] 1.4 Update `hiddenIds` memo: filter `hiddenEntries` by `!isExpired(entry, Date.now())`, then map to `entry.id`
- [ ] 1.5 Update `hiddenSet` memo to derive from the filtered `hiddenIds` array (no change to structure, just source data)
- [ ] 1.6 Update `hideArticle`: inside the updater fn, filter expired entries, check duplicate by `entry.id`, then prepend `{ id: articleId, hiddenAt: new Date().toISOString() }`
- [ ] 1.7 Update `hideArticles`: filter expired, exclude already-present ids, prepend new `{ id, hiddenAt: now }` entries
- [ ] 1.8 Update `unhideArticle`: filter expired + filter by `entry.id !== articleId`
- [ ] 1.9 Update `unhideArticles`: filter expired + filter by `!idsToRemove.has(entry.id)`
- [ ] 1.10 Update `removeHiddenBySource`: filter expired + filter by `!entry.id.startsWith(sourceId + ":")`

## 2. Update use-article-state.test.ts

- [ ] 2.1 Remove the import of `MAX_HIDDEN_IDS` from the test file
- [ ] 2.2 Delete the entire `pruning constants` describe block (tests `exports MAX_HIDDEN_IDS as 500` etc.)
- [ ] 2.3 Delete the entire `hideArticle pruning` describe block (lines ~267–324: count-cap tests)
- [ ] 2.4 Update `removeHiddenBySource` tests that seed legacy `string[]` — they currently work because migration stamps current time; verify they still pass with the new shape, or update them to seed `HiddenEntry[]` directly
- [ ] 2.5 Update `Set-based lookups > isHidden` test — it seeds a legacy `string[]` which the migration will convert; assert the correct behaviour or seed `HiddenEntry[]` with current timestamp
- [ ] 2.6 Update `unhideArticles` tests — they seed legacy `string[]`; update seeds to `HiddenEntry[]` or verify migration path still satisfies assertions
- [ ] 2.7 Update `legacy data migration` tests — ensure the `"clears legacy hidden IDs without colon separator"` test seeds a mix of legacy strings and the hook correctly filters them via the updated migration
- [ ] 2.8 Verify all 8 tests in the `hideArticle time-based eviction (14-day window)` describe block now pass

## 3. Quality Gates

- [ ] 3.1 Run `npm run lint` and fix any issues
- [ ] 3.2 Run `npx tsc --noEmit` and fix any type errors
- [ ] 3.3 Run `npm run test` and fix any issues
- [ ] 3.4 Run `npm run test:e2e` and fix any issues
- [ ] 3.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [ ] 3.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

## 1. Export sync event utilities from useLocalStorage

- [x] 1.1 Export `LOCAL_STORAGE_SYNC_EVENT` constant and `LocalStorageSyncDetail` interface from `src/hooks/use-local-storage.ts`
- [x] 1.2 Create a `dispatchSyncEvent` export (or a new `dispatchLocalStorageSyncEvent` helper) so `sync-service.ts` can dispatch events without duplicating the CustomEvent logic
- [x] 1.3 Update existing tests in `use-local-storage.test.ts` if the refactor changes any internal behavior

## 2. Fix sync-to-React disconnect in performSync

- [x] 2.1 Import the sync event dispatcher in `src/features/sync/sync-service.ts`
- [x] 2.2 After `writeLocalData` in the "remote is newer" branch, dispatch `newsflash:local-storage-sync` with the correct `storageKey`
- [x] 2.3 Add unit tests in `sync-service.test.ts` verifying that the event is dispatched when remote data is pulled, and NOT dispatched when local wins or timestamps are equal

## 3. Remove staleness gate on mount

- [x] 3.1 In `src/features/sync/sync-context.tsx`, remove the `isSyncStale()` check from the mount effect so every authenticated mount triggers `doSync()`
- [x] 3.2 Update tests in `sync-context.test.tsx` to verify sync always fires on mount when authenticated, regardless of last-synced timestamp

## 4. Add debounced sync-on-write

- [x] 4.1 In `SyncProvider`, add a listener for `newsflash:local-storage-sync` events that checks if the modified key is in `SYNCED_KEYS`
- [x] 4.2 Implement a 5-second debounce timer that calls `doSync()` when it fires — reset on each qualifying write event
- [x] 4.3 Cancel the debounce timer when a manual sync is triggered (in `triggerSync`)
- [x] 4.4 Skip debounced sync when not authenticated (no `userId`)
- [x] 4.5 Clean up the debounce timer and event listener on unmount
- [x] 4.6 Add unit tests in `sync-context.test.tsx` verifying debounce behavior: single write triggers delayed sync, rapid writes collapse, unauthenticated skips, manual sync cancels pending debounce

## 5. Add filter preferences to sync

- [x] 5.1 Add `{ storageKey: "newsflash:filter-prefs", remoteKey: "filterprefs" }` to `SYNCED_KEYS` in `sync-service.ts`
- [x] 5.2 Add `"newsflash:filter-prefs"` case to `getDefaultForKey` returning `{}`
- [x] 5.3 In `src/features/feed-config/hooks/use-filter-preferences.ts`, switch from `useLocalStorage` to `useSyncedStorage`
- [x] 5.4 Update tests in `use-filter-preferences.test.ts` to account for the `useSyncedStorage` behavior (companion timestamp writes)
- [x] 5.5 Update `sync-service.test.ts` to verify `newsflash:filter-prefs` is included in sync cycles

## 6. Update integration tests

- [x] 6.1 Update `src/hooks/use-synced-storage-integration.test.ts` to cover the new event dispatch behavior (sync pull triggers React re-render)
- [x] 6.2 Add an integration test verifying the debounced sync-on-write flow end-to-end

## 7. Quality Gates

- [x] 7.1 Run `npm run lint` and fix any issues
- [x] 7.2 Run `npx tsc --noEmit` and fix any type errors
- [x] 7.3 Run `npm run test` and fix any issues
- [x] 7.4 Run `npm run test:e2e` and fix any issues
- [x] 7.5 Run `mcp__jetbrains__get_file_problems` on all created/changed files and fix genuine issues
- [x] 7.6 Check whether anything learned should update `docs/` or `README.md` and apply changes if needed

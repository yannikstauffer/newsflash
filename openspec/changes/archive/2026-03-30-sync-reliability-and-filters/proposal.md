## Why

The settings sync feature has three reliability bugs that cause data loss across devices: (1) `performSync` writes to localStorage but never dispatches the `newsflash:local-storage-sync` CustomEvent, so React hooks never re-render with synced data; (2) local changes (hiding articles, toggling filters) never trigger a sync push — data sits in localStorage until a stale auto-sync or manual sync; (3) the 5-minute staleness gate prevents page refreshes from pulling latest remote data. Additionally, filter preferences (`newsflash:filter-prefs`) are not synced at all despite being a user preference that should roam across devices.

## What Changes

- Fix sync-to-React disconnect: `performSync` dispatches `newsflash:local-storage-sync` events after writing remote data to localStorage, so React hooks re-render immediately
- Add debounced sync-on-write: when any synced key is modified locally, queue a sync cycle after a 5-second debounce delay so rapid actions batch into one push
- Always sync on page load: remove the 5-minute staleness gate for auto-sync on mount — every page load/refresh triggers a sync cycle when authenticated
- Add filter preferences to sync: switch `useFilterPreferences` from `useLocalStorage` to `useSyncedStorage` and add `newsflash:filter-prefs` to `SYNCED_KEYS`

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `settings-sync`: Add filter preferences as a synced key, require sync-on-write with 5s debounce, require always-sync-on-mount (remove staleness gate), require sync engine to notify React layer after pulling remote data

## Impact

- `src/features/sync/sync-service.ts` — Add filter-prefs to `SYNCED_KEYS`, dispatch sync events after `writeLocalData`
- `src/features/sync/sync-context.tsx` — Remove staleness gate on mount, add debounced sync-on-write mechanism
- `src/features/feed-config/hooks/use-filter-preferences.ts` — Switch from `useLocalStorage` to `useSyncedStorage`
- `src/hooks/use-local-storage.ts` — Export the `LOCAL_STORAGE_SYNC_EVENT` constant and `LocalStorageSyncDetail` interface for use in sync-service
- `openspec/specs/settings-sync/spec.md` — Spec updates for new requirements
- Existing tests for sync-service, sync-context, use-filter-preferences, and use-synced-storage-integration will need updates
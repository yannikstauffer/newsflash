## Context

The settings sync feature uses a `SYNCED_KEYS` registry in `sync-service.ts` to sync localStorage keys to Supabase via last-write-wins conflict resolution. The sync cycle runs on app mount (if stale > 5 min) or via manual "Sync Now" button. Three bugs cause data loss across devices, and filter preferences are not synced.

Current architecture:
- `useLocalStorage` manages React state and dispatches `newsflash:local-storage-sync` CustomEvents on writes
- `useSyncedStorage` wraps `useLocalStorage` and adds `<key>:updated_at` timestamps
- `performSync` reads/writes localStorage directly via `readLocalData`/`writeLocalData` — bypassing React entirely
- `SyncProvider` in `sync-context.tsx` controls when sync cycles run

## Goals / Non-Goals

**Goals:**
- Sync pulls latest remote data on every page load/refresh (no staleness gate)
- Local changes to synced keys trigger a push to Supabase within 5 seconds (debounced)
- React UI updates immediately when sync pulls remote data
- Filter preferences (`newsflash:filter-prefs`) sync across devices

**Non-Goals:**
- Real-time sync via Supabase Realtime channels (overkill for this app)
- Merge conflict resolution (last-write-wins is sufficient)
- Syncing theme preference (remains local-only by design)
- Changing the Supabase schema or RLS policies

## Decisions

### 1. Dispatch sync events from `writeLocalData`

After `performSync` writes remote data to localStorage, it dispatches the `newsflash:local-storage-sync` CustomEvent for each key that was updated. This reuses the existing event mechanism in `useLocalStorage` — no new subscription system needed.

**Alternative considered**: Having `performSync` call `useSyncedStorage` setters directly. Rejected because `performSync` is not a React hook — it runs outside the component tree. The CustomEvent approach works from any context.

**Implementation**: Export `LOCAL_STORAGE_SYNC_EVENT` constant and `LocalStorageSyncDetail` interface from `use-local-storage.ts`. Import in `sync-service.ts` and dispatch after each `writeLocalData` call in the "remote is newer" branch.

### 2. Debounced sync-on-write via `SyncProvider`

The `SyncProvider` exposes the sync trigger. The debounce mechanism lives in `sync-context.tsx` — a 5-second debounce timer resets on each synced-key write. This keeps the debounce logic centralized rather than spread across individual hooks.

**Mechanism**: Listen for `newsflash:local-storage-sync` events in `SyncProvider`. When a synced key is modified, reset a 5-second debounce timer. When the timer fires, call `doSync()`. The debounce collapses rapid actions (e.g., hiding 5 articles) into one sync cycle.

**Alternative considered**: Debounce in `useSyncedStorage` hook. Rejected because the hook doesn't have access to the Supabase client or user ID — the sync trigger belongs in the provider.

### 3. Always sync on mount

Remove the `isSyncStale()` check from the mount effect in `sync-context.tsx`. Every mount with an authenticated user triggers a sync cycle. The `isSyncStale()` function remains available for other uses but is no longer the gate for auto-sync.

**Trade-off**: More Supabase requests on rapid page refreshes. Acceptable because sync is lightweight (one SELECT query + conditional upserts per key) and the app is not high-traffic.

### 4. Add filter preferences as a synced key

Add `{ storageKey: "newsflash:filter-prefs", remoteKey: "filterprefs" }` to `SYNCED_KEYS`. Switch `useFilterPreferences` from `useLocalStorage` to `useSyncedStorage` so writes get companion `updated_at` timestamps. Same last-write-wins strategy as other keys — no special merge logic.

**Default for first sync**: `{}` (empty object), matching the current `useFilterPreferences` default.

## Risks / Trade-offs

- **[Increased Supabase calls]** Always syncing on mount and on every write (debounced) increases API usage. Mitigated by the 5s debounce and the fact that sync is a single query + conditional upserts per key.
- **[Race condition on rapid cross-device edits]** Two devices editing within the 5s debounce window could still lose writes. Mitigated by last-write-wins — this is the accepted conflict strategy and the window is small.
- **[Event dispatch ordering]** `writeLocalData` + event dispatch is not atomic. If the event fires before localStorage is written, the hook reads stale data. Mitigated by dispatching AFTER the `setItem` call, which is synchronous.

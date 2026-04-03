## ADDED Requirements

### Requirement: Filter preferences are synced
The sync engine SHALL sync the `newsflash:filter-prefs` localStorage key to Supabase with remote key `filterprefs`. The default value for first sync SHALL be `{}` (empty object).

#### Scenario: Filter preferences are included in sync cycle
- **WHEN** a sync cycle runs
- **THEN** the `newsflash:filter-prefs` key SHALL be included in the sync

#### Scenario: Filter toggle persists across devices
- **WHEN** a user disables a connector filter on device A and a sync cycle completes on both devices
- **THEN** device B SHALL reflect the disabled filter state

### Requirement: Sync notifies React layer after pulling remote data
After `performSync` writes remote data to localStorage, the sync engine SHALL dispatch a `newsflash:local-storage-sync` CustomEvent for each key that was updated from remote. This SHALL cause React hooks using `useLocalStorage` or `useSyncedStorage` to re-render with the new data.

#### Scenario: React state updates after sync pull
- **WHEN** a sync cycle pulls newer remote data for `newsflash:hidden`
- **THEN** a `newsflash:local-storage-sync` event SHALL be dispatched with `detail.key` set to `newsflash:hidden`
- **AND** any component using `useSyncedStorage("newsflash:hidden", [])` SHALL re-render with the remote data

#### Scenario: No event dispatched when local wins
- **WHEN** a sync cycle determines that local data is newer for a key
- **THEN** no `newsflash:local-storage-sync` event SHALL be dispatched for that key (local React state is already correct)

#### Scenario: No event dispatched when timestamps are equal
- **WHEN** a sync cycle determines that local and remote timestamps are equal for a key
- **THEN** no `newsflash:local-storage-sync` event SHALL be dispatched for that key

### Requirement: Debounced sync-on-write
When any synced localStorage key is modified locally, the sync engine SHALL queue a sync cycle after a 5-second debounce delay. Multiple writes within the 5-second window SHALL collapse into a single sync cycle.

#### Scenario: Single write triggers delayed sync
- **WHEN** a user hides an article (modifying `newsflash:hidden`)
- **THEN** a sync cycle SHALL execute approximately 5 seconds after the write

#### Scenario: Rapid writes are debounced
- **WHEN** a user hides 5 articles within 2 seconds
- **THEN** only one sync cycle SHALL execute, approximately 5 seconds after the last write

#### Scenario: Debounced sync only fires when authenticated
- **WHEN** a synced key is modified and the user is not authenticated
- **THEN** no debounced sync cycle SHALL be queued

#### Scenario: Manual sync resets debounce timer
- **WHEN** a user clicks "Sync Now" while a debounced sync is pending
- **THEN** the pending debounced sync SHALL be cancelled (the manual sync covers it)

## MODIFIED Requirements

### Requirement: Automatic sync on app open with staleness check
When the application mounts and the user is authenticated, the sync engine SHALL trigger a sync cycle. The staleness check SHALL NOT gate the initial sync — every page load or refresh SHALL sync when the user is authenticated.

#### Scenario: Page load always triggers sync when authenticated
- **WHEN** the app mounts and the user is authenticated
- **THEN** a sync cycle SHALL be triggered regardless of when the last sync occurred

#### Scenario: Unauthenticated user skips sync
- **WHEN** the app mounts and the user is not authenticated
- **THEN** no sync SHALL occur and the app SHALL use localStorage data as-is

### Requirement: Synced storage keys
The sync engine SHALL sync the following localStorage keys to Supabase: `newsflash:hidden`, `newsflash:readlist`, `newsflash:feed-prefs`, and `newsflash:filter-prefs`. The key `newsflash:theme` SHALL NOT be synced.

#### Scenario: Hidden articles are synced
- **WHEN** a sync cycle runs
- **THEN** the `newsflash:hidden` key SHALL be included in the sync

#### Scenario: Read list is synced
- **WHEN** a sync cycle runs
- **THEN** the `newsflash:readlist` key SHALL be included in the sync

#### Scenario: Feed preferences are synced
- **WHEN** a sync cycle runs
- **THEN** the `newsflash:feed-prefs` key SHALL be included in the sync

#### Scenario: Filter preferences are synced
- **WHEN** a sync cycle runs
- **THEN** the `newsflash:filter-prefs` key SHALL be included in the sync

#### Scenario: Theme is not synced
- **WHEN** a sync cycle runs
- **THEN** the `newsflash:theme` key SHALL NOT be included in the sync

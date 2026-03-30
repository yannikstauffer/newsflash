## ADDED Requirements

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

### Requirement: Automatic sync on app open with staleness check
When the application mounts and the user is authenticated, the sync engine SHALL trigger a sync cycle. The staleness check SHALL NOT gate the initial sync — every page load or refresh SHALL sync when the user is authenticated.

#### Scenario: Page load always triggers sync when authenticated
- **WHEN** the app mounts and the user is authenticated
- **THEN** a sync cycle SHALL be triggered regardless of when the last sync occurred

#### Scenario: Unauthenticated user skips sync
- **WHEN** the app mounts and the user is not authenticated
- **THEN** no sync SHALL occur and the app SHALL use localStorage data as-is

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

### Requirement: Manual sync via settings
The user SHALL be able to trigger a sync manually via a "Sync Now" button on the settings page. Manual sync SHALL always execute regardless of the staleness check.

#### Scenario: Manual sync ignores staleness
- **WHEN** the user clicks "Sync Now" and the last sync was less than 5 minutes ago
- **THEN** a sync cycle SHALL execute regardless

#### Scenario: Manual sync while not authenticated
- **WHEN** the user is not authenticated
- **THEN** the "Sync Now" button SHALL NOT be displayed

### Requirement: First login seeds remote from local
When an authenticated user syncs for the first time (no remote data exists for their user ID), the sync engine SHALL push all local data to Supabase. Local state becomes the initial remote state.

#### Scenario: First sync with existing local data
- **WHEN** a user authenticates for the first time and has local data (hidden articles, read list, feed preferences)
- **THEN** all local data SHALL be pushed to Supabase as the initial remote state

#### Scenario: First sync with empty local data
- **WHEN** a user authenticates for the first time and has no local data
- **THEN** empty/default values SHALL be pushed to Supabase

### Requirement: Returning device pulls remote
When an authenticated user syncs from a new device (remote data exists but local has no sync history), the sync engine SHALL overwrite local data with remote data. Remote wins on new devices.

#### Scenario: New device receives remote data
- **WHEN** a user signs in on a new device and remote data exists
- **THEN** remote data SHALL overwrite local data for all synced keys

### Requirement: Ongoing sync uses last-write-wins
For ongoing sync cycles on an already-synced device, the sync engine SHALL compare local and remote `updated_at` timestamps per key. The newer version wins entirely (full-state replacement, not merge).

#### Scenario: Local is newer than remote
- **WHEN** the local `updated_at` for a key is more recent than the remote `updated_at`
- **THEN** local data SHALL be pushed to remote, overwriting the remote value

#### Scenario: Remote is newer than local
- **WHEN** the remote `updated_at` for a key is more recent than the local `updated_at`
- **THEN** remote data SHALL be pulled to local, overwriting the local value

#### Scenario: Timestamps are equal
- **WHEN** the local and remote `updated_at` for a key are identical
- **THEN** no data transfer SHALL occur for that key

### Requirement: Local updated_at tracking
Each synced localStorage key SHALL have a companion `<key>:updated_at` entry in localStorage that records the ISO 8601 timestamp of the last local modification. This timestamp SHALL be updated whenever the key's value changes.

#### Scenario: Modifying a synced key updates its timestamp
- **WHEN** the user hides an article (modifying `newsflash:hidden`)
- **THEN** `newsflash:hidden:updated_at` SHALL be set to the current ISO 8601 timestamp

#### Scenario: Non-synced key has no companion timestamp
- **WHEN** the user changes the theme (modifying `newsflash:theme`)
- **THEN** no `newsflash:theme:updated_at` entry SHALL be created

### Requirement: Last synced timestamp
After a successful sync cycle, the sync engine SHALL write the current ISO 8601 timestamp to `newsflash:last-synced` in localStorage.

#### Scenario: Successful sync updates last-synced
- **WHEN** a sync cycle completes successfully
- **THEN** `newsflash:last-synced` SHALL be set to the current timestamp

#### Scenario: Failed sync does not update last-synced
- **WHEN** a sync cycle fails (network error, API error)
- **THEN** `newsflash:last-synced` SHALL NOT be updated

### Requirement: Offline resilience
The application SHALL function identically when offline or unauthenticated. All localStorage reads and writes SHALL work without the sync layer. Sync failures SHALL be silently ignored (no error toasts or blocking UI).

#### Scenario: App works offline
- **WHEN** the device has no network connectivity
- **THEN** the app SHALL function normally using localStorage data

#### Scenario: Sync failure is non-blocking
- **WHEN** a sync cycle fails due to network or API error
- **THEN** the app SHALL continue functioning and the sync status SHALL transition to ERROR then back to IDLE

### Requirement: Supabase schema with row-level security
The `user_settings` table SHALL use a composite primary key of `(user_id, key)` and enforce row-level security so each user can only read and write their own rows.

#### Scenario: User cannot read other users' data
- **WHEN** a user queries the `user_settings` table
- **THEN** only rows matching their `auth.uid()` SHALL be returned

#### Scenario: User cannot write to other users' data
- **WHEN** a user attempts to insert or update a row with a different `user_id`
- **THEN** the operation SHALL be denied by row-level security

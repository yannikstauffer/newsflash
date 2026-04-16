## ADDED Requirements

### Requirement: Unified feed status row combines refresh and sync timestamps
The feed page SHALL render a single status row between the filter bar and the feed list that displays both the last-refreshed and last-synced timestamps in one line.

#### Scenario: Both timestamps available
- **WHEN** both `lastRefreshedAt` and `lastSyncedAt` have values
- **THEN** the status row SHALL display "Refreshed {relative time} · Synced {relative time}"

#### Scenario: Only refresh timestamp available
- **WHEN** `lastRefreshedAt` has a value but `lastSyncedAt` is null
- **THEN** the status row SHALL display only "Refreshed {relative time}"

#### Scenario: Only sync timestamp available
- **WHEN** `lastSyncedAt` has a value but `lastRefreshedAt` is null
- **THEN** the status row SHALL display only "Synced {relative time}"

#### Scenario: Neither timestamp available
- **WHEN** both `lastRefreshedAt` and `lastSyncedAt` are null
- **THEN** the status row SHALL render its reserved-height container with no visible text

### Requirement: Status row reserves fixed layout height
The status row container SHALL always occupy a fixed minimum height in the layout regardless of whether timestamp text is currently displayed. This prevents layout shifts when timestamps appear or disappear asynchronously.

#### Scenario: Empty status row occupies space
- **WHEN** the feed page renders with no timestamps available yet
- **THEN** the status row container SHALL occupy its minimum height and the feed list position SHALL NOT change when timestamps later appear

#### Scenario: Status row height is stable across state transitions
- **WHEN** timestamps transition between null and non-null values during background refreshes
- **THEN** the feed list SHALL NOT shift vertically at any point during the transition

### Requirement: Sync timestamp mirrors to localStorage for synchronous read
The sync service SHALL write `lastSyncedAt` to localStorage (in addition to IndexedDB) whenever it updates. A synchronous read function SHALL be available to retrieve this cached value.

#### Scenario: setLastSyncedAt writes to both stores
- **WHEN** `setLastSyncedAt` is called with a timestamp
- **THEN** the timestamp SHALL be written to both IndexedDB and localStorage

#### Scenario: Synchronous read returns cached value
- **WHEN** `getLastSyncedAtSync()` is called
- **THEN** it SHALL return the last value written to localStorage, parsed as a Date, or null if no value exists

#### Scenario: localStorage unavailable falls back gracefully
- **WHEN** localStorage is not available (e.g., private browsing restrictions)
- **THEN** `getLastSyncedAtSync()` SHALL return null without throwing
- **AND** `setLastSyncedAt` SHALL still write to IndexedDB without error

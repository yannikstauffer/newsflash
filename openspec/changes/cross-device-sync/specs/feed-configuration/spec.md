## MODIFIED Requirements

### Requirement: Feed preferences persist in localStorage
Enabled/disabled state for each feed SHALL be stored in localStorage and restored on page load. When the user is authenticated and sync is enabled, feed preferences SHALL participate in cross-device sync via the `useSyncedStorage` hook. The `useFeedPreferences` hook SHALL use `useSyncedStorage` instead of `useLocalStorage` for the `newsflash:feed-prefs` key.

#### Scenario: Disabled feed stays disabled after refresh
- **WHEN** the user disables a feed and refreshes the page
- **THEN** the feed SHALL remain disabled

#### Scenario: Preferences survive across sessions
- **WHEN** the user closes and reopens the browser
- **THEN** feed preferences SHALL be restored from localStorage

#### Scenario: Feed preferences sync to remote
- **WHEN** the user modifies feed preferences and a sync cycle runs
- **THEN** the updated feed preferences SHALL be pushed to Supabase if they are newer than the remote version

#### Scenario: Feed preferences pulled from remote
- **WHEN** a sync cycle detects newer remote feed preferences
- **THEN** the local feed preferences SHALL be overwritten with the remote version

#### Scenario: Feed preferences work without authentication
- **WHEN** the user is not authenticated
- **THEN** feed preferences SHALL work identically to the current behavior (localStorage only)

## ADDED Requirements

### Requirement: Sync status state machine
The sync status SHALL follow a state machine with four states: IDLE, SYNCING, SUCCESS, and ERROR. Transitions SHALL be: IDLE → SYNCING (on sync trigger), SYNCING → SUCCESS (on completion), SYNCING → ERROR (on failure), SUCCESS → IDLE (after 3-second timeout), ERROR → IDLE (after 3-second timeout).

#### Scenario: Successful sync cycle
- **WHEN** a sync is triggered and completes successfully
- **THEN** the status SHALL transition IDLE → SYNCING → SUCCESS → IDLE (after 3s)

#### Scenario: Failed sync cycle
- **WHEN** a sync is triggered and fails
- **THEN** the status SHALL transition IDLE → SYNCING → ERROR → IDLE (after 3s)

#### Scenario: Cannot trigger sync while syncing
- **WHEN** the sync status is SYNCING and another sync is requested
- **THEN** the new sync request SHALL be ignored

### Requirement: Settings nav icon reflects sync status
The settings navigation item icon SHALL change based on sync status: cog icon when IDLE, animated spinner when SYNCING, checkmark icon when SUCCESS. The icon SHALL return to cog after the 3-second SUCCESS timeout.

#### Scenario: Idle state shows cog
- **WHEN** the sync status is IDLE
- **THEN** the settings nav icon SHALL display a cog/gear icon

#### Scenario: Syncing state shows spinner
- **WHEN** the sync status is SYNCING
- **THEN** the settings nav icon SHALL display an animated spinner

#### Scenario: Success state shows checkmark
- **WHEN** the sync status is SUCCESS
- **THEN** the settings nav icon SHALL display a checkmark icon

#### Scenario: Checkmark returns to cog after 3 seconds
- **WHEN** the sync status transitions to SUCCESS
- **THEN** the icon SHALL display a checkmark for 3 seconds, then return to the cog icon

#### Scenario: Unauthenticated user always sees cog
- **WHEN** the user is not authenticated
- **THEN** the settings nav icon SHALL always display a cog icon (no sync animation)

### Requirement: Settings page sync section for authenticated users
When the user is authenticated, the settings page SHALL display a sync section containing: the signed-in email address, a "Last synced: X ago" timestamp, and a "Sync Now" button.

#### Scenario: Sync section shows email
- **WHEN** the user is authenticated as "user@example.com"
- **THEN** the sync section SHALL display "Signed in as user@example.com"

#### Scenario: Last synced display
- **WHEN** the user is authenticated and has synced before
- **THEN** the sync section SHALL display a relative timestamp (e.g., "Last synced: 2 minutes ago")

#### Scenario: Never synced display
- **WHEN** the user is authenticated but has never synced
- **THEN** the sync section SHALL display "Never synced" or equivalent

#### Scenario: Sync Now button states
- **WHEN** the sync status is IDLE
- **THEN** the button SHALL display "Sync Now" and be enabled
- **WHEN** the sync status is SYNCING
- **THEN** the button SHALL display "Syncing..." with a spinner and be disabled
- **WHEN** the sync status is SUCCESS
- **THEN** the button SHALL display "Synced" with a checkmark for 3 seconds

### Requirement: Settings page auth section for unauthenticated users
When the user is not authenticated, the settings page SHALL display an auth section with an email input field and a "Send magic link" button. A brief explanation of what sync provides SHALL be shown.

#### Scenario: Auth section rendering
- **WHEN** the user is not authenticated
- **THEN** the settings page SHALL display an email input, a "Send magic link" button, and a brief description of sync functionality

#### Scenario: Magic link sent confirmation
- **WHEN** the user submits their email
- **THEN** the auth section SHALL display a confirmation message instructing the user to check their email

#### Scenario: Sign out button
- **WHEN** the user is authenticated
- **THEN** a "Sign Out" button SHALL be displayed in the sync section

### Requirement: Settings page shows sync spinner
When a sync is in progress and the settings page is open, the sync section SHALL display a spinner indicator alongside the disabled "Sync Now" button.

#### Scenario: Spinner visible during sync on settings page
- **WHEN** the settings page is open and a sync is in progress
- **THEN** a spinner SHALL be visible in the sync section

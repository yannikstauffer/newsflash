## MODIFIED Requirements

### Requirement: Article states persist in localStorage
Hidden article IDs and Read List article IDs SHALL be persisted in localStorage so they survive page refreshes. Article IDs SHALL use the `${sourceId}:${hash}` format. On first load after upgrade, legacy IDs without the source prefix SHALL be cleared. When the user is authenticated and sync is enabled, both hidden articles and the read list SHALL participate in cross-device sync via the `useSyncedStorage` hook. The `useArticleState` hook SHALL use `useSyncedStorage` instead of `useLocalStorage` for the `newsflash:hidden` and `newsflash:readlist` keys.

#### Scenario: Hidden state persists
- **WHEN** the user hides an article and refreshes the page
- **THEN** the article SHALL still be hidden

#### Scenario: Read List persists
- **WHEN** the user saves an article and refreshes the page
- **THEN** the article SHALL still appear in the Read List

#### Scenario: Legacy data is cleared on upgrade
- **WHEN** the user loads the application for the first time after the ID format upgrade
- **THEN** legacy hidden IDs and read list entries without source prefix SHALL be cleared

#### Scenario: Hidden articles sync to remote
- **WHEN** the user hides articles and a sync cycle runs
- **THEN** the updated hidden list SHALL be pushed to Supabase if it is newer than the remote version

#### Scenario: Hidden articles pulled from remote
- **WHEN** a sync cycle detects a newer remote hidden list
- **THEN** the local hidden list SHALL be overwritten with the remote version

#### Scenario: Read list syncs to remote
- **WHEN** the user modifies the read list and a sync cycle runs
- **THEN** the updated read list SHALL be pushed to Supabase if it is newer than the remote version

#### Scenario: Read list pulled from remote
- **WHEN** a sync cycle detects a newer remote read list
- **THEN** the local read list SHALL be overwritten with the remote version

#### Scenario: Article state works without authentication
- **WHEN** the user is not authenticated
- **THEN** hidden articles and the read list SHALL work identically to the current behavior (localStorage only)

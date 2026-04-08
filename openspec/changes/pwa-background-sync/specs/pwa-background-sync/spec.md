## ADDED Requirements

### Requirement: Periodic background sync pre-warms the article cache

The service worker SHALL handle `periodicsync` events with tag `feed-refresh` by fetching all feeds via the shared feed pipeline and writing results to the IndexedDB article cache.

#### Scenario: Background sync fetches and caches articles

- **WHEN** the browser triggers a `periodicsync` event with tag `feed-refresh`
- **THEN** the service worker SHALL call `fetchAndParseAllFeeds` with all feed IDs, then call `articleCache.upsertMany()` with the results

#### Scenario: Background sync updates last-synced timestamp

- **WHEN** a background sync completes successfully
- **THEN** the service worker SHALL write the current timestamp to IDB under a `last-synced` key

#### Scenario: Background sync failure does not crash the SW

- **WHEN** the background sync encounters an error (network failure, parse error)
- **THEN** the service worker SHALL catch the error and log it — the SW SHALL not enter a failed state

### Requirement: Periodic sync registration gated by installation

The app SHALL register for periodic background sync only when running as an installed PWA and the browser supports the API.

#### Scenario: Register after install on supported browser

- **WHEN** the app detects standalone mode and `navigator.periodicSync` is available
- **THEN** it SHALL register a periodic sync with tag `feed-refresh` and `minInterval` of 4 hours

#### Scenario: Skip registration on unsupported browser

- **WHEN** `navigator.periodicSync` is not available (Safari, Firefox, non-installed context)
- **THEN** no registration attempt SHALL be made and no error SHALL be shown

#### Scenario: Skip registration when not installed

- **WHEN** the app is running in a browser tab (not standalone)
- **THEN** periodic sync SHALL not be registered

### Requirement: Last-synced indicator displays background sync freshness

The app SHALL display a "last synced" timestamp indicating when the most recent background sync completed.

#### Scenario: Background sync occurred

- **WHEN** the IDB contains a `last-synced` timestamp
- **THEN** the indicator SHALL display relative time (e.g., "Synced 2 hours ago")

#### Scenario: No background sync occurred

- **WHEN** no `last-synced` timestamp exists in IDB
- **THEN** the indicator SHALL not be displayed (falls back to the existing "last refreshed" display from manual fetch)

### Requirement: Migration from generateSW to injectManifest

The service worker configuration SHALL migrate from `generateSW` mode to `injectManifest` mode to support custom service worker logic.

#### Scenario: Precaching continues to work

- **WHEN** the app is built with `injectManifest` mode
- **THEN** all previously precached assets (HTML, JS, CSS, fonts, icons) SHALL still be precached via `self.__WB_MANIFEST`

#### Scenario: Runtime caching rules preserved

- **WHEN** the service worker processes feed API or image requests
- **THEN** the same caching strategies from Step 3 (NetworkFirst for feeds, CacheFirst for images) SHALL apply

#### Scenario: Auto-update behavior preserved

- **WHEN** a new service worker is deployed
- **THEN** it SHALL auto-update without user prompt (same behavior as `generateSW` mode)

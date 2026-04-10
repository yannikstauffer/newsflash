## ADDED Requirements

### Requirement: Feed API responses are cached by the service worker

The service worker SHALL cache responses from `/api/rss/*` using a NetworkFirst strategy with a 5-second network timeout. When the network is unavailable or slow, the cached response SHALL be served.

#### Scenario: Online request caches the response

- **WHEN** a feed request to `/api/rss/engadget` succeeds
- **THEN** the service worker SHALL cache the response for future offline use

#### Scenario: Offline request serves cached feed

- **WHEN** the user is offline and a feed request is made for a previously cached feed
- **THEN** the service worker SHALL serve the cached XML response

#### Scenario: Network timeout falls back to cache

- **WHEN** a feed request takes longer than 5 seconds
- **THEN** the service worker SHALL serve the cached response (if available) instead of waiting

#### Scenario: Cache expiration

- **WHEN** a cached feed response is older than 3 days
- **THEN** the service worker SHALL evict it from the cache
- **AND** the cache SHALL hold a maximum of 50 entries

### Requirement: Feed errors are suppressed when cached data is available

The feed data hook SHALL suppress network errors when the IndexedDB cache has already provided articles. Errors SHALL only be surfaced when no cached articles are available.

#### Scenario: Network fails but IDB has articles

- **WHEN** the background network fetch fails and IDB-cached articles are currently displayed
- **THEN** the error SHALL be logged to `console.error` but NOT added to the visible `errors` array

#### Scenario: Network fails and IDB is empty

- **WHEN** the network fetch fails and no IDB-cached articles exist
- **THEN** the error SHALL be surfaced in the `errors` array as before

### Requirement: Pull-to-refresh provides offline feedback

When the user triggers pull-to-refresh while offline, the app SHALL show a brief toast message indicating offline status instead of attempting a network fetch.

#### Scenario: Pull-to-refresh while offline

- **WHEN** the user pulls to refresh and `navigator.onLine` is `false`
- **THEN** a toast SHALL appear with text like "You're offline" and no network request SHALL be made

#### Scenario: Pull-to-refresh while online

- **WHEN** the user pulls to refresh and `navigator.onLine` is `true`
- **THEN** the normal refresh behavior SHALL proceed

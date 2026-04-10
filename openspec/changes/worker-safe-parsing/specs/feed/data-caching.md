## MODIFIED Requirements

### Requirement: Feed data is cached in memory across tab switches
The feed SHALL cache fetched articles in memory so that navigating away from the feed tab and returning does not trigger a re-fetch. Cached data SHALL persist for the lifetime of the browser session (until full page reload). When articles are loaded from IndexedDB, any articles whose `processed` field is not strictly `true` SHALL be processed (HTML stripped, leading images extracted) before being placed in the in-memory cache and React state.

#### Scenario: Returning to feed tab uses cached data
- **WHEN** the user navigates away from the feed tab and returns
- **THEN** the feed SHALL display the previously fetched articles without making new network requests

#### Scenario: First visit fetches fresh data
- **WHEN** the user opens the feed tab for the first time in a session (no cache exists)
- **THEN** the feed SHALL fetch all enabled feeds and populate the cache

#### Scenario: Full page reload clears cache
- **WHEN** the user performs a full page reload
- **THEN** the feed cache SHALL be cleared and a fresh fetch SHALL occur on next mount

#### Scenario: Unprocessed IDB articles are fixed up before caching
- **WHEN** articles are loaded from IndexedDB and some have `processed !== true` (either `false` or missing)
- **THEN** the feed SHALL run `stripHtml` and `extractLeadingImage` on those articles before placing them in the in-memory cache and React state
- **AND** the in-memory versions SHALL have `processed` set to `true`

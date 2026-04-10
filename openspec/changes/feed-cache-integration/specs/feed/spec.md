## ADDED Requirements

### Requirement: Feed displays cached articles instantly on mount

The feed SHALL read articles from the IndexedDB cache on mount. If cached articles exist, they SHALL be displayed immediately without a loading spinner. A background network fetch SHALL then run to refresh the data. If no cached articles exist, the existing loading spinner behavior SHALL be preserved.

#### Scenario: Cached articles displayed instantly after page reload

- **WHEN** the user reloads the page and the IndexedDB cache contains articles
- **THEN** the feed SHALL display the cached articles immediately without showing a loading spinner

#### Scenario: Background fetch updates displayed articles

- **WHEN** cached articles are displayed and the background network fetch completes
- **THEN** the feed SHALL update to show the fresh articles and upsert them into the IDB cache

#### Scenario: First visit with empty cache shows loading spinner

- **WHEN** the user opens the feed for the first time (no IDB cache)
- **THEN** the feed SHALL show a loading spinner until the network fetch completes

### Requirement: Three-tier cache hierarchy

The feed data layer SHALL use a three-tier cache: L1 (in-memory module variable), L2 (IndexedDB), L3 (network). On mount, L1 SHALL be checked first (synchronous). If L1 is empty, L2 SHALL be read (async). L3 SHALL always run in the background to refresh data.

#### Scenario: L1 cache hit on same-session navigation

- **WHEN** the user navigates away from the feed and returns within the same session
- **THEN** the feed SHALL use the L1 in-memory cache (no IDB read, no network fetch visible to the user)

#### Scenario: L1 empty, L2 cache hit after page reload

- **WHEN** the user reloads the page (L1 is cleared) and IDB contains cached articles
- **THEN** the feed SHALL read from L2 and display articles, then fetch from L3 in the background

#### Scenario: Both L1 and L2 empty

- **WHEN** both the in-memory cache and IDB are empty
- **THEN** the feed SHALL fetch from L3 and show a loading spinner until data arrives

### Requirement: Network fetch upserts into IDB cache

After a successful network fetch, all fetched articles SHALL be upserted into the IndexedDB cache via `upsertMany`. This ensures the cache stays current for future page loads and historical browsing.

#### Scenario: Fresh articles are persisted to IDB

- **WHEN** a network fetch completes successfully
- **THEN** all fetched articles SHALL be written to the IDB cache
- **AND** the eviction logic SHALL run automatically (per the article-cache spec)

### Requirement: Historical day navigation uses cached articles

When the user navigates to a past day, the feed SHALL merge network-fetched articles with IDB-cached articles for the requested date range. The merged set SHALL be deduplicated using the existing deduplication logic.

#### Scenario: Past day with articles only in cache

- **WHEN** the user navigates to a day 5 days ago and the RSS feeds no longer contain those articles but the IDB cache does
- **THEN** the feed SHALL display the cached articles for that day

#### Scenario: Past day with articles in both cache and network

- **WHEN** the user navigates to a past day and articles for that day exist in both the network fetch and the IDB cache
- **THEN** the feed SHALL merge and deduplicate the articles, showing each unique article once

#### Scenario: Past day with no articles anywhere

- **WHEN** the user navigates to a past day and neither the network fetch nor the IDB cache has articles for that day
- **THEN** the feed SHALL display the "No articles for this day" empty state

## MODIFIED Requirements

### Requirement: Feed data is cached in memory across tab switches

The feed SHALL cache fetched articles in memory so that navigating away from the feed tab and returning does not trigger a re-fetch. Cached data SHALL persist for the lifetime of the browser session (until full page reload). On full page reload, the in-memory cache SHALL be cleared but the IndexedDB cache SHALL persist, allowing instant rendering from L2.

#### Scenario: Returning to feed tab uses cached data

- **WHEN** the user navigates away from the feed tab and returns
- **THEN** the feed SHALL display the previously fetched articles without making new network requests

#### Scenario: First visit fetches fresh data

- **WHEN** the user opens the feed tab for the first time in a session (no cache exists)
- **THEN** the feed SHALL fetch all enabled feeds and populate both the in-memory and IDB caches

#### Scenario: Full page reload uses IDB cache

- **WHEN** the user performs a full page reload
- **THEN** the in-memory cache SHALL be cleared but the IDB cache SHALL be read, displaying cached articles instantly before a background refresh

### Requirement: Manual refresh

The feed SHALL cache data across tab switches and provide a refresh button for explicit re-fetch. There is no automatic polling. On first load (empty cache), the feed SHALL fetch automatically. Manual refresh SHALL update both the in-memory and IDB caches.

#### Scenario: Feed loads on page open with empty in-memory cache but populated IDB

- **WHEN** the user opens the feed page and no in-memory cache exists but IDB has articles
- **THEN** the feed SHALL display the IDB-cached articles instantly and fetch fresh data in the background

#### Scenario: Feed loads on page open with existing in-memory cache

- **WHEN** the user opens the feed page and in-memory cached data exists
- **THEN** the feed SHALL display the cached articles without re-fetching

#### Scenario: Refresh button fetches new data

- **WHEN** the user clicks the refresh button
- **THEN** the feed SHALL re-fetch all enabled feeds, update the displayed articles, and update both the in-memory and IDB caches

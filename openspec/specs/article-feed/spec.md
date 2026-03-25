## ADDED Requirements

### Requirement: Feed data is cached in memory across tab switches
The feed SHALL cache fetched articles in memory so that navigating away from the feed tab and returning does not trigger a re-fetch. Cached data SHALL persist for the lifetime of the browser session (until full page reload).

#### Scenario: Returning to feed tab uses cached data
- **WHEN** the user navigates away from the feed tab and returns
- **THEN** the feed SHALL display the previously fetched articles without making new network requests

#### Scenario: First visit fetches fresh data
- **WHEN** the user opens the feed tab for the first time in a session (no cache exists)
- **THEN** the feed SHALL fetch all enabled feeds and populate the cache

#### Scenario: Full page reload clears cache
- **WHEN** the user performs a full page reload
- **THEN** the feed cache SHALL be cleared and a fresh fetch SHALL occur on next mount

### Requirement: Last-refreshed timestamp is displayed
The feed SHALL display a human-readable "last refreshed" timestamp in the filter bar so the user can assess data freshness.

#### Scenario: Timestamp shown after fetch completes
- **WHEN** a feed fetch completes successfully
- **THEN** the filter bar SHALL display the time of the last successful fetch (e.g., "refreshed 2 min ago")

#### Scenario: Timestamp updates on manual refresh
- **WHEN** the user clicks the refresh button and the fetch completes
- **THEN** the last-refreshed timestamp SHALL update to reflect the new fetch time

### Requirement: Feed fetch collects results without shared mutable state
The feed fetch logic SHALL collect results from concurrent feed fetches into independent arrays and merge them only after all promises resolve. The implementation SHALL NOT push into a shared mutable array from concurrent callbacks.

#### Scenario: Concurrent feeds produce correct merged results
- **WHEN** multiple feeds are fetched concurrently
- **THEN** all articles from all successful feeds SHALL appear in the merged result with no missing or duplicated entries due to concurrency

### Requirement: Hidden-IDs Set is memoized in the feed list
The `FeedList` component SHALL memoize the Set of hidden article IDs so it is only recomputed when the hidden-IDs input changes.

#### Scenario: Set is not recreated on unrelated re-renders
- **WHEN** the `FeedList` component re-renders but `hiddenIds` has not changed
- **THEN** the hidden-IDs Set SHALL be the same reference (not a new allocation)

#### Scenario: Set updates when hiddenIds changes
- **WHEN** a new article is hidden or unhidden, changing the `hiddenIds` array
- **THEN** the hidden-IDs Set SHALL be recomputed to reflect the updated list

### Requirement: URL-based duplicate detection
The deduplication logic SHALL treat two articles as duplicates if they share the same `link` value (raw string comparison, no normalization). This check SHALL be OR'd with the existing title+date check — either condition is sufficient to filter an article as a duplicate.

#### Scenario: Articles with same URL but different titles are deduplicated
- **WHEN** two articles from different feeds have the same `link` but different titles
- **THEN** only one article SHALL appear in the feed

#### Scenario: Articles with same URL but different timestamps are deduplicated
- **WHEN** two articles have the same `link` but different `publishedAt` timestamps
- **THEN** only one article SHALL appear in the feed and it SHALL be the one with the most recent timestamp

#### Scenario: Articles with different URLs and same title+date are still deduplicated
- **WHEN** two articles have the same title and publishedAt but different URLs
- **THEN** only one article SHALL appear in the feed (existing behavior preserved)

#### Scenario: Articles with different URLs and different title+date are kept
- **WHEN** two articles have different `link` values and different title+date combinations
- **THEN** both articles SHALL appear in the feed

### Requirement: Youngest article wins on duplicate detection
When duplicates are detected (by either title+date or URL), the article with the most recent `publishedAt` timestamp SHALL be the one retained.

#### Scenario: Newer article is kept over older duplicate
- **WHEN** an article published at 11:00 and an article published at 10:00 share the same URL
- **THEN** the 11:00 article SHALL be retained and the 10:00 article SHALL be filtered out

#### Scenario: Identical timestamps retain first encountered
- **WHEN** two duplicate articles have the exact same `publishedAt` timestamp
- **THEN** one SHALL be retained (deterministic but order is implementation-defined)

## MODIFIED Requirements

### Requirement: Manual refresh
The feed SHALL cache data across tab switches and provide a refresh button for explicit re-fetch. There is no automatic polling. On first load (empty cache), the feed SHALL fetch automatically.

#### Scenario: Feed loads on page open with empty cache
- **WHEN** the user opens the feed page and no cached data exists
- **THEN** the feed SHALL fetch all enabled feeds and display articles

#### Scenario: Feed loads on page open with existing cache
- **WHEN** the user opens the feed page and cached data exists
- **THEN** the feed SHALL display the cached articles without re-fetching

#### Scenario: Refresh button fetches new data
- **WHEN** the user clicks the refresh button
- **THEN** the feed SHALL re-fetch all enabled feeds, update the displayed articles, and update the cache

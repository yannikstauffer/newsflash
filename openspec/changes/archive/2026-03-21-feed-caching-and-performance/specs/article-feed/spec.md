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

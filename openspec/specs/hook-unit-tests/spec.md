## ADDED Requirements

### Requirement: useFeedData deduplication is tested

The test suite SHALL verify that `useFeedData` removes duplicate articles based on the composite key of title and publishedAt timestamp.

#### Scenario: Duplicate articles from different feeds are removed

- **WHEN** two feeds return articles with the same title and publishedAt
- **THEN** `refresh()` SHALL produce a deduplicated list containing each unique article only once

#### Scenario: Articles with same title but different timestamps are kept

- **WHEN** two articles share a title but have different publishedAt values
- **THEN** both articles SHALL appear in the result

### Requirement: useFeedData sorting is tested

The test suite SHALL verify that `useFeedData` sorts articles in reverse chronological order (newest first).

#### Scenario: Articles are sorted newest first

- **WHEN** `refresh()` completes with articles having various timestamps
- **THEN** the articles array SHALL be ordered by publishedAt descending

### Requirement: useFeedData error aggregation is tested

The test suite SHALL verify that `useFeedData` collects per-feed errors without aborting other fetches.

#### Scenario: One feed fails while others succeed

- **WHEN** one feed's `fetchFeed` rejects and another succeeds
- **THEN** the errors array SHALL contain the failed feed's error message AND the articles array SHALL contain the successful feed's articles

#### Scenario: All feeds fail

- **WHEN** all enabled feeds' `fetchFeed` calls reject
- **THEN** the articles array SHALL be empty AND the errors array SHALL contain one entry per failed feed

### Requirement: useFeedData loading state is tested

The test suite SHALL verify correct loading state transitions during refresh.

#### Scenario: Loading is true during fetch and false after

- **WHEN** `refresh()` is called
- **THEN** `loading` SHALL be `true` while fetches are in progress AND `false` after all fetches settle

### Requirement: useFeedData respects feed-enabled filter

The test suite SHALL verify that only feeds for which `isFeedEnabled` returns `true` are fetched.

#### Scenario: Disabled feeds are not fetched

- **WHEN** `isFeedEnabled` returns `false` for a specific feed
- **THEN** `fetchFeed` SHALL NOT be called for that feed's proxyPath

### Requirement: useFeedPreferences toggle is tested

The test suite SHALL verify that `toggleFeed` flips a feed's enabled state.

#### Scenario: Toggling an enabled feed disables it

- **WHEN** `toggleFeed` is called for a feed that is currently enabled (not explicitly `false`)
- **THEN** the feed's value in the store SHALL become `false`

#### Scenario: Toggling a disabled feed enables it

- **WHEN** `toggleFeed` is called for a feed that is explicitly `false`
- **THEN** the feed's value in the store SHALL become `true`

### Requirement: useFeedPreferences language setting is tested

The test suite SHALL verify that `setLanguage` updates the language preference.

#### Scenario: Changing language preference

- **WHEN** `setLanguage("de")` is called
- **THEN** the `language` return value SHALL be `"de"`

#### Scenario: Default language is "all"

- **WHEN** the hook initializes with an empty store
- **THEN** the `language` return value SHALL be `"all"`

### Requirement: useFeedPreferences bulk set is tested

The test suite SHALL verify that `setAllForSource` sets multiple feeds at once.

#### Scenario: Disabling all feeds for a source

- **WHEN** `setAllForSource(["feed-a", "feed-b"], false)` is called
- **THEN** `isFeedEnabled("feed-a")` and `isFeedEnabled("feed-b")` SHALL both return `false`

### Requirement: useFeedPreferences isFeedEnabled default is tested

The test suite SHALL verify that feeds default to enabled when not present in the store.

#### Scenario: Unknown feed is enabled by default

- **WHEN** `isFeedEnabled` is called with a feedId not present in the store
- **THEN** the result SHALL be `true`

### Requirement: useLazyList edge cases are tested

The existing test suite SHALL be extended with edge cases.

#### Scenario: Empty items array

- **WHEN** `useLazyList` is called with an empty array
- **THEN** `visibleItems` SHALL be an empty array

#### Scenario: Batch size of 1

- **WHEN** `useLazyList` is called with 3 items and batchSize 1
- **THEN** `visibleItems` SHALL initially contain exactly 1 item AND each intersection SHALL add exactly 1 more item

#### Scenario: Sentinel ref receives null

- **WHEN** `sentinelRef(null)` is called
- **THEN** no IntersectionObserver SHALL be created and no error SHALL be thrown

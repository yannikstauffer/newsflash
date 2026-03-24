## Requirements

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

### Requirement: useArticleState branch coverage meets threshold
The test suite SHALL cover all branching paths in `useArticleState` to achieve at least 80% branch coverage. Currently at 72.72% branches — missing coverage for `unhideArticles`, `clearReadList`, `restoreReadList` (capacity overflow branch), and the `readListArticles`/`readListIds` derived memos.

#### Scenario: unhideArticles removes multiple IDs
- **WHEN** `unhideArticles` is called with an array of IDs
- **THEN** all specified IDs SHALL be removed from `hiddenIds`

#### Scenario: unhideArticles with IDs not in the list
- **WHEN** `unhideArticles` is called with IDs that are not hidden
- **THEN** `hiddenIds` SHALL remain unchanged

#### Scenario: clearReadList empties the read list
- **WHEN** `clearReadList` is called
- **THEN** `readListArticles` SHALL be an empty array AND `readListIds` SHALL be an empty array

#### Scenario: restoreReadList adds articles without duplicates
- **WHEN** `restoreReadList` is called with articles, some already in the read list
- **THEN** only new articles SHALL be prepended and duplicates SHALL be skipped

#### Scenario: restoreReadList caps at MAX_READLIST_ITEMS
- **WHEN** `restoreReadList` is called with enough articles to exceed MAX_READLIST_ITEMS
- **THEN** the resulting read list SHALL be truncated to MAX_READLIST_ITEMS

#### Scenario: readListIds reflects stored article IDs
- **WHEN** articles are added to the read list
- **THEN** `readListIds` SHALL contain exactly the IDs of stored articles in order

#### Scenario: readListArticles deserializes stored articles
- **WHEN** articles are added to the read list
- **THEN** `readListArticles` SHALL contain NormalizedArticle objects with `publishedAt` as Date instances

### Requirement: extract-leading-image branch coverage meets threshold
The test suite SHALL cover the uncovered branches in `extract-leading-image.ts` to achieve at least 80% branch coverage.

#### Scenario: Input with no images returns undefined
- **WHEN** `extractLeadingImage` is called with HTML containing no `<img>` tags
- **THEN** it SHALL return undefined

#### Scenario: Image with empty src is skipped
- **WHEN** `extractLeadingImage` is called with HTML containing an `<img>` with empty `src`
- **THEN** that image SHALL be skipped and the function SHALL return the next valid image or undefined

#### Scenario: Image with relative URL is resolved
- **WHEN** `extractLeadingImage` is called with HTML containing an `<img>` with a relative `src` and a base URL is provided
- **THEN** the returned URL SHALL be the resolved absolute URL

#### Scenario: Image with data URI is skipped
- **WHEN** `extractLeadingImage` is called with an `<img>` whose `src` is a data URI
- **THEN** that image SHALL be skipped

### Requirement: feed-config-page function coverage meets threshold
The test suite SHALL cover uncovered functions in `feed-config-page.tsx` to achieve at least 80% function coverage.

#### Scenario: All feed groups are rendered
- **WHEN** `FeedConfigPage` is rendered with multiple connector groups
- **THEN** each group SHALL be displayed as a section with its feeds

#### Scenario: Language selector triggers preference change
- **WHEN** the language select value is changed
- **THEN** the `i18n.changeLanguage` function SHALL be called with the new language

#### Scenario: Theme toggle updates preference
- **WHEN** the theme toggle is clicked
- **THEN** the theme preference SHALL be toggled between light and dark

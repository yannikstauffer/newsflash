# Feed Filtering

## From: feed-filtering/spec.md

## MODIFIED Requirements

### Requirement: Filters combine with AND logic
All active filters (show hidden, search, connector article filters) SHALL be combined with AND logic.

#### Scenario: Multiple filters applied
- **WHEN** the user has "show hidden" on AND types "apple" in search
- **THEN** only articles matching "apple" (including hidden ones) SHALL be displayed

#### Scenario: Connector filter combined with search
- **WHEN** a connector filter is disabled (excluding matching articles) AND the user searches
- **THEN** articles matching the disabled filter SHALL be excluded regardless of search match

## From: feed-configuration/spec.md

## ADDED Requirements

### Requirement: Filter toggles in settings UI
The feed configuration page SHALL display a "Filters" sub-section under each connector that has filters defined. Each filter SHALL be rendered as a checkbox with the same styling and semantic as feed toggles: checked means content is shown, unchecked means content is hidden.

#### Scenario: Connector with filters shows filter section
- **WHEN** the user opens settings and a connector has filters defined
- **THEN** a filter section SHALL appear below the connector's feed list, with one checkbox per filter

#### Scenario: Connector without filters shows no filter section
- **WHEN** the user opens settings and a connector has no filters defined
- **THEN** no filter section SHALL be rendered for that connector

#### Scenario: SRF shows filter section with category filters
- **WHEN** the user opens settings
- **THEN** the SRF connector SHALL display a "Filter" section with toggles for Sport, Kultur, and Wissen

#### Scenario: Filter checkbox reflects current state
- **WHEN** a filter is enabled
- **THEN** its checkbox SHALL be checked

#### Scenario: Filter checkbox uses filter label
- **WHEN** a filter is rendered
- **THEN** the checkbox label SHALL display the filter's `label` property (in source language)

#### Scenario: Toggling filter updates preferences
- **WHEN** the user toggles a filter checkbox
- **THEN** the filter preference SHALL be updated in localStorage and the feed SHALL update accordingly

## From: feed-page-orchestration/spec.md

## ADDED Requirements

### Requirement: Feed page state encapsulated in a custom hook
All feed page state management, callbacks, and side effects SHALL be encapsulated in a `useFeedPage()` custom hook. The `FeedPage` component SHALL only contain JSX rendering.

#### Scenario: FeedPage delegates all logic to useFeedPage
- **WHEN** the `FeedPage` component renders
- **THEN** it SHALL call `useFeedPage()` and use only the returned values for rendering, with no inline state management or `useCallback`/`useEffect` calls

### Requirement: useFeedPage provides complete feed page API
The `useFeedPage()` hook SHALL return all values and callbacks needed by the FeedPage JSX: filtered articles, loading/error state, filter bar props, article action render functions, and wrapper render functions.

#### Scenario: Hook returns filter bar state
- **WHEN** `useFeedPage()` is called
- **THEN** it SHALL return `showHidden`, `searchQuery`, `selectedDate`, `allArticles`, `isToday`, and callbacks for toggling/navigating these values

#### Scenario: Hook returns article list state
- **WHEN** `useFeedPage()` is called
- **THEN** it SHALL return `filteredArticles`, `loading`, `errors`, `hiddenIds`, and render functions for article actions and wrappers

### Requirement: Feed data refresh on mount with stable reference
The `useFeedPage()` hook SHALL trigger a feed data refresh on mount. The refresh function SHALL have a stable reference so no ESLint rule suppression is needed.

#### Scenario: Refresh triggers on mount without eslint-disable
- **WHEN** the hook mounts
- **THEN** it SHALL call `refresh()` once, and the `useEffect` SHALL include `refresh` in its dependency array without an `eslint-disable` comment

### Requirement: Hover tracking without a11y rule suppression
Hover tracking for keyboard shortcuts SHALL be implemented without requiring `eslint-disable jsx-a11y/no-static-element-interactions`.

#### Scenario: Hover tracking uses appropriate element semantics
- **WHEN** an article card is rendered with hover tracking
- **THEN** the hover tracking element SHALL either use an interactive HTML element or attach hover listeners via a ref, avoiding the need for a11y rule suppression

## From: feed-page-hook-tests/spec.md

## Requirements

### Requirement: useFeedPage filtering logic is tested
The test suite SHALL verify that `useFeedPage` returns `filteredArticles` based on the combined filter state (source enabled, hidden, search query, day selection, all-articles toggle).

#### Scenario: Articles are filtered by day when allArticles is false
- **WHEN** `useFeedPage` is rendered with articles spanning multiple days and `allArticles` is false
- **THEN** `feedListProps.filteredArticles` SHALL contain only articles matching the selected date

#### Scenario: All articles are returned when allArticles is true
- **WHEN** the `onToggleAllArticles` callback is invoked to enable all-articles mode
- **THEN** `feedListProps.filteredArticles` SHALL contain articles from all dates

#### Scenario: Search query filters articles
- **WHEN** `onSearchChange` is called with a search term
- **THEN** `feedListProps.filteredArticles` SHALL contain only articles matching the search query

### Requirement: useFeedPage day navigation is tested
The test suite SHALL verify the day navigation callbacks and `isToday` computation.

#### Scenario: Previous day navigates backward
- **WHEN** `onPrev` is called
- **THEN** `selectedDate` SHALL be one day earlier than the initial date

#### Scenario: Next day navigates forward
- **WHEN** `onNext` is called from a past date
- **THEN** `selectedDate` SHALL be one day later

#### Scenario: isToday is true on current date
- **WHEN** `useFeedPage` is rendered with today's date selected
- **THEN** `filterBarProps.isToday` SHALL be true

#### Scenario: isToday is false on past date
- **WHEN** `onPrev` is called to navigate to yesterday
- **THEN** `filterBarProps.isToday` SHALL be false

### Requirement: useFeedPage toggle allArticles resets date
The test suite SHALL verify that toggling allArticles off resets the selected date to today.

#### Scenario: Toggling allArticles off resets to today
- **WHEN** `onToggleAllArticles` is called twice (on then off) after navigating to a past date
- **THEN** `selectedDate` SHALL be today's date

### Requirement: useFeedPage article and hidden counts are tested
The test suite SHALL verify `articleCount` and `hiddenCount` in `filterBarProps`.

#### Scenario: Article count excludes hidden when showHidden is true
- **WHEN** `showHidden` is toggled on and some articles are hidden
- **THEN** `articleCount` SHALL be the count of non-hidden articles and `hiddenCount` SHALL be the count of hidden articles

#### Scenario: Article count includes all when showHidden is false
- **WHEN** `showHidden` is false (default)
- **THEN** `articleCount` SHALL be the total filtered article count and `hiddenCount` SHALL be 0

### Requirement: useFeedPage keyboard hide callback is tested
The test suite SHALL verify the `handleKeyboardHide` behavior wired through `useArticleKeyboardShortcuts`.

#### Scenario: Keyboard hide triggers card removal animation when card ref exists
- **WHEN** the keyboard hide callback is invoked for an article with a registered SwipeableCardHandle
- **THEN** `triggerRemoval("right")` SHALL be called on the card handle

#### Scenario: Keyboard hide falls back to hideArticle when no card ref
- **WHEN** the keyboard hide callback is invoked for an article without a card handle
- **THEN** `hideArticle` SHALL be called with the article ID

### Requirement: useFeedPage keyboard save callback is tested
The test suite SHALL verify the save-via-keyboard behavior.

#### Scenario: Keyboard save does nothing if article not found
- **WHEN** the save callback is invoked with an article ID not in the current list
- **THEN** no action SHALL be taken

#### Scenario: Keyboard save does nothing if already in read list
- **WHEN** the save callback is invoked for an article already in the read list
- **THEN** no action SHALL be taken

#### Scenario: Keyboard save triggers card removal when card ref exists
- **WHEN** the save callback is invoked for a valid article with a registered card handle
- **THEN** `triggerRemoval("left")` SHALL be called on the card handle

#### Scenario: Keyboard save adds to read list when no card ref
- **WHEN** the save callback is invoked for a valid article without a card handle
- **THEN** `addToReadList` SHALL be called with the article AND `hideArticle` SHALL be called with the article ID

### Requirement: useFeedPage renderActions is tested
The test suite SHALL verify the `renderActions` callback produces correct action components.

#### Scenario: Hidden article shows unhide action
- **WHEN** `showHidden` is true and the article is hidden
- **THEN** `renderActions` SHALL return a `HiddenArticleActions` element

#### Scenario: Normal article shows action buttons
- **WHEN** `showHidden` is false or the article is not hidden
- **THEN** `renderActions` SHALL return an `ArticleActionButtons` element

### Requirement: useFeedPage hideAll callback is tested
The test suite SHALL verify the `onHideAll` callback hides all visible article IDs.

#### Scenario: Hide all invokes hideArticles with visible IDs
- **WHEN** `onHideAll` is called
- **THEN** `hideArticles` SHALL be called with the current `visibleArticleIds`

### Requirement: useFeedPage emptyMessage is tested
The test suite SHALL verify the empty message logic.

#### Scenario: Empty message shown when not in allArticles mode and not loading
- **WHEN** `allArticles` is false and `loading` is false
- **THEN** `feedListProps.emptyMessage` SHALL be the translated `feed.emptyDay` string

#### Scenario: No empty message when in allArticles mode
- **WHEN** `allArticles` is true
- **THEN** `feedListProps.emptyMessage` SHALL be undefined

#### Scenario: No empty message when loading
- **WHEN** `loading` is true
- **THEN** `feedListProps.emptyMessage` SHALL be undefined

## From: hook-unit-tests/spec.md

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
The test suite SHALL cover all branching paths in `useArticleState` to achieve at least 80% branch coverage. Currently at 72.72% branches -- missing coverage for `unhideArticles`, `clearReadList`, `restoreReadList` (capacity overflow branch), and the `readListArticles`/`readListIds` derived memos.

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

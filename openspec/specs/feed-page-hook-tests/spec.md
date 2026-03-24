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

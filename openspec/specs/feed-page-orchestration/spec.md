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

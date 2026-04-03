## MODIFIED Requirements

### Requirement: Feed page state encapsulated in a custom hook
All feed page state management, callbacks, and side effects SHALL be encapsulated in a `useFeedPage()` custom hook. The `FeedPage` component SHALL only contain JSX rendering. View state (`selectedDate`, `allArticles`, `searchQuery`, `showHidden`) SHALL be derived from URL search params via `Route.useSearch()` instead of React `useState`.

#### Scenario: FeedPage delegates all logic to useFeedPage
- **WHEN** the `FeedPage` component renders
- **THEN** it SHALL call `useFeedPage()` and use only the returned values for rendering, with no inline state management or `useCallback`/`useEffect` calls

#### Scenario: View state is read from URL search params
- **WHEN** `useFeedPage()` is called
- **THEN** it SHALL derive `selectedDate`, `allArticles`, `searchQuery`, and `showHidden` from the route's search params, not from `useState`

#### Scenario: State mutations update URL
- **WHEN** any view state callback is invoked (day navigation, toggle all articles, search change, toggle hidden)
- **THEN** the hook SHALL call `navigate({ search: ... })` to update the URL search params instead of calling `setState`

### Requirement: useFeedPage provides complete feed page API
The `useFeedPage()` hook SHALL return all values and callbacks needed by the FeedPage JSX: filtered articles, loading/error state, filter bar props, article action render functions, and wrapper render functions.

#### Scenario: Hook returns filter bar state
- **WHEN** `useFeedPage()` is called
- **THEN** it SHALL return `showHidden`, `searchQuery`, `selectedDate`, `allArticles`, `isToday`, and callbacks for toggling/navigating these values

#### Scenario: Hook returns article list state
- **WHEN** `useFeedPage()` is called
- **THEN** it SHALL return `filteredArticles`, `loading`, `errors`, `hiddenIds`, and render functions for article actions and wrappers

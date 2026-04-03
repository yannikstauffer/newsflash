## ADDED Requirements

### Requirement: Non-critical views are lazily loaded
The system SHALL load `ReadListPage` and `FeedConfigPage` on demand using `React.lazy` with dynamic `import()` expressions. These view components MUST NOT be included in the initial JavaScript bundle.

#### Scenario: Initial page load includes only the feed view
- **WHEN** the app loads for the first time
- **THEN** only the `FeedPage` component and its dependencies are included in the initial bundle
- **AND** `ReadListPage` and `FeedConfigPage` are in separate chunks

#### Scenario: Navigating to a lazy-loaded view triggers chunk download
- **WHEN** the user switches to the "Read List" or "Settings" view for the first time
- **THEN** the browser fetches the corresponding chunk file
- **AND** the view renders after the chunk has loaded

### Requirement: Loading fallback during lazy view resolution
The system SHALL display a loading spinner fallback inside a `Suspense` boundary while a lazily-loaded view component is being fetched and resolved.

#### Scenario: Spinner displays while chunk loads
- **WHEN** the user navigates to a lazy-loaded view that has not yet been fetched
- **THEN** a centered loading spinner is displayed in the main content area
- **AND** the app header and navigation remain visible and interactive

#### Scenario: Spinner disappears after chunk loads
- **WHEN** the lazy-loaded chunk finishes loading
- **THEN** the spinner is replaced by the rendered view component

### Requirement: Feed page remains eagerly loaded
The system SHALL keep `FeedPage` as a static import so it is always available in the initial bundle without a loading state.

#### Scenario: Feed view renders immediately on app start
- **WHEN** the app starts and the default "Feed" view is active
- **THEN** `FeedPage` renders without displaying a loading spinner

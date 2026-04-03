## MODIFIED Requirements

### Requirement: URL-based route navigation
The application SHALL provide URL-based navigation using TanStack Router. Each view MUST be accessible via a distinct URL path, and navigating between views MUST update the browser URL. The feed route (`/`) SHALL additionally support validated search params for view state.

#### Scenario: Feed page at root URL
- **WHEN** the user navigates to `/`
- **THEN** the application SHALL render the `FeedPage` component with default view state (today, day view, no search, hidden off)

#### Scenario: Feed page with search params
- **WHEN** the user navigates to `/?date=2026-04-03&q=test`
- **THEN** the application SHALL render the `FeedPage` component with the date set to April 3, 2026 and search query "test"

#### Scenario: Read list page at /read-list
- **WHEN** the user navigates to `/read-list`
- **THEN** the application SHALL render the `ReadListPage` component

#### Scenario: Settings page at /settings
- **WHEN** the user navigates to `/settings`
- **THEN** the application SHALL render the `FeedConfigPage` component

#### Scenario: Navigation updates URL
- **WHEN** the user clicks a navigation link in the nav bar
- **THEN** the browser URL MUST update to the corresponding route path without a full page reload

### Requirement: Deep linking
The application SHALL support deep linking so that users can directly access any view via its URL, including feed page view state encoded in search params.

#### Scenario: Direct URL access to feed with date
- **WHEN** the user enters `/?date=2026-04-01` directly in the browser address bar
- **THEN** the application SHALL render the `FeedPage` with articles for April 1, 2026

#### Scenario: Direct URL access to read list
- **WHEN** the user enters `/read-list` directly in the browser address bar
- **THEN** the application SHALL render the `ReadListPage` component without requiring navigation from another view

#### Scenario: Direct URL access to settings
- **WHEN** the user enters `/settings` directly in the browser address bar
- **THEN** the application SHALL render the `FeedConfigPage` component without requiring navigation from another view

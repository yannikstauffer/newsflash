## ADDED Requirements

### Requirement: URL-based route navigation
The application SHALL provide URL-based navigation using TanStack Router. Each view MUST be accessible via a distinct URL path, and navigating between views MUST update the browser URL.

#### Scenario: Feed page at root URL
- **WHEN** the user navigates to `/`
- **THEN** the application SHALL render the `FeedPage` component

#### Scenario: Read list page at /read-list
- **WHEN** the user navigates to `/read-list`
- **THEN** the application SHALL render the `ReadListPage` component

#### Scenario: Settings page at /settings
- **WHEN** the user navigates to `/settings`
- **THEN** the application SHALL render the `FeedConfigPage` component

#### Scenario: Navigation updates URL
- **WHEN** the user clicks a navigation link in the nav bar
- **THEN** the browser URL MUST update to the corresponding route path without a full page reload

### Requirement: Browser history support
The application SHALL integrate with the browser history API so that back and forward navigation works correctly between views.

#### Scenario: Browser back navigation
- **WHEN** the user navigates from `/` to `/read-list` and then presses the browser back button
- **THEN** the application SHALL navigate back to `/` and render the `FeedPage` component

#### Scenario: Browser forward navigation
- **WHEN** the user presses the browser back button and then presses the browser forward button
- **THEN** the application SHALL navigate forward to the previously visited route and render the corresponding component

### Requirement: Deep linking
The application SHALL support deep linking so that users can directly access any view via its URL.

#### Scenario: Direct URL access to read list
- **WHEN** the user enters `/read-list` directly in the browser address bar
- **THEN** the application SHALL render the `ReadListPage` component without requiring navigation from another view

#### Scenario: Direct URL access to settings
- **WHEN** the user enters `/settings` directly in the browser address bar
- **THEN** the application SHALL render the `FeedConfigPage` component without requiring navigation from another view

### Requirement: Not-found route handling
The application SHALL handle navigation to undefined routes by redirecting to the root route.

#### Scenario: Unknown path redirects to feed
- **WHEN** the user navigates to an undefined path such as `/unknown`
- **THEN** the application SHALL redirect to `/` and render the `FeedPage` component

### Requirement: Lazy-loaded route components
The application SHALL lazy load non-critical route components to reduce the initial JavaScript bundle size.

#### Scenario: ReadListPage is lazy loaded
- **WHEN** the application starts and the user is on the `/` route
- **THEN** the `ReadListPage` component module SHALL NOT be included in the initial bundle and SHALL be loaded only when the user navigates to `/read-list`

#### Scenario: FeedConfigPage is lazy loaded
- **WHEN** the application starts and the user is on the `/` route
- **THEN** the `FeedConfigPage` component module SHALL NOT be included in the initial bundle and SHALL be loaded only when the user navigates to `/settings`

### Requirement: Active navigation link indicator
The navigation bar SHALL visually indicate which route is currently active using styling consistent with the existing design.

#### Scenario: Active link styling
- **WHEN** the user is on the `/read-list` route
- **THEN** the Read List navigation link SHALL display with the active style (border-b-2, primary color, foreground text) and all other links SHALL display with the inactive style

#### Scenario: Accessible current page indicator
- **WHEN** a navigation link corresponds to the current route
- **THEN** the link element SHALL have `aria-current="page"` set for accessibility

### Requirement: Navigation links use anchor elements
Navigation items SHALL be rendered as `<a>` elements (via TanStack Router `<Link>`) instead of `<button>` elements, providing proper semantic HTML for navigation.

#### Scenario: Links have href attributes
- **WHEN** the navigation bar is rendered
- **THEN** each navigation item SHALL be an `<a>` element with an `href` attribute matching its route path

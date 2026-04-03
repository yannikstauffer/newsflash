## ADDED Requirements

### Requirement: Skip-to-content link
The application SHALL provide a visually-hidden skip-to-content link as the first focusable element in the page. The link MUST become visible when it receives keyboard focus and MUST navigate focus to the main content area.

#### Scenario: Skip link is hidden by default
- **WHEN** the page loads
- **THEN** the skip-to-content link is not visible on screen

#### Scenario: Skip link appears on keyboard focus
- **WHEN** a keyboard user presses Tab from the browser chrome
- **THEN** the skip-to-content link becomes visible at the top of the page

#### Scenario: Skip link moves focus to main content
- **WHEN** the user activates the skip-to-content link
- **THEN** focus moves to the `<main>` element, bypassing the navigation bar

### Requirement: OS color-scheme preference as default theme
The theme system SHALL use the operating system's `prefers-color-scheme` media query to determine the default theme when no user preference is stored in localStorage.

#### Scenario: Dark mode OS preference with no saved theme
- **WHEN** the user has OS dark mode enabled and no theme value exists in localStorage
- **THEN** the application renders in dark mode

#### Scenario: Light mode OS preference with no saved theme
- **WHEN** the user has OS light mode enabled and no theme value exists in localStorage
- **THEN** the application renders in light mode

#### Scenario: Saved preference overrides OS preference
- **WHEN** the user has previously saved a theme preference in localStorage
- **THEN** the saved preference is used regardless of the OS setting

### Requirement: Day navigation chevron semantics match visual direction
The day navigation buttons SHALL have aria-labels and click handlers that match the visual direction of their chevron icons in LTR layouts. The left-pointing chevron MUST navigate to the previous day and the right-pointing chevron MUST navigate to the next day.

#### Scenario: Left chevron navigates to previous day
- **WHEN** the user activates the left-pointing chevron button
- **THEN** the selected date changes to the previous day and the button is labelled "Previous day"

#### Scenario: Right chevron navigates to next day
- **WHEN** the user activates the right-pointing chevron button
- **THEN** the selected date changes to the next day and the button is labelled "Next day"

### Requirement: Search input character limit
The search input SHALL enforce a maximum character length of 200 to prevent unbounded input.

#### Scenario: Input respects maxLength
- **WHEN** the user types into the search input
- **THEN** the input does not accept more than 200 characters

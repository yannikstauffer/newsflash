## MODIFIED Requirements

### Requirement: Simplified single-row filter bar
The filter bar SHALL use a two-row layout. Row 1 SHALL contain the article counter (left-aligned), the "All articles" toggle, "Show hidden" toggle, and search input. Row 2 SHALL contain the centered day navigation (`< date >`), visible only when "All articles" is not active. The refresh status SHALL NOT appear in the filter bar — it SHALL be rendered outside the filter bar in the parent page. Source pills and language selector SHALL NOT appear on the feed page.

#### Scenario: Filter bar rendering
- **WHEN** the filter bar is displayed with day navigation visible
- **THEN** row 1 SHALL show article counter on the left, followed by toggle buttons and search
- **AND** row 2 SHALL show the date navigator centered, with the "Previous day" button (left chevron) on the left and the "Next day" button (right chevron) on the right

#### Scenario: Toggle ordering
- **WHEN** the filter bar is displayed
- **THEN** the "All articles" toggle SHALL appear to the left of the "Hidden" toggle

#### Scenario: Day navigation centering
- **WHEN** the filter bar is displayed and "All articles" is not active
- **THEN** the prev/date/next controls SHALL be visually centered within row 2

#### Scenario: Day navigation hidden when all articles active
- **WHEN** "All articles" toggle is active
- **THEN** row 2 SHALL NOT be displayed

#### Scenario: Next day button disabled when on today
- **WHEN** the selected date is today
- **THEN** the "Next day" button SHALL be disabled

#### Scenario: Mobile view
- **WHEN** the filter bar is displayed on a mobile viewport
- **THEN** row 1 SHALL show article counter, icon-only toggle buttons, and a search icon button
- **AND** row 2 SHALL show centered day navigation (when visible)

### Requirement: Search input with clear affordance
The search input SHALL include a visible search icon on the left, a clear button (x) when text is present or input has focus, and expand to fill available horizontal space on desktop.

#### Scenario: Search input display
- **WHEN** the filter bar is rendered on desktop
- **THEN** the search input SHALL display with a search icon prefix, clear button, and fill remaining space

#### Scenario: Search input on mobile
- **WHEN** the filter bar is rendered on mobile
- **THEN** the search SHALL be represented by an icon button that expands on tap

## ADDED Requirements

### Requirement: Search icon button matches toggle button styling
The mobile search icon button SHALL use the same visual styling as the "All articles" and "Hidden" toggle buttons: `outline` variant with `rounded-full` border radius. It SHALL NOT use the `ghost` variant.

#### Scenario: Search icon button visual consistency
- **WHEN** the filter bar is rendered on mobile
- **THEN** the search icon button SHALL have a visible border and pill shape matching the toggle buttons

### Requirement: Icon centering in mobile toggle buttons
Toggle button icons SHALL be horizontally centered within the button on mobile viewports where the text label is hidden. Padding SHALL be symmetric when the button is in icon-only mode.

#### Scenario: Toggle button icon alignment on mobile
- **WHEN** toggle buttons are displayed on a mobile viewport with hidden text labels
- **THEN** the icon SHALL be visually centered horizontally within the button

### Requirement: Refresh timestamp wording
The refresh timestamp SHALL display "Refreshed just now" (not "Refreshed now") when the last refresh occurred less than 60 seconds ago.

#### Scenario: Recent refresh display
- **WHEN** the last refresh occurred less than 60 seconds ago
- **THEN** the displayed text SHALL be "Refreshed just now"

## ADDED Requirements

### Requirement: Simplified single-row filter bar
The filter bar SHALL use a two-row layout. Row 1 SHALL contain the refresh status (left-aligned), the "All articles" toggle, "Show hidden" toggle, and search input. Row 2 SHALL contain the centered day navigation (`◀ date ▶`), visible only when "All articles" is not active. The refresh status SHALL NOT appear at the end of the bar. Source pills and language selector SHALL NOT appear on the feed page.

#### Scenario: Filter bar rendering
- **WHEN** the filter bar is displayed with day navigation visible
- **THEN** row 1 SHALL show refresh status on the left, followed by toggle buttons and search
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
- **THEN** row 1 SHALL show status text, icon-only toggle buttons, and a search icon button
- **AND** row 2 SHALL show centered day navigation (when visible)

### Requirement: Search input with clear affordance
The search input SHALL include a visible search icon on the left, a clear button (✕) when text is present or input has focus, and expand to fill available horizontal space on desktop.

#### Scenario: Search input display
- **WHEN** the filter bar is rendered on desktop
- **THEN** the search input SHALL display with a search icon prefix, clear button, and fill remaining space

#### Scenario: Search input on mobile
- **WHEN** the filter bar is rendered on mobile
- **THEN** the search SHALL be represented by an icon button that expands on tap

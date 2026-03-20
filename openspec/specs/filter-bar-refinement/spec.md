## ADDED Requirements

### Requirement: Simplified single-row filter bar
The filter bar SHALL contain the "All articles" toggle, "Show hidden" toggle, date navigator, and search input. The date navigator SHALL render the "Next day" button on the left and the "Previous day" button on the right. The refresh button SHALL NOT appear. Source pills and language selector SHALL NOT appear on the feed page.

#### Scenario: Filter bar rendering
- **WHEN** the filter bar is displayed with day navigation visible
- **THEN** it SHALL show the date navigator with the "Next day" button (right chevron icon) on the left side of the date label, and the "Previous day" button (left chevron icon) on the right side of the date label

#### Scenario: Toggle ordering
- **WHEN** the filter bar is displayed
- **THEN** the "All articles" toggle SHALL appear to the left of the "Hidden" toggle

#### Scenario: Day navigation centering
- **WHEN** the filter bar is displayed and "All articles" is not active
- **THEN** the prev/date/next controls SHALL be visually centered within the bar

#### Scenario: Day navigation hidden when all articles active
- **WHEN** "All articles" toggle is active
- **THEN** the prev/date/next controls SHALL NOT be displayed

#### Scenario: Next day button disabled when on today
- **WHEN** the selected date is today
- **THEN** the "Next day" button (left position) SHALL be disabled

#### Scenario: Mobile view
- **WHEN** the filter bar is displayed on a mobile viewport
- **THEN** the controls SHALL fit in a single row, with the search input filling remaining space

### Requirement: Search input with clear affordance
The search input SHALL include a visible search icon on the left and expand to fill available horizontal space.

#### Scenario: Search input display
- **WHEN** the filter bar is rendered
- **THEN** the search input SHALL display with a search icon prefix and fill remaining space

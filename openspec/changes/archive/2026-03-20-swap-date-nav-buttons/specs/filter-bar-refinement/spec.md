## MODIFIED Requirements

### Requirement: Simplified single-row filter bar
The filter bar SHALL contain the "All articles" toggle, "Show hidden" toggle, date navigator, and search input. The date navigator SHALL render the "Next day" button on the left and the "Previous day" button on the right.

#### Scenario: Filter bar rendering
- **WHEN** the filter bar is displayed with day navigation visible
- **THEN** it SHALL show the date navigator with the "Next day" button (right chevron icon) on the left side of the date label, and the "Previous day" button (left chevron icon) on the right side of the date label

#### Scenario: Next day button disabled when on today
- **WHEN** the selected date is today
- **THEN** the "Next day" button (left position) SHALL be disabled

#### Scenario: Mobile view
- **WHEN** the filter bar is displayed on a mobile viewport
- **THEN** the controls SHALL fit in a single row, with the search input filling remaining space
